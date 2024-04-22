import express from "express";
import { getAllEmployeesByPageAndLimit } from "../controllers/employee.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

const router = express.Router();

router.get("", authMiddleware([ROLES.ADMIN]), getAllEmployeesByPageAndLimit);

export default router;
