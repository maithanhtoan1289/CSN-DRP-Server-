import userService from "../services/userService.js";

export const getAllEmployeesByPageAndLimit = async (req, res) => {
  const { page, limit } = req.query;

  try {
    const employeesQuery = await userService.getAllEmployeesByPageAndLimit(
      page,
      limit
    );

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all employees",
      data: employeesQuery,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error" + error.message,
    });
  }
};
