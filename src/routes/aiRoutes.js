import { Router } from "express";
import { testPrompt } from "../controllers/aiController.js";

const router = Router();

router.post("/test", testPrompt);

export default router;
