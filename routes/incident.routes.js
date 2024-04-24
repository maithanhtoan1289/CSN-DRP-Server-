import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

import {
    shareIncident,
    getAllIncidents,
    updateIncident,
    findHashtagIncidents,
    // markIncidentAsResolved
} from "../controllers/incidents.controllers.js";

router.post('/shareIncident',authMiddleware([ROLES.USER]), shareIncident);
router.get("/getIncident",authMiddleware([ROLES.USER,ROLES.ADMIN]), getAllIncidents);
router.put("/:id",authMiddleware([ROLES.USER,ROLES.ADMIN]),updateIncident);
router.post("/find",authMiddleware([ROLES.USER,ROLES.ADMIN]), findHashtagIncidents);
// router.put("/mark-completed", authMiddleware([ROLES.USER,ROLES.ADMIN]), markIncidentAsResolved);

export default router;