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
