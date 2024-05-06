import * as expertiseService from "../services/expertiseService.js";
export const getExpertiseByUserIdController = async (req, res) => {
    const userId = req.userId;
    console.log(userId)

    try {
        const expertiseList = await expertiseService.getExpertiseByUserId(userId);
        res.status(200).json({
            status: 200,
            message: "Expertise retrieved successfully",
            data: expertiseList
        });
    } catch (error) {
        console.error("Error in getExpertiseByUserIdController:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};
export const addExpertiseController = async (req, res) => {
    const userId = req.userId;
    console.log(userId)
    const { specialty, description } = req.body;

    try {
        const newExpertise = await expertiseService.addExpertise(userId, specialty, description);
        res.status(201).json({
            status: 201,
            message: "Expertise added successfully",
            data: newExpertise
        });
    } catch (error) {
        console.error("Error in addExpertiseController:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};

// Cập nhật một bản ghi trong bảng expertise
export const updateExpertiseController = async (req, res) => {
    const expertiseId = req.params.id;
    const { specialty, description } = req.body;

    try {
        const updatedExpertise = await expertiseService.updateExpertise(expertiseId, specialty, description);
        res.status(200).json({
            status: 200,
            message: "Expertise updated successfully",
            data: updatedExpertise
        });
    } catch (error) {
        console.error("Error in updateExpertiseController:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};

// Xóa một bản ghi từ bảng expertise
export const deleteExpertiseController = async (req, res) => {
    const expertiseId = req.params.id;

    try {
        const deletedExpertise = await expertiseService.deleteExpertise(expertiseId);
        res.status(200).json({
            status: 200,
            message: "Expertise deleted successfully",
            data: deletedExpertise
        });
    } catch (error) {
        console.error("Error in deleteExpertiseController:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        });
    }
};
export const getRelatedIncidents = async (req, res) => {
    const user_id  = req.userId;
    //console.log(user_id);
    try {
      const matches = await expertiseService.findMatches(user_id);
      res.json(matches);
    } catch (err) {
      console.error('Error getting expertise matches:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
};