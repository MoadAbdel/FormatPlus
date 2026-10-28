import { Router } from "express";
import rateLimit from "express-rate-limit";
import { testPrompt } from "../controllers/aiController.js";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Trop de requêtes. Veuillez patienter une minute avant de réessayer.",
  },
});

router.post("/test", aiLimiter, testPrompt);

export default router;
