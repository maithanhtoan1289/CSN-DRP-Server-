import express from "express";
import {
  addCoordinates,
  getAllUsersByPageAndLimit,
  getAllRescueNeeded,
  getAllRescueHistory,
} from "../controllers/user.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

const router = express.Router();

router.get("", authMiddleware([ROLES.ADMIN]), getAllUsersByPageAndLimit);

router.post(
  "/add-coordinates",
  authMiddleware([ROLES.RESCUER]),
  addCoordinates
);

router.get(
  "/rescue-needed",
  authMiddleware([ROLES.RESCUER]),
  getAllRescueNeeded
);

router.get(
  "/rescue-history",
  authMiddleware([ROLES.RESCUER]),
  getAllRescueHistory
);

export default router;
