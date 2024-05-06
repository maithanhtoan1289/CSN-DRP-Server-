import express from "express";
import {
    addExpertiseController,
    updateExpertiseController,
    deleteExpertiseController,
    getExpertiseByUserIdController,
    getRelatedIncidents
} from "../controllers/expertise.controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

const router = express.Router();

router.post("/create", authMiddleware([ROLES.USER,ROLES.RESCUER]), addExpertiseController);

router.put("/:id",authMiddleware([ROLES.USER,ROLES.RESCUER]), updateExpertiseController);

router.delete("/deleteExpertise/:id", authMiddleware([ROLES.USER,ROLES.RESCUER]),deleteExpertiseController);

router.get("/getExpertise", authMiddleware([ROLES.USER,ROLES.RESCUER]), getExpertiseByUserIdController);
router.get("/related", authMiddleware([ROLES.USER,ROLES.RESCUER]), getRelatedIncidents);


export default router;
