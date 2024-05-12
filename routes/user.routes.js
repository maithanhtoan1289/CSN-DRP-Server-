import express from "express";
import {
  addCoordinates,
  getAllUsersByPageAndLimit,
  getAllRescueNeeded,
  getAllRescueHistory,
  getAllRescueSeeker,
  getUserProfileController,
  updateUserProfile
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
router.get("/profile",authMiddleware([ROLES.ADMIN, ROLES.RESCUER, ROLES.EMPLOYEE, ROLES.USER]), getUserProfileController);
router.put('/updateprofile',authMiddleware([ROLES.ADMIN, ROLES.RESCUER, ROLES.EMPLOYEE, ROLES.USER]), updateUserProfile);
export default router;
