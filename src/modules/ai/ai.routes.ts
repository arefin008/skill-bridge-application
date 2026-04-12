import { Router } from "express";

import { aiController } from "./ai.controller";

const router = Router();

router.post("/chat", aiController.chat);
router.post("/sentiment", aiController.classifyReviewSentiment);

export const aiRouter = router;
