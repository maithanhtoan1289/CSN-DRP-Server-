import express from "express";
import {
  login,
  logout,
  profile,
  refreshToken,
  register,
} from "../controllers/auth.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.get(
  "/profile",
  authMiddleware([ROLES.ADMIN, ROLES.RESCUER, ROLES.EMPLOYEE, ROLES.USER]),
  profile
);

export default router;
