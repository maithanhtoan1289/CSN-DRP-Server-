import { pool } from "../config/connectToDB.js";
import STATUS_ALL from "../enums/statusAll.js";

const naturalDisasterService = {
  async getAllNaturalDisastersByPageAndLimit(page, limit) {
    const offset = (page - 1) * limit;

    const query = {
      text: `SELECT id, name, type, start_date, end_date, effected_area, status 
             FROM natural_disasters 
             WHERE end_date IS NULL
             ORDER BY updated_at DESC
             OFFSET $1 LIMIT $2`,
      values: [offset, limit],
    };

    const countQuery = {
      text: `SELECT COUNT(*) FROM natural_disasters`,
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
      console.error("Error when fetching natural disasters", error.stack);
      throw error;
    }
  },

  async addNaturalDisaster(
    userId,
    naturalDisasterName,
    naturalDisasterType,
    start_date,
    end_date,
    effected_area,
    status,
    urlImage,
    priority,

  ) {
    const query = {
      text: `INSERT INTO natural_disasters (user_id, name, type, start_date, end_date, effected_area, address, status, url_image,     priority)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name, type, start_date, end_date, effected_area, address, status, url_image,     priority      `,
      values: [
        userId,
        naturalDisasterName,
        naturalDisasterType,
        start_date,
        end_date,
        effected_area,
        effected_area,
        status,
        urlImage,
        priority,

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
        effected_area,
        address,
        status,
        url_image,
        priority,

      } = result.rows[0];

      return {
        id_natural_disaster: id,
        name,
        type,
        start_date,
        end_date,
        effected_area,
        address,
        status,
        url_image,
        priority,

      };
    } catch (error) {
      console.error("Error when adding natural disaster", error.stack);
      throw error;
    }
  },

  async addNaturalDisasterStatus(userId, rescueId, naturalDisasterId) {
    try {
      // Check if the natural disaster record with the provided id exists
      const checkQuery = {
        text: "SELECT * FROM natural_disasters WHERE id = $1",
        values: [naturalDisasterId],
      };

      const checkResult = await pool.query(checkQuery);

      if (checkResult.rows.length === 0) {
        throw new Error("Natural disaster with the provided id does not exist");
      }

      const endDate = new Date();

      // Update the status of the natural disaster in the natural_disasters table
      const updateQuery = {
        text: `UPDATE natural_disasters SET status = $1, end_date = $2 WHERE id = $3 RETURNING id, name, end_date, effected_area, status`,
        values: [STATUS_ALL.KET_THUC, endDate, naturalDisasterId],
      };

      const result = await pool.query(updateQuery);

      const { id, name, status } = result.rows[0];

      const casualtyRate = STATUS_ALL.CHUA_CAP_NHAT;
      const historyStatus = STATUS_ALL.HOAN_THANH;

      // Insert the natural disaster status into the history_natural_disasters table
      const insertQuery = {
        text: `INSERT INTO history_natural_disasters (name, casualty_rate, status, rescue_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        values: [name, casualtyRate, historyStatus, rescueId],
      };

      const historyNaturalDisastersId = await pool.query(insertQuery);

      // Update the natural disaster record with the history id
      const updateNaturalDisasterQuery = {
        text: `UPDATE natural_disasters SET history_id = $1 WHERE id = $2 RETURNING id`,
        values: [historyNaturalDisastersId.rows[0].id, naturalDisasterId],
      };

      await pool.query(updateNaturalDisasterQuery);

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
      console.error("Error when adding natural disaster status", error.stack);
      throw error;
    }
  },

  // Task 1
  async editNaturalDisasterPriority(naturalDisasterId, priority) {
    try {
      // Check if the natural disaster exists
      const checkQuery = {
        text: "SELECT * FROM natural_disasters WHERE id = $1",
        values: [naturalDisasterId],
      };

      const checkResult = await pool.query(checkQuery);

      if (checkResult.rowCount === 0) {
        // Use rowCount for existence check
        throw new Error("Natural disaster with the provided id does not exist");
      }

      // Update the priority
      const updateQuery = {
        text: "UPDATE natural_disasters SET priority = $1 WHERE id = $2",
        values: [priority, naturalDisasterId],
      };

      const result = await pool.query(updateQuery);

      if (result.rowCount === 0) {
        // Use rowCount for update check
        throw new Error("Failed to update natural disaster priority");
      }

      return { id: naturalDisasterId, priority }; // Simplify return object
    } catch (error) {
      console.error("Error editing natural disaster priority:", error.stack);
      throw error; // Re-throw for further handling
    }
  },
};
export default naturalDisasterService;
