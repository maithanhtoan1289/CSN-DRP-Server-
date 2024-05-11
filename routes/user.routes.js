import express from "express";
import {
  addCoordinates,
  getAllUsersByPageAndLimit,
  getAllRescueNeeded,
  getAllRescueHistory,
  getAllRescueSeeker,
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

// New
router.get("/rescue-needed", getAllRescueNeeded);
router.get("/rescue-seeker", getAllRescueSeeker);

router.get(
  "/rescue-history",
  authMiddleware([ROLES.RESCUER]),
  getAllRescueHistory
);

export default router;
