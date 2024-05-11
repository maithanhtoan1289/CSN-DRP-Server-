import userService from "../services/userService.js";
import jwt from "jsonwebtoken";

export const getAllUsersByPageAndLimit = async (req, res) => {
  const { page, limit } = req.query;

  try {
    const users = await userService.getAllUsersByPageAndLimit(page, limit);

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all users",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error" + error.message,
    });
  }
};

export const addCoordinates = async (req, res) => {
  const { userId, phone, address, coordinates } = req.body;

  try {
    const users = await userService.addCoordinates(
      userId,
      address,
      coordinates,
      phone
    );

    res.status(200).json({
      status: 200,
      message: "Successfully add coordinates",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error" + error.message,
    });
  }
};

export const getAllRescueNeeded = async (req, res) => {
  try {
    const users = await userService.getAllRescueNeeded();

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all rescue needed",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error" + error.message,
    });
  }
};

// New
export const getAllRescueSeeker = async (req, res) => {
  try {
    const users = await userService.getAllRescueSeeker();

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all rescue seeker",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error" + error.message,
    });
  }
};

export const getAllRescueHistory = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "Access token not provided",
      });
    }

    const accessToken = token.split(" ")[1];

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const rescueId = decoded.id;

    const users = await userService.getAllRescueHistory(rescueId);

    res.status(200).json({
      status: 200,
      message: "Successfully retrieved all rescue history",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error" + error.message,
    });
  }
};
