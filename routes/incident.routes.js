import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

import {
    shareIncident,
    getAllIncidents,
    updateIncident,
    findHashtagIncidents,
    deleteIncidentByIdController,
    deleteHistoryIncidentByIdController

} from "../controllers/incidents.controllers.js";

router.post('/shareIncident',authMiddleware([ROLES.USER,ROLES.RESCUER]), shareIncident);
router.get("/getIncident", getAllIncidents);
router.put("/:id",authMiddleware([ROLES.USER,ROLES.ADMIN,ROLES.RESCUER]),updateIncident);
router.post("/find", findHashtagIncidents);
router.delete("/delete/:incidentId", authMiddleware([ROLES.USER,ROLES.ADMIN,ROLES.RESCUER]), deleteIncidentByIdController);
router.delete("/deletehistory/:historyIncidentId", authMiddleware([ROLES.USER,ROLES.ADMIN,ROLES.RESCUER]), deleteHistoryIncidentByIdController);
export default router;