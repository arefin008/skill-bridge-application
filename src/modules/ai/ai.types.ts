export type RecommendationLabel =
  | "Recommended"
  | "Top Rated"
  | "Best Value"
  | "Verified";

export interface RecommendationScoreBreakdown {
  categoryMatch: number;
  rating: number;
  reviewCount: number;
  affordability: number;
  interestHistory: number;
  verification: number;
}

export interface TutorRecommendation<TTutor = unknown> {
  tutor: TTutor;
  score: number;
  label: RecommendationLabel;
  badges: RecommendationLabel[];
  reason: string;
  breakdown: RecommendationScoreBreakdown;
}

export interface TutorRecommendationResponse<TTutor = unknown> {
  items: TutorRecommendation<TTutor>[];
  meta: {
    strategy: "personalized" | "popular";
    interestCategories: string[];
    generatedAt: string;
  };
}

export type SentimentLabel = "positive" | "neutral" | "negative";

export type SentimentProvider =
  | "huggingface"
  | "fallback"
  | "mixed"
  | "unavailable";

export interface SentimentClassification {
  label: SentimentLabel;
  score: number;
  provider: Exclude<SentimentProvider, "mixed" | "unavailable">;
}

export interface ReviewSentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ReviewInsightsResponse {
  tutorId: string;
  sentiment: ReviewSentimentBreakdown;
  summary: string;
  totalReviews: number;
  analyzedReviews: number;
  averageRating: number;
  provider: SentimentProvider;
}

export type ChatIntent =
  | "tutor_search"
  | "pricing_filter"
  | "category_filter"
  | "booking_help"
  | "tutor_registration_help"
  | "general_help";

export interface ChatQuickAction {
  label: string;
  message: string;
}

export interface ChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

export interface ChatAssistantPayload {
  message: string;
  history?: ChatHistoryEntry[];
}

export interface ChatTutorSuggestion<TTutor = unknown> {
  tutor: TTutor;
  label: string;
  reason: string;
}

export interface ChatAssistantResponse<TTutor = unknown> {
  reply: string;
  intent: ChatIntent;
  tutorSuggestions?: ChatTutorSuggestion<TTutor>[];
  quickActions: ChatQuickAction[];
  filters?: {
    categoryId?: string;
    minRating?: number;
    maxPrice?: number;
    limit?: number;
    sortBy?: "avgRating" | "hourlyRate" | "experience" | "createdAt";
    sortOrder?: "asc" | "desc";
  };
}
