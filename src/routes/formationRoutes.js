import { Router } from "express";
import { FORMATIONS } from "../services/formationService.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(FORMATIONS);
});

export default router;
