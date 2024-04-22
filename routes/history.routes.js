import express from "express";
import {
  getAllHistoryNaturalDisastersByPageAndLimit,
  getAllHistoryProblemsByPageAndLimit,
} from "../controllers/history.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

const router = express.Router();

router.get(
  "/natural-disasters",
  authMiddleware([ROLES.ADMIN]),
  getAllHistoryNaturalDisastersByPageAndLimit
);
router.get(
  "/problems",
  authMiddleware([ROLES.ADMIN]),
  getAllHistoryProblemsByPageAndLimit
);

export default router;
