import historyService from "../services/historyService.js";

export const getAllHistoryNaturalDisastersByPageAndLimit = async (req, res) => {
  const { page, limit } = req.query;

  try {
    const historyNaturalDisastersQuery =
      await historyService.getAllHistoryNaturalDisastersByPageAndLimit(
        page,
        limit
      );

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all history natural disasters",
      data: historyNaturalDisastersQuery,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

export const getAllHistoryProblemsByPageAndLimit = async (req, res) => {
  const { page, limit } = req.query;

  try {
    const historyProblemsQuery =
      await historyService.getAllHistoryProblemsByPageAndLimit(page, limit);

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all history problem",
      data: historyProblemsQuery,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
export const getIncidentsByUserId = async (req, res) => {
  try {
    const userId = req.userId; // Lấy userId từ middleware authMiddleware
    const incidents = await historyService.getIncidentsByUserId(userId);
    res.status(200).json({
      status: 200,
      message: "Successfully retrieved incidents by user ID",
      data: incidents,
    });
  } catch (error) {
    console.error("Error in getIncidentsByUserId controller:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};

export const getHistoryIncidentsByUserId = async (req, res) => {
  try {
    const userId = req.userId; 
    console.log(userId)// Lấy userId từ middleware authMiddleware
    const historyIncidents = await historyService.getHistoryIncidentsByUserId(userId);
    res.status(200).json({
      status: 200,
      message: "Successfully retrieved history incidents by user ID",
      data: historyIncidents,
    });
  } catch (error) {
    console.error("Error in getHistoryIncidentsByUserId controller:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};

export const getAllIncidentsByUserIdController = async (req, res) => {
  try {
    // Lấy userId từ request hoặc từ middleware
    const userId = req.userId;

    // Gọi service để lấy tất cả các sự cố và sự cố lịch sử của userId
    const incidents = await historyService.getAllIncidentsByUserId(userId);

    // Trả về kết quả cho client
    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all incidents for the user",
      data: incidents,
    });
  } catch (error) {
    console.error("Error in getAllIncidentsByUserIdController:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};