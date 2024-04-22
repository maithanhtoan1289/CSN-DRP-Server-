import { pool } from "../config/connectToDB.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userService from "../services/userService.js";

export const register = async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword, role } = req.body;

    const usernameExists = await userService.checkUsernameExists(username);

    if (usernameExists) {
      return res.status(400).json({
        status: 400,
        message: "Username already exists",
      });
    }

    const emailExists = await userService.checkEmailExists(email);

    if (emailExists) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        message: "Passwords do not match",
      });
    }

    const avatar = `https://avatar.iran.liara.run/username?username=${name}`;

    // Tạo vai trò và lấy roleId tương ứng
    const roleId = await userService.createRole(role);

    // console.log(roleId);

    const phone = null;
    const coordinates = null;
    const address = null;

    const userId = await userService.createUser(
      name,
      username,
      email,
      password,
      roleId,
      phone,
      coordinates,
      address,
      avatar
    );

    res.status(201).json({
      status: 201,
      message: "User created successfully",
      data: {
        id: userId,
        name,
        username,
        email,
        avatar,
        coordinates,
        address,
        role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const usernameQuery = {
      text: `
      SELECT users.id, users.name, users.username, users.avatar, users.address, users.coordinates, roles.name AS role, users.password
      FROM users
      INNER JOIN user_role ON users.id = user_role.user_id
      INNER JOIN roles ON user_role.role_id = roles.id
      WHERE users.username = $1
    `,
      values: [username],
    };

    const { rows } = await pool.query(usernameQuery);

    if (rows.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Username does not exist",
      });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        status: 400,
        message: "Invalid password",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar || null,
        coordinates: user.coordinates || null,
        address: user.address || null,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 86400 }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar || null,
        coordinates: user.coordinates || null,
        address: user.address || null,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: 172800 }
    );

    const accessTokenExpirationDate = new Date(Date.now() + 20 * 1000);
    const refreshTokenExpirationDate = new Date(Date.now() + 60 * 1000);

    accessTokenExpirationDate.setUTCHours(
      accessTokenExpirationDate.getUTCHours() + 7
    );
    refreshTokenExpirationDate.setUTCHours(
      refreshTokenExpirationDate.getUTCHours() + 7
    );

    const accessTokenExpirationISO = accessTokenExpirationDate.toISOString();

    const refreshTokenExpirationISO = refreshTokenExpirationDate.toISOString();

    res.status(200).json({
      status: 200,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        coordinates: user.coordinates,
        address: user.address,
        role: user.role,
        accessToken,
        refreshToken,
        accessTokenExpires: accessTokenExpirationISO,
        refreshTokenExpires: refreshTokenExpirationISO,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");

    res.clearCookie("refreshToken");

    res.status(200).json({
      status: 200,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

export const refreshToken = (req, res) => {
  try {
    // Đặt múi giờ cho quá trình xử lý
    process.env.TZ = "Asia/Ho_Chi_Minh";

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 401,
        message: "Refresh token not provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      console.error("Error verifying refresh token:", error);
      return res.status(401).json({
        status: 401,
        message: "Invalid refresh token",
      });
    }

    const { userId, name, username, role } = decoded;

    const accessToken = jwt.sign(
      {
        userId,
        name,
        username,
        role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 20 }
    );

    // Trả về accessToken mới
    res.status(200).json({
      status: 200,
      message: "New access token generated successfully",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

export const profile = async (req, res) => {
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
    const userId = decoded.id;

    const userQuery = {
      text: `
      SELECT users.id, users.name, users.username, roles.name AS role
      FROM users
      INNER JOIN user_role ON users.id = user_role.user_id
      INNER JOIN roles ON user_role.role_id = roles.id
      WHERE users.id = $1
    `,
      values: [userId],
    };

    const { rows } = await pool.query(userQuery);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const user = rows[0];

    res.status(200).json({
      status: 200,
      message: "User get profile successfully",
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
