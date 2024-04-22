import { pool } from "../config/connectToDB.js";
import STATUS_ALL from "../enums/statusAll.js";

const problemService = {
  async getAllProblemsByPageAndLimit(page, limit) {
    const offset = (page - 1) * limit;

    const query = {
      text: `SELECT id, name, type, start_date, end_date, address, status 
      FROM problems 
      WHERE end_date IS NULL
      ORDER BY problems.updated_at DESC
      OFFSET $1 LIMIT $2`,
      values: [offset, limit],
    };

    const countQuery = {
      text: `SELECT COUNT(*) FROM problems`,
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
      console.error("Error when fetching problems", error.stack);
      throw error;
    }
  },

  async addProblem(
    userId,
    incidentName,
    incidentType,
    start_date,
    end_date,
    address,
    status,
    urlImage
  ) {
    const query = {
      text: `INSERT INTO problems (user_id, name, type, start_date, end_date, address, status, url_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, type, start_date, end_date, address, status, url_image`,
      values: [
        userId,
        incidentName,
        incidentType,
        start_date,
        end_date,
        address,
        status,
        urlImage,
      ],
    };

    try {
      const result = await pool.query(query);
      const {
        id,
        name,
        type,
        start_date,
        end_date,
        address,
        status,
        url_image,
      } = result.rows[0];

      return {
        id_problem: id,
        name,
        type,
        start_date,
        end_date,
        address,
        status,
        url_image,
      };
    } catch (error) {
      console.error("Error when adding problem", error.stack);
      throw error;
    }
  },

  async addProblemStatus(userId, rescueId, problemId) {
    try {
      // Check if the natural disaster record with the provided id exists
      const checkQuery = {
        text: "SELECT * FROM problems WHERE id = $1",
        values: [problemId],
      };

      const checkResult = await pool.query(checkQuery);

      if (checkResult.rows.length === 0) {
        throw new Error("Natural disaster with the provided id does not exist");
      }

      const endDate = new Date();

      // Update the status of the natural disaster in the natural_disasters table
      const updateQuery = {
        text: `UPDATE problems SET status = $1, end_date = $2 WHERE id = $3 RETURNING id, name, address, end_date, status`,
        values: [STATUS_ALL.KET_THUC, endDate, problemId],
      };

      const result = await pool.query(updateQuery);

      const { id, name, address, status } = result.rows[0];

      const problemStatus = STATUS_ALL.DA_KHAC_PHUC;

      const insertQuery = {
        text: `INSERT INTO history_problems (name, address, status, rescue_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        values: [name, address, problemStatus, rescueId],
      };

      const historyProblemsId = await pool.query(insertQuery);

      const updateProblemQuery = {
        text: `UPDATE problems SET history_id = $1 WHERE id = $2 RETURNING id`,
        values: [historyProblemsId.rows[0].id, problemId],
      };

      await pool.query(updateProblemQuery);

      const updateCoordinatesUserQuery = {
        text: `UPDATE users SET coordinates = $1 WHERE id = $2`,
        values: [null, userId],
      };

      await pool.query(updateCoordinatesUserQuery);

      return {
        id,
        name,
        status,
      };
    } catch (error) {
      console.error("Error when adding problem status", error.stack);
      throw error;
    }
  },
};

export default problemService;
