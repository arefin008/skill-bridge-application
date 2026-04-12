import { NextFunction, Request, Response } from "express";

import { auth as betterAuth } from "../../lib/auth";
import { sendSuccess } from "../../utils/apiResponse";
import {
  chatPayloadSchema,
  getValidationMessage,
  recommendationQuerySchema,
  reviewInsightsParamsSchema,
  sentimentPayloadSchema,
} from "./ai.validation";
import {
  classifySentiment,
  getAssistantResponse,
  getTutorRecommendations,
  getTutorReviewInsights,
} from "./ai.service";

async function getOptionalUserId(req: Request) {
  try {
    const session = await betterAuth.api.getSession({
      headers: req.headers as any,
    });

    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedQuery = recommendationQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: getValidationMessage(parsedQuery.error),
      });
    }

    const userId = await getOptionalUserId(req);
    const recommendations = await getTutorRecommendations(
      parsedQuery.data.limit,
      userId,
    );

    return res
      .status(200)
      .json(sendSuccess(recommendations, "Tutor recommendations fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getReviewInsights = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedParams = reviewInsightsParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: getValidationMessage(parsedParams.error),
      });
    }

    const insights = await getTutorReviewInsights(parsedParams.data.id);

    if (!insights) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    return res
      .status(200)
      .json(sendSuccess(insights, "AI review insights fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const classifyReviewSentiment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedBody = sentimentPayloadSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: getValidationMessage(parsedBody.error),
      });
    }

    const normalizedText = parsedBody.data.text.trim();
    const sentiment = await classifySentiment(normalizedText);

    return res.status(200).json(
      sendSuccess(
        {
          sentiment,
          normalizedText,
        },
        "Sentiment analyzed successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
};

const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = chatPayloadSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: getValidationMessage(parsedBody.error),
      });
    }

    const reply = await getAssistantResponse({
      message: parsedBody.data.message,
      ...(parsedBody.data.history ? { history: parsedBody.data.history } : {}),
    });

    return res
      .status(200)
      .json(sendSuccess(reply, "Assistant response generated successfully"));
  } catch (error) {
    next(error);
  }
};

export const aiController = {
  getRecommendations,
  getReviewInsights,
  classifyReviewSentiment,
  chat,
};
