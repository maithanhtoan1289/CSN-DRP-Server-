import express from "express";
import {
  getAllProblemsByPageAndLimit,
  addProblemVersion1,
  addProblemVersion2,
  addProblemStatus,
} from "../controllers/problem.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

const router = express.Router();

router.get("", authMiddleware([ROLES.ADMIN]), getAllProblemsByPageAndLimit);

router.post("/v1/add", addProblemVersion1);

router.post("/v2/add", addProblemVersion2);

router.post("/add-status", addProblemStatus);

export default router;
