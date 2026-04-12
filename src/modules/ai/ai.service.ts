import { prisma } from "../../lib/prisma";
import { TutorFilter, tutorService } from "../tutor/tutor.service";
import {
  ChatAssistantPayload,
  ChatAssistantResponse,
  ChatIntent,
  ChatQuickAction,
  ChatTutorSuggestion,
  RecommendationLabel,
  ReviewInsightsResponse,
  SentimentClassification,
  TutorRecommendation,
  TutorRecommendationResponse,
} from "./ai.types";

type TutorListItem = Awaited<
  ReturnType<typeof tutorService.getAllTutors>
>["data"][number];

type TutorDetails = NonNullable<Awaited<ReturnType<typeof tutorService.getTutorById>>>;

type TutorRecord = TutorListItem | TutorDetails;

type HuggingFacePrediction = {
  label?: string;
  score?: number;
};

const recommendationWeights = {
  categoryMatch: 0.32,
  rating: 0.24,
  reviewCount: 0.12,
  affordability: 0.14,
  interestHistory: 0.12,
  verification: 0.06,
} as const;

const huggingFaceModel =
  "cardiffnlp/twitter-roberta-base-sentiment-latest";

const defaultQuickActions: ChatQuickAction[] = [
  {
    label: "Find Tutor",
    message: "Find me a tutor for math with strong reviews.",
  },
  {
    label: "Booking Help",
    message: "How do I book or manage a tutoring session?",
  },
  {
    label: "Become a Tutor",
    message: "How can I register as a tutor on SkillBridge?",
  },
  {
    label: "Top Rated Tutors",
    message: "Show me top rated tutors.",
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Number(value.toFixed(3));
}

function normalizeTutor(tutor: TutorRecord) {
  const tutorRecord = tutor as TutorRecord & {
    tutorCategories?: Array<{
      category: {
        id: string;
        name: string;
        isActive?: boolean;
      };
    }>;
  };
  const { tutorCategories, ...rest } = tutorRecord;

  return {
    ...rest,
    categories: Array.isArray(tutorCategories)
      ? tutorCategories.map((item) => item.category)
      : [],
  };
}

type NormalizedTutor = ReturnType<typeof normalizeTutor>;

function normalizeAffordability(
  hourlyRate: number,
  minRate: number,
  maxRate: number,
) {
  if (maxRate <= minRate) {
    return 0.7;
  }

  return clamp(1 - (hourlyRate - minRate) / (maxRate - minRate));
}

function normalizeReviewCount(totalReviews: number, maxReviews: number) {
  if (maxReviews <= 0) {
    return totalReviews > 0 ? 0.5 : 0;
  }

  return clamp(Math.log1p(totalReviews) / Math.log1p(maxReviews));
}

async function getStudentSignals(studentId?: string | null) {
  if (!studentId) {
    return {
      interestWeights: new Map<string, number>(),
      tutorHistoryWeights: new Map<string, number>(),
      interestCategories: [] as string[],
      personalized: false,
    };
  }

  const bookings = await prisma.booking.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      category: true,
      tutor: {
        select: {
          id: true,
        },
      },
    },
  });

  if (bookings.length === 0) {
    return {
      interestWeights: new Map<string, number>(),
      tutorHistoryWeights: new Map<string, number>(),
      interestCategories: [] as string[],
      personalized: false,
    };
  }

  const interestWeights = new Map<string, number>();
  const tutorHistoryWeights = new Map<string, number>();

  bookings.forEach((booking, index) => {
    const recencyBoost = clamp(1.2 - index * 0.08, 0.6, 1.2);
    interestWeights.set(
      booking.category.id,
      (interestWeights.get(booking.category.id) ?? 0) + recencyBoost,
    );
    tutorHistoryWeights.set(
      booking.tutor.id,
      (tutorHistoryWeights.get(booking.tutor.id) ?? 0) + recencyBoost,
    );
  });

  const interestCategories = bookings
    .map((booking) => booking.category.name)
    .filter((name, index, names) => names.indexOf(name) === index)
    .slice(0, 3);

  return {
    interestWeights,
    tutorHistoryWeights,
    interestCategories,
    personalized: true,
  };
}

function getCategoryMatchScore(
  tutor: ReturnType<typeof normalizeTutor>,
  interestWeights: Map<string, number>,
  personalized: boolean,
) {
  if (tutor.categories.length === 0) {
    return personalized ? 0 : 0.2;
  }

  if (!personalized || interestWeights.size === 0) {
    return 0.45;
  }

  const totalInterestWeight = [...interestWeights.values()].reduce(
    (sum, value) => sum + value,
    0,
  );

  if (totalInterestWeight === 0) {
    return 0.45;
  }

  const matchedWeight = tutor.categories.reduce((sum, category) => {
    return sum + (interestWeights.get(category.id) ?? 0);
  }, 0);

  return clamp(matchedWeight / totalInterestWeight);
}

function getInterestHistoryScore(
  tutorId: string,
  tutorHistoryWeights: Map<string, number>,
  personalized: boolean,
) {
  if (!personalized || tutorHistoryWeights.size === 0) {
    return 0;
  }

  const maxHistoryWeight = Math.max(1, ...tutorHistoryWeights.values());
  return clamp((tutorHistoryWeights.get(tutorId) ?? 0) / maxHistoryWeight);
}

function getRecommendationLabel(
  tutor: ReturnType<typeof normalizeTutor>,
  personalized: boolean,
  categoryMatch: number,
  rating: number,
  affordability: number,
): RecommendationLabel {
  if (personalized && categoryMatch >= 0.5) {
    return "Recommended";
  }

  if (rating >= 0.9 || tutor.avgRating >= 4.7) {
    return "Top Rated";
  }

  if (affordability >= 0.72) {
    return "Best Value";
  }

  if (tutor.isVerified) {
    return "Verified";
  }

  return "Recommended";
}

function getRecommendationBadges(
  tutor: ReturnType<typeof normalizeTutor>,
  label: RecommendationLabel,
  affordability: number,
) {
  const badges: RecommendationLabel[] = [label];

  if (tutor.avgRating >= 4.7 && !badges.includes("Top Rated")) {
    badges.push("Top Rated");
  }

  if (affordability >= 0.72 && !badges.includes("Best Value")) {
    badges.push("Best Value");
  }

  if (tutor.isVerified && !badges.includes("Verified")) {
    badges.push("Verified");
  }

  return badges.slice(0, 3);
}

function buildRecommendationReason(
  tutor: ReturnType<typeof normalizeTutor>,
  personalized: boolean,
  interestCategories: string[],
  label: RecommendationLabel,
) {
  if (personalized && interestCategories.length > 0) {
    const matchedCategories = tutor.categories
      .map((category) => category.name)
      .filter((name) => interestCategories.includes(name))
      .slice(0, 2);

    if (matchedCategories.length > 0) {
      return `Matches recent interest in ${matchedCategories.join(" and ")}.`;
    }
  }

  if (label === "Top Rated") {
    return `Strong rating momentum with ${tutor.totalReviews} student reviews.`;
  }

  if (label === "Best Value") {
    return `Competitive hourly rate for a ${tutor.avgRating.toFixed(1)} rated tutor.`;
  }

  if (tutor.isVerified) {
    return "Verified profile with reliable learner feedback.";
  }

  return "Balanced mix of reviews, rating, and affordability.";
}

function buildRecommendationEntry(
  tutor: TutorRecord,
  context: {
    minRate: number;
    maxRate: number;
    maxReviews: number;
    interestWeights: Map<string, number>;
    tutorHistoryWeights: Map<string, number>;
    interestCategories: string[];
    personalized: boolean;
  },
): TutorRecommendation<ReturnType<typeof normalizeTutor>> {
  const normalizedTutor = normalizeTutor(tutor);
  const categoryMatch = getCategoryMatchScore(
    normalizedTutor,
    context.interestWeights,
    context.personalized,
  );
  const rating = clamp(normalizedTutor.avgRating / 5);
  const reviewCount = normalizeReviewCount(
    normalizedTutor.totalReviews,
    context.maxReviews,
  );
  const affordability = normalizeAffordability(
    normalizedTutor.hourlyRate,
    context.minRate,
    context.maxRate,
  );
  const interestHistory = getInterestHistoryScore(
    normalizedTutor.id,
    context.tutorHistoryWeights,
    context.personalized,
  );
  const verification = normalizedTutor.isVerified ? 1 : 0;

  const score = context.personalized
    ? categoryMatch * recommendationWeights.categoryMatch +
      rating * recommendationWeights.rating +
      reviewCount * recommendationWeights.reviewCount +
      affordability * recommendationWeights.affordability +
      interestHistory * recommendationWeights.interestHistory +
      verification * recommendationWeights.verification
    : rating * 0.46 +
      reviewCount * 0.22 +
      affordability * 0.22 +
      verification * 0.1;

  const label = getRecommendationLabel(
    normalizedTutor,
    context.personalized,
    categoryMatch,
    rating,
    affordability,
  );

  return {
    tutor: normalizedTutor,
    score: round(score),
    label,
    badges: getRecommendationBadges(normalizedTutor, label, affordability),
    reason: buildRecommendationReason(
      normalizedTutor,
      context.personalized,
      context.interestCategories,
      label,
    ),
    breakdown: {
      categoryMatch: round(categoryMatch),
      rating: round(rating),
      reviewCount: round(reviewCount),
      affordability: round(affordability),
      interestHistory: round(interestHistory),
      verification: round(verification),
    },
  };
}

export async function getTutorRecommendations(
  limit = 4,
  studentId?: string | null,
): Promise<TutorRecommendationResponse<ReturnType<typeof normalizeTutor>>> {
  const safeLimit = Math.max(1, Math.min(limit, 6));
  const [tutorsResult, studentSignals] = await Promise.all([
    tutorService.getAllTutors({
      limit: 24,
      sortBy: "avgRating",
      sortOrder: "desc",
    }),
    getStudentSignals(studentId),
  ]);

  const tutors = tutorsResult.data ?? [];
  const minRate = Math.min(0, ...tutors.map((tutor) => tutor.hourlyRate));
  const maxRate = Math.max(0, ...tutors.map((tutor) => tutor.hourlyRate));
  const maxReviews = Math.max(0, ...tutors.map((tutor) => tutor.totalReviews));

  const items = tutors
    .map((tutor) =>
      buildRecommendationEntry(tutor, {
        minRate,
        maxRate,
        maxReviews,
        interestWeights: studentSignals.interestWeights,
        tutorHistoryWeights: studentSignals.tutorHistoryWeights,
        interestCategories: studentSignals.interestCategories,
        personalized: studentSignals.personalized,
      }),
    )
    .sort((left, right) => right.score - left.score)
    .slice(0, safeLimit);

  return {
    items,
    meta: {
      strategy: studentSignals.personalized ? "personalized" : "popular",
      interestCategories: studentSignals.interestCategories,
      generatedAt: new Date().toISOString(),
    },
  };
}

function normalizeSentimentLabel(label?: string) {
  const normalized = label?.toLowerCase().trim();

  if (!normalized) {
    return null;
  }

  if (
    normalized.includes("positive") ||
    normalized === "label_2" ||
    normalized.endsWith("_2")
  ) {
    return "positive" as const;
  }

  if (
    normalized.includes("neutral") ||
    normalized === "label_1" ||
    normalized.endsWith("_1")
  ) {
    return "neutral" as const;
  }

  if (
    normalized.includes("negative") ||
    normalized === "label_0" ||
    normalized.endsWith("_0")
  ) {
    return "negative" as const;
  }

  return null;
}

function extractPredictionRows(payload: unknown): HuggingFacePrediction[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  if (Array.isArray(payload[0])) {
    return payload[0] as HuggingFacePrediction[];
  }

  return payload as HuggingFacePrediction[];
}

function fallbackSentiment(text: string): SentimentClassification {
  const normalized = text.toLowerCase();
  const positiveWords = [
    "great",
    "excellent",
    "helpful",
    "clear",
    "patient",
    "amazing",
    "good",
    "friendly",
    "strong",
    "recommend",
    "best",
    "supportive",
  ];
  const negativeWords = [
    "bad",
    "poor",
    "confusing",
    "late",
    "rude",
    "slow",
    "boring",
    "waste",
    "unclear",
    "disappointed",
    "problem",
    "difficult",
  ];

  const positiveScore = positiveWords.reduce((score, word) => {
    return normalized.includes(word) ? score + 1 : score;
  }, 0);
  const negativeScore = negativeWords.reduce((score, word) => {
    return normalized.includes(word) ? score + 1 : score;
  }, 0);

  if (positiveScore === negativeScore) {
    return {
      label: "neutral",
      score: 0.58,
      provider: "fallback",
    };
  }

  const label = positiveScore > negativeScore ? "positive" : "negative";
  const spread = Math.abs(positiveScore - negativeScore);

  return {
    label,
    score: round(clamp(0.62 + spread * 0.08)),
    provider: "fallback",
  };
}

async function runHuggingFaceSentiment(text: string) {
  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${huggingFaceModel}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          top_k: 3,
        },
      }),
      signal: AbortSignal.timeout(9000),
    },
  );

  if (!response.ok) {
    throw new Error(`Hugging Face request failed with ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const predictions = extractPredictionRows(payload);

  if (predictions.length === 0) {
    return null;
  }

  const bestPrediction = predictions
    .map((prediction) => ({
      label: normalizeSentimentLabel(prediction.label),
      score: typeof prediction.score === "number" ? prediction.score : 0,
    }))
    .filter(
      (
        prediction,
      ): prediction is {
        label: "positive" | "neutral" | "negative";
        score: number;
      } => Boolean(prediction.label),
    )
    .sort((left, right) => right.score - left.score)[0];

  if (!bestPrediction) {
    return null;
  }

  return {
    label: bestPrediction.label,
    score: round(bestPrediction.score),
    provider: "huggingface" as const,
  };
}

export async function classifySentiment(
  text: string,
): Promise<SentimentClassification> {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return {
      label: "neutral",
      score: 1,
      provider: "fallback",
    };
  }

  try {
    const huggingFaceResult = await runHuggingFaceSentiment(normalizedText);

    if (huggingFaceResult) {
      return huggingFaceResult;
    }
  } catch {
    // The fallback keeps the endpoint usable when the model is unavailable.
  }

  return fallbackSentiment(normalizedText);
}

function buildRatingFallback(averageRating: number, totalReviews: number) {
  if (totalReviews === 0) {
    return {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
  }

  if (averageRating >= 4.5) {
    return {
      positive: 76,
      neutral: 18,
      negative: 6,
    };
  }

  if (averageRating >= 3.5) {
    return {
      positive: 48,
      neutral: 36,
      negative: 16,
    };
  }

  return {
    positive: 22,
    neutral: 28,
    negative: 50,
  };
}

function buildInsightSummary(
  averageRating: number,
  totalReviews: number,
  analyzedReviews: number,
  sentiment: ReviewInsightsResponse["sentiment"],
  usedFallbackOnly: boolean,
) {
  if (totalReviews === 0) {
    return "No reviews are available yet, so AI insights will appear after the first few student comments.";
  }

  if (analyzedReviews === 0) {
    return `Written feedback is limited right now, so this snapshot leans on the ${averageRating.toFixed(1)} star average across ${totalReviews} reviews.`;
  }

  if (sentiment.positive >= 65) {
    return `Student feedback trends strongly positive, which lines up with the ${averageRating.toFixed(1)} average rating. ${usedFallbackOnly ? "A local sentiment fallback generated this summary." : "The strongest themes point to clarity, patience, and session quality."}`;
  }

  if (sentiment.negative >= 30) {
    return `Feedback is mixed, with a noticeable share of negative comments despite a ${averageRating.toFixed(1)} average rating. This tutor may need tighter consistency across sessions.`;
  }

  return "Reviews are broadly balanced with a slight positive lean. Students see value in the sessions, but the written feedback is more measured than enthusiastic.";
}

export async function getTutorReviewInsights(
  tutorId: string,
): Promise<ReviewInsightsResponse | null> {
  const tutor = await tutorService.getTutorById(tutorId);

  if (!tutor) {
    return null;
  }

  const reviewComments = (tutor.reviews ?? [])
    .map((review) => review.comment?.trim() ?? "")
    .filter((comment) => comment.length > 0)
    .slice(0, 12);

  if (reviewComments.length === 0) {
    const sentiment = buildRatingFallback(tutor.avgRating, tutor.totalReviews);

    return {
      tutorId,
      sentiment,
      summary: buildInsightSummary(
        tutor.avgRating,
        tutor.totalReviews,
        0,
        sentiment,
        true,
      ),
      totalReviews: tutor.totalReviews,
      analyzedReviews: 0,
      averageRating: tutor.avgRating,
      provider: tutor.totalReviews > 0 ? "fallback" : "unavailable",
    };
  }

  const classifications = await Promise.all(
    reviewComments.map((comment) => classifySentiment(comment)),
  );

  const counts = classifications.reduce(
    (summary, classification) => {
      summary[classification.label] += 1;
      return summary;
    },
    {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
  );

  const total = classifications.length;
  const sentiment = {
    positive: Math.round((counts.positive / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
  };

  const distributedTotal =
    sentiment.positive + sentiment.neutral + sentiment.negative;

  if (distributedTotal !== 100) {
    sentiment.neutral += 100 - distributedTotal;
  }

  const providers = new Set(classifications.map((item) => item.provider));
  const provider =
    providers.size > 1
      ? "mixed"
      : providers.has("huggingface")
        ? "huggingface"
        : "fallback";

  return {
    tutorId,
    sentiment,
    summary: buildInsightSummary(
      tutor.avgRating,
      tutor.totalReviews,
      total,
      sentiment,
      provider === "fallback",
    ),
    totalReviews: tutor.totalReviews,
    analyzedReviews: total,
    averageRating: tutor.avgRating,
    provider,
  };
}

function extractBudget(message: string) {
  const match = message.match(
    /(?:under|below|max|budget)\s*(?:bdt|tk|taka|৳)?\s*(\d{2,5})/i,
  );

  return match ? Number(match[1]) : undefined;
}

function extractMinRating(message: string) {
  const match = message.match(/(\d(?:\.\d)?)\s*(?:stars?|rating)/i);

  return match ? Number(match[1]) : undefined;
}

function detectIntent(
  message: string,
  matchedCategoryName?: string,
  budget?: number,
): ChatIntent {
  if (
    /(become a tutor|register as a tutor|join as tutor|teach on skillbridge)/i.test(
      message,
    )
  ) {
    return "tutor_registration_help";
  }

  if (/(book|booking|cancel|reschedule|availability|session)/i.test(message)) {
    return "booking_help";
  }

  if (matchedCategoryName) {
    return "category_filter";
  }

  if (budget || /(cheap|affordable|price|pricing|budget)/i.test(message)) {
    return "pricing_filter";
  }

  if (/(find|need|search|show|top rated|best tutor|recommend)/i.test(message)) {
    return "tutor_search";
  }

  return "general_help";
}

function buildTutorSuggestion(
  tutor: TutorRecord | NormalizedTutor,
  label: string,
  reason: string,
): ChatTutorSuggestion<NormalizedTutor> {
  return {
    tutor: Array.isArray((tutor as NormalizedTutor).categories)
      ? (tutor as NormalizedTutor)
      : normalizeTutor(tutor as TutorRecord),
    label,
    reason,
  };
}

function buildQuickActions(intent: ChatIntent) {
  if (intent === "booking_help") {
    return [
      {
        label: "Browse Tutors",
        message: "Show me top rated tutors.",
      },
      {
        label: "View Pricing",
        message: "Find affordable tutors under ৳1200.",
      },
      ...defaultQuickActions.slice(2),
    ];
  }

  if (intent === "tutor_registration_help") {
    return [
      {
        label: "Tutor Profile Tips",
        message: "What should I include in my tutor profile?",
      },
      ...defaultQuickActions.slice(0, 3),
    ];
  }

  return defaultQuickActions;
}

function buildSearchReply(
  tutorCount: number,
  budget: number | undefined,
  categoryName: string | undefined,
  intent: ChatIntent,
) {
  if (tutorCount === 0) {
    if (intent === "pricing_filter" && budget) {
      return `I could not find a strong tutor match under ৳${budget}. Try raising the budget slightly or removing one filter.`;
    }

    if (categoryName) {
      return `I could not find a strong ${categoryName} tutor match right now. Try removing the budget filter or asking for top rated tutors.`;
    }

    return "I could not find a matching tutor yet. Try adding a subject, budget, or rating preference.";
  }

  if (categoryName && budget) {
    return `I found ${tutorCount} ${categoryName} tutor matches under ৳${budget}. These balance rating, reviews, and price.`;
  }

  if (categoryName) {
    return `I found ${tutorCount} ${categoryName} tutors that look like good fits. The list favors stronger ratings and student feedback.`;
  }

  if (budget) {
    return `I found ${tutorCount} tutors within that price range. I sorted the suggestions toward better value first.`;
  }

  return `Here are ${tutorCount} tutor suggestions based on your request.`;
}

async function getMatchedCategory(message: string) {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return categories.find((category) =>
    message.includes(category.name.toLowerCase()),
  );
}

export async function getAssistantResponse(
  payload: ChatAssistantPayload,
): Promise<ChatAssistantResponse<NormalizedTutor>> {
  const normalizedMessage = payload.message.trim().toLowerCase();
  const matchedCategory = await getMatchedCategory(normalizedMessage);
  const budget = extractBudget(normalizedMessage);
  const minRating = extractMinRating(normalizedMessage);
  const intent = detectIntent(normalizedMessage, matchedCategory?.name, budget);

  if (intent === "booking_help") {
    return {
      intent,
      reply:
        "To book a session, open a tutor profile, choose a listed slot, and confirm the booking. To manage changes later, use the Bookings page in your dashboard.",
      quickActions: buildQuickActions(intent),
    };
  }

  if (intent === "tutor_registration_help") {
    return {
      intent,
      reply:
        "Register from the main sign-up page, choose the tutor path, then complete your tutor profile with your bio, hourly rate, categories, and weekly availability. A stronger profile usually converts better.",
      quickActions: buildQuickActions(intent),
    };
  }

  if (intent === "general_help") {
    const recommendations = await getTutorRecommendations(3);

    return {
      intent,
      reply:
        "I can help you find tutors, compare pricing, explain bookings, or guide tutor registration. Start with a subject, price range, or rating target.",
      tutorSuggestions:
        recommendations?.items.map((item) =>
          buildTutorSuggestion(item.tutor, item.label, item.reason),
        ) ?? [],
      quickActions: buildQuickActions(intent),
    };
  }

  const filters: TutorFilter = {
    limit: 4,
    sortBy: intent === "pricing_filter" ? "hourlyRate" : "avgRating",
    sortOrder: intent === "pricing_filter" ? "asc" : "desc",
  };

  if (matchedCategory) {
    filters.categoryId = matchedCategory.id;
  }

  if (budget) {
    filters.maxPrice = budget;
  }

  if (minRating) {
    filters.minRating = minRating;
  }

  if (normalizedMessage.includes("top rated")) {
    filters.sortBy = "avgRating";
    filters.sortOrder = "desc";
  }

  const tutorResults = await tutorService.getAllTutors(filters);
  const tutors = tutorResults.data.slice(0, 4);

  return {
    intent,
    reply: buildSearchReply(
      tutors.length,
      budget,
      matchedCategory?.name,
      intent,
    ),
    tutorSuggestions: tutors.map((tutor) =>
      buildTutorSuggestion(
        tutor,
        tutor.avgRating >= 4.7
          ? "Top Rated"
          : tutor.hourlyRate <= (budget ?? tutor.hourlyRate)
            ? "Best Value"
            : "Recommended",
        matchedCategory
          ? `Strong ${matchedCategory.name} profile with a ${tutor.avgRating.toFixed(1)} rating.`
          : `Rated ${tutor.avgRating.toFixed(1)} with ${tutor.totalReviews} reviews.`,
      ),
    ),
    quickActions: buildQuickActions(intent),
    filters,
  };
}
