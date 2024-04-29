import express from "express";
import {
  getAllHistoryNaturalDisastersByPageAndLimit,
  getAllHistoryProblemsByPageAndLimit,
  getHistoryIncidentsByUserId,
  getIncidentsByUserId,
  getAllIncidentsByUserIdController
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
router.get(
  "/incidents",
  authMiddleware([ROLES.ADMIN,ROLES.USER]),
  getIncidentsByUserId
);
router.get(
  "/histories_incidents",
  authMiddleware([ROLES.ADMIN,ROLES.USER]),
  getHistoryIncidentsByUserId
);
router.get(
  "/all_histories_incidents",
  authMiddleware([ROLES.ADMIN,ROLES.USER]),
  getAllIncidentsByUserIdController
);
export default router;
