import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import ROLES from "../enums/roles.js";

import {
    shareIncident,
    getAllIncidents,
    updateIncident,
    findIncidents
} from "../controllers/incidents.controllers.js";

router.post('/shareIncident',authMiddleware([ROLES.USER]), shareIncident);
router.get("/getIncident", getAllIncidents);
router.put("/:id",updateIncident);
router.post("/find", findIncidents);

export default router;