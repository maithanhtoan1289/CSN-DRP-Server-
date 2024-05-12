import { pool } from "../config/connectToDB.js";
import bcrypt from "bcryptjs";

const userService = {
  async checkUsernameExists(username) {
    const query = {
      text: "SELECT EXISTS (SELECT 1 FROM users WHERE username = $1)",
      values: [username],
    };

    try {
      const { rows } = await pool.query(query);
      return rows[0].exists;
    } catch (error) {
      console.error("Error when checking if username exists", error.stack);
      throw error;
    }
  },

  async checkEmailExists(email) {
    const query = {
      text: "SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)",
      values: [email],
    };

    try {
      const { rows } = await pool.query(query);
      return rows[0].exists;
    } catch (error) {
      console.error("Error when checking if email exists", error.stack);
      throw error;
    }
  },

  async createRole(role) {
    try {
      const checkRoleQuery = {
        text: "SELECT id FROM roles WHERE name = $1",
        values: [role],
      };

      const { rowCount, rows } = await pool.query(checkRoleQuery);

      if (rowCount > 0) {
        return rows[0].id;
      } else {
        const insertRoleQuery = {
          text: "INSERT INTO roles (name) VALUES ($1) RETURNING id",
          values: [role],
        };

        const { rows } = await pool.query(insertRoleQuery);

        return rows[0].id;
      }
    } catch (error) {
      console.error("Error when creating role", error.stack);
      throw error;
    }
  },

  async createUser(
    name,
    username,
    email,
    password,
    roleId,
    phone,
    coordinates,
    address,
    avatar
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const newUserQuery = {
        text: `
          INSERT INTO users (name, username, email, password, phone, coordinates, address, avatar)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (username, email) DO NOTHING
          RETURNING id
        `,
        values: [
          name,
          username,
          email,
          hashedPassword,
          phone,
          coordinates,
          address,
          avatar,
        ],
      };
      const { rows } = await client.query(newUserQuery);

      if (rows.length === 0) {
        throw new Error("A user with this username or email already exists.");
      }

      const userId = rows[0].id;

      const userRoleQuery = {
        text: "INSERT INTO user_role (user_id, role_id) VALUES ($1, $2)",
        values: [userId, roleId],
      };
      await client.query(userRoleQuery);

      await client.query("COMMIT");
      return userId;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error when creating user", error.stack);
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllUsersByPageAndLimit(page, limit) {
    const offset = (page - 1) * limit;

    const query = {
      text: `SELECT users.id, users.name, users.email, users.address, users.phone, roles.name AS role
      FROM users
      INNER JOIN user_role ON users.id = user_role.user_id
      INNER JOIN roles ON user_role.role_id = roles.id
      WHERE roles.name = $1
      ORDER BY users.updated_at DESC
      OFFSET $2 LIMIT $3`,
      values: ["ROLE_USER", offset, limit],
    };

    const countQuery = {
      text: `SELECT COUNT(*) FROM users
      INNER JOIN user_role ON users.id = user_role.user_id
      INNER JOIN roles ON user_role.role_id = roles.id
      WHERE roles.name = $1`,
      values: ["ROLE_USER"],
    };

    try {
      const result = await Promise.all([
        pool.query(query),
        pool.query(countQuery),
      ]);

      const rows = result[0].rows;
      const totalCount = result[1].rows[0].count;
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = page;

      return { totalPages, currentPage, limit, rows };
    } catch (error) {
      console.error("Error when fetching users", error.stack);
      throw error;
    }
  },

  async getAllEmployeesByPageAndLimit(page, limit) {
    const offset = (page - 1) * limit;

    const query = {
      text: `SELECT users.id, users.name, users.email, users.address, users.phone, roles.name AS role
      FROM users
      INNER JOIN user_role ON users.id = user_role.user_id
      INNER JOIN roles ON user_role.role_id = roles.id
      WHERE roles.name = $1
      ORDER BY users.updated_at DESC
      OFFSET $2 LIMIT $3`,
      values: ["ROLE_RESCUER", offset, limit],
    };

    const countQuery = {
      text: `SELECT COUNT(*) FROM users
      INNER JOIN user_role ON users.id = user_role.user_id
      INNER JOIN roles ON user_role.role_id = roles.id
      WHERE roles.name = $1`,
      values: ["ROLE_RESCUER"],
    };

    try {
      const result = await Promise.all([
        pool.query(query),
        pool.query(countQuery),
      ]);

      const rows = result[0].rows;
      const totalCount = result[1].rows[0].count;
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = page;

      return { totalPages, currentPage, limit, rows };
    } catch (error) {
      console.error("Error when fetching employees", error.stack);
      throw error;
    }
  },

  async addCoordinates(userId, address, coordinates, phone) {
    try {
      const updateQuery = {
        text: "UPDATE users SET address = $1, coordinates = $2, phone = $3 WHERE id = $4",
        values: [address, coordinates, phone, userId],
      };

      await pool.query(updateQuery);
    } catch (error) {
      console.error("Error when adding coordinates", error.stack);
      throw error;
    }
  },

  async getAllRescueNeeded() {
    const query = {
      text: `SELECT users.id, users.name, users.email, users.address, users.phone, users.coordinates, users.avatar, roles.name AS role, 
      natural_disasters.id AS disaster_id ,natural_disasters.name AS disaster_name, natural_disasters.status AS disaster_status, natural_disasters.url_image AS disaster_url_image,
      problems.id AS problem_id, problems.name AS problem_name, problems.status AS problem_status, problems.url_image AS problem_url_image
              FROM users
              INNER JOIN user_role ON users.id = user_role.user_id
              INNER JOIN roles ON user_role.role_id = roles.id
              LEFT JOIN natural_disasters ON users.id = natural_disasters.user_id
              LEFT JOIN problems ON users.id = problems.user_id
              WHERE roles.name = $1
                AND users.phone IS NOT NULL
                AND users.address IS NOT NULL
                AND users.coordinates IS NOT NULL
                AND (natural_disasters.status <> 'kết thúc' OR problems.status <> 'kết thúc')
              ORDER BY users.updated_at DESC`,
      values: ["ROLE_USER"],
    };

    try {
      const result = await Promise.all([pool.query(query)]);

      const rows = result[0].rows;

      return { rows };
    } catch (error) {
      console.error("Error when fetching users", error.stack);
      throw error;
    }
  },

  // New
  async getAllRescueSeeker() {
    const query = {
      text: `SELECT users.id, users.name, users.email, users.address, users.phone, users.coordinates, users.avatar, roles.name AS role
      FROM users
      INNER JOIN user_role ON users.id = user_role.user_id
      INNER JOIN roles ON user_role.role_id = roles.id
      WHERE roles.name = $1
      ORDER BY users.updated_at DESC
      `,
      values: ["ROLE_RESCUER"],
    };

    try {
      const result = await Promise.all([pool.query(query)]);

      const rows = result[0].rows;

      return { rows };
    } catch (error) {
      console.error("Error when fetching users", error.stack);
      throw error;
    }
  },

  async getAllRescueHistory(rescueId) {
    try {
      // Truy vấn id từ history_natural_disasters và history_problems
      const queryDisastersIds = {
        text: `
                SELECT id
                FROM history_natural_disasters
                WHERE rescue_id = $1;
            `,
        values: [rescueId],
      };

      const queryProblemsIds = {
        text: `
                SELECT id
                FROM history_problems
                WHERE rescue_id = $1;
            `,
        values: [rescueId],
      };

      // Thực hiện truy vấn để lấy id của thiên tai và sự cố
      const [resultDisastersIds, resultProblemsIds] = await Promise.all([
        pool.query(queryDisastersIds),
        pool.query(queryProblemsIds),
      ]);

      // Lấy danh sách id của thiên tai và sự cố
      const disastersIds = resultDisastersIds.rows.map((row) => row.id);
      const problemsIds = resultProblemsIds.rows.map((row) => row.id);

      // Kiểm tra nếu cả hai đều không có giá trị, trả về một mảng rỗng
      if (disastersIds.length === 0 && problemsIds.length === 0) {
        return [];
      }

      // Truy vấn toàn bộ thông tin từ bảng natural_disasters và problems dựa trên history_id
      const queries = [];

      if (disastersIds.length > 0) {
        queries.push({
          text: `
                    SELECT natural_disasters.*, users.id, users.name, users.phone, users.coordinates, users.avatar
                    FROM natural_disasters
                    INNER JOIN users ON natural_disasters.user_id = users.id
                    INNER JOIN history_natural_disasters ON natural_disasters.history_id = history_natural_disasters.id
                    WHERE natural_disasters.history_id IN (${disastersIds.join(
                      ","
                    )});
                `,
        });
      }

      if (problemsIds.length > 0) {
        queries.push({
          text: `
                    SELECT problems.*, users.id, users.name, users.phone, users.coordinates, users.avatar
                    FROM problems
                    INNER JOIN users ON problems.user_id = users.id
                    INNER JOIN history_problems ON problems.history_id = history_problems.id
                    WHERE problems.history_id IN (${problemsIds.join(",")});
                `,
        });
      }

      // Thực hiện truy vấn chỉ khi có ít nhất một danh sách id không rỗng
      const results = await Promise.all(
        queries.map((query) => pool.query(query))
      );

      // Lấy các hàng từ kết quả truy vấn
      const allRescueHistory = results.flatMap((result) => result.rows);

      return allRescueHistory;
    } catch (error) {
      console.error("Error when fetching rescue history", error.stack);
      throw error;
    }
  },
  async getUserProfile(userId) {
    try {
      const query = {
        text: "SELECT name, phone, address, email FROM users WHERE id = $1",
        values: [userId],
      };

      const { rows } = await pool.query(query);
      return rows[0];
    } catch (error) {
      console.error("Error when getting user profile:", error.stack);
      throw error;
    }
  },
  
  async updateUserProfile(userId, newData) {
    try {
      const { name, phone, address, email } = newData;
      const query = {
        text: `
          UPDATE users
          SET name = $1, phone = $2, address = $3, email = $4
          WHERE id = $5
          RETURNING *
        `,
        values: [name, phone, address, email, userId],
      };
      const { rows } = await pool.query(query);
      return rows[0];
    } catch (error) {
      console.error("Error when updating user profile:", error.stack);
      throw error;
    }
  },
  
};

export default userService;
