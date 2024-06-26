import express from "express";
import {
  getAllNaturalDisastersByPageAndLimit,
  addNaturalDisasterVersion1,
  addNaturalDisasterVersion2,
  addNaturalDisasterStatus,
  editNaturalDisasterPriority,

  // Task 5
  addNaturalDisasterVersion3,
} from "../controllers/natural-disaster.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

const router = express.Router();

router.get(
  "",
  authMiddleware([ROLES.ADMIN]),
  getAllNaturalDisastersByPageAndLimit
);

router.post("/v1/add", addNaturalDisasterVersion1);
router.post("/v2/add", addNaturalDisasterVersion2);

// Task 5
router.post("/v3/add", addNaturalDisasterVersion3);

router.put("/add-status", addNaturalDisasterStatus);

// Task 1
router.put("/edit-priority", editNaturalDisasterPriority);

export default router;
