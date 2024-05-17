import express from "express";
import {
  getAllProblemsByPageAndLimit,
  addProblemVersion1,
  addProblemVersion2,
  addProblemStatus,
  editProblemPriority,

   // Task 5
   addProblemVersion3,
} from "../controllers/problem.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

const router = express.Router();

router.get("", authMiddleware([ROLES.ADMIN]), getAllProblemsByPageAndLimit);

router.post("/v1/add", addProblemVersion1);

router.post("/v2/add", addProblemVersion2);

// Task 5
router.post("/v3/add", addProblemVersion3);

router.post("/add-status", addProblemStatus);

// Task 1
router.put("/edit-priority", editProblemPriority);


export default router;
