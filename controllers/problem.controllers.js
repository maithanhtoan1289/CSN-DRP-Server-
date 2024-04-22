import problemService from "../services/problemService.js";
import userService from "../services/userService.js";

export const getAllProblemsByPageAndLimit = async (req, res) => {
  const { page, limit } = req.query;

  try {
    const problemsQuery = await problemService.getAllProblemsByPageAndLimit(
      page,
      limit
    );

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all problems",
      data: problemsQuery,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error" + error.message,
    });
  }
};

export const addProblemVersion1 = async (req, res) => {
  const {
    effected_area,
    coordinates,
    name,
    incidentName,
    incidentType,
    phone,
    username,
    email,
    role,
    password,
    urlImage,
  } = req.body;

  try {
    const start_date = new Date();
    const end_date = null;
    const status = "chưa kết thúc";
    const address = effected_area;

    const roleId = await userService.createRole(role);

    const userId = await userService.createUser(
      name,
      username,
      email,
      password,
      roleId,
      phone,
      coordinates,
      address
    );

    const problemsQuery = await problemService.addProblem(
      userId,
      incidentName,
      incidentType,
      start_date,
      end_date,
      address,
      status,
      urlImage
    );

    res.status(200).json({
      status: 200,
      message: "Successfully add problem",
      data: {
        id: userId,
        name,
        username,
        email,
        role,
        problemsQuery,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};

export const addProblemVersion2 = async (req, res) => {
  const {
    effected_area,
    coordinates,
    name,
    incidentName,
    incidentType,
    phone,
    id,
    urlImage,
  } = req.body;

  try {
    const start_date = new Date();
    const end_date = null;
    const status = "chưa kết thúc";
    const address = effected_area;

    const userId = id;

    await userService.addCoordinates(userId, address, coordinates, phone);

    const problemsQuery = await problemService.addProblem(
      userId,
      incidentName,
      incidentType,
      start_date,
      end_date,
      address,
      status,
      urlImage
    );

    res.status(200).json({
      status: 200,
      message: "Successfully add problem",
      data: {
        id: userId,
        name,
        problemsQuery,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};

export const addProblemStatus = async (req, res) => {
  const { id, rescueId, typeId, typeName, status } = req.body;

  try {
    const userId = id;
    const problemId = typeId;
    const problemName = typeName;

    const problemUpdated = await problemService.addProblemStatus(
      userId,
      rescueId,
      problemId,
      problemName,
      status
    );

    res.status(200).json({
      status: 200,
      message: "Successfully add problem status",
      data: {
        problemUpdated,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error: " + error.message,
    });
  }
};
