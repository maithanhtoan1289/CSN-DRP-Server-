

import { pool } from "../config/connectToDB.js";

const incidentService = {
  async addIncident(userId,
  name,
  type,
  description,
  location,
  status,
  hashtags) {

    const query = {
      text: `INSERT INTO incidents (name, type, description, location, status, user_id, hashtags)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
             values: [name, type, description, location, status, userId, hashtags],
            };
    
    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error("Error when adding incident", error);
      throw error;
    }
  },

  async getAllIncidents() {
    const query = {
      text: `SELECT id, name, type, description, location, status,hashtags, created_at, updated_at
      FROM incidents
      ORDER BY created_at DESC`,
    };

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error when fetching all incidents", error);
      throw error;
    }
  },

  async updateIncident(incidentId, newData) {
    const { name, type, description, location, status } = newData;

    const query = {
      text: `UPDATE incidents
      SET name = $1, type = $2, description = $3, location = $4, status = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *`,
      values: [name, type, description, location, status, incidentId],
    };

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error("Error when updating incident", error);
      throw error;
    }
  },

  async findIncidents(startLocation, endLocation) {
    try {
      const query = {
        text: `
        SELECT * 
        FROM incidents 
        WHERE location ILIKE $1 
        OR location ILIKE $2 
        OR $3 = ANY(hashtags) 
        OR $4 = ANY(hashtags)
      `,
        values: [
          `%${startLocation}%`,
          `%${endLocation}%`,
          startLocation,
          endLocation,
        ],
      };
  
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error in findIncidents service:", error.stack);
      throw error;
    }
  },
  async moveIncidentToHistory(incidentId) {
    try {
      // Lấy thông tin sự cố cần di chuyển sang lịch sử
      const getIncidentQuery = {
        text: 'SELECT * FROM incidents WHERE id = $1',
        values: [incidentId],
      };

      const { rows } = await pool.query(getIncidentQuery);
      const incident = rows[0];

      if (!incident) {
        throw new Error('Incident not found');
      }

      // Chuyển sự cố sang bảng history_incidents
      const moveQuery = {
        text: `
          INSERT INTO history_incidents(name, type, description, location, status, user_id, hashtags, created_at, updated_at)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        values: [
          incident.name,
          incident.type,
          incident.description,
          incident.location,
          'đã giải quyết',
          incident.user_id,
          incident.hashtags,
          incident.created_at,
          incident.updated_at,
        ],
      };

      await pool.query(moveQuery);

      // Xóa sự cố khỏi bảng incidents
      const deleteQuery = {
        text: 'DELETE FROM incidents WHERE id = $1',
        values: [incidentId],
      };

      await pool.query(deleteQuery);

      return 'Incident moved to history successfully';
    } catch (error) {
      console.error('Error when moving incident to history:', error.stack);
      throw error;
    }
  },
  
  
};
export default incidentService;
