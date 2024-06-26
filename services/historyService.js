import { pool } from "../config/connectToDB.js";

const historyService = {
  async getAllHistoryNaturalDisastersByPageAndLimit(page, limit) {
    const offset = (page - 1) * limit;

    const query = {
      text: `SELECT id, name, casualty_rate, status, created_at
      FROM history_natural_disasters ORDER BY history_natural_disasters.updated_at DESC
      OFFSET $1 LIMIT $2`,
      values: [offset, limit],
    };

    const countQuery = {
      text: `SELECT COUNT(*) FROM history_natural_disasters`,
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
      console.error("Error when fetching history problems", error.stack);
      throw error;
    }
  },

  async getAllHistoryProblemsByPageAndLimit(page, limit) {
    const offset = (page - 1) * limit;

    const query = {
      text: `SELECT id, name, address, status , created_at
      FROM history_problems ORDER BY history_problems.updated_at DESC OFFSET $1 LIMIT $2`,
      values: [offset, limit],
    };

    const countQuery = {
      text: `SELECT COUNT(*) FROM history_problems`,
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
      console.error("Error when fetching history problems", error.stack);
      throw error;
    }
  },

async getIncidentsByUserId(userId) {
  try {
    const query = {
      text: `SELECT * FROM incidents WHERE user_id = $1`,
      values: [userId],
    };
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error in getIncidentsByUserId service:", error.stack);
    throw error;
  }
},

async getHistoryIncidentsByUserId(userId) {
  try {
    const query = {
      text: `SELECT * FROM history_incidents WHERE user_id = $1`,
      values: [userId],
    };
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error in getHistoryIncidentsByUserId service:", error.stack);
    throw error;
  }
},

async getAllIncidentsByUserId(userId) {
  try {
    const query = {
      text: `
        (SELECT 'incident' AS table_name, id, name, type, description, location, status, user_id, created_at, updated_at
        FROM incidents
        WHERE user_id = $1)
        UNION
        (SELECT 'history_incident' AS table_name, id, name, type, description, location, status, user_id, created_at, updated_at
        FROM history_incidents
        WHERE user_id = $1)
        ORDER BY created_at DESC;
      `,
      values: [userId],
    };

    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error in getAllIncidentsByUserId service:", error.stack);
    throw error;
  }
},

};

export default historyService;
