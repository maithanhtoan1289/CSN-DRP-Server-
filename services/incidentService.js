

import { pool } from "../config/connectToDB.js";
import stringSimilarity from 'string-similarity';
const incidentService = {
  async addIncident(userId,
  name,
  type,
  description,
  location,
  status,
  hashtags) {
    try {
    if (!hashtags || hashtags.length === 0) {
      hashtags = [location.replace(/\s+/g, '-')]; // Tạo hashtag từ location, ví dụ: "Hanoi" -> "Hanoi"
    }
    const query = {
      text: `INSERT INTO incidents (name, type, description, location, status, user_id, hashtags)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
             values: [name, type, description, location, status, userId, hashtags],
            };
    
    
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error("Error when adding incident", error);
      throw error;
    }
  },
async getAllIncidents() {
  const query = {
    text: `SELECT incidents.id, incidents.name, incidents.type, incidents.description, 
                  incidents.location, incidents.status, incidents.hashtags, 
                  incidents.created_at, incidents.updated_at, users.name AS user_name
           FROM incidents
           INNER JOIN users ON incidents.user_id = users.id
           ORDER BY incidents.created_at DESC`,
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
  
    // Kiểm tra nếu status là 1 (đã giải quyết)
    if (status === 1) {
      try {
        // Lấy thông tin sự cố
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
            incident.name || null,
            incident.type || null,
            incident.description || null,
            incident.location || null,
            'đã giải quyết', // Sử dụng giá trị status được truyền vào
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
    } else {
      // Nếu status không phải là 1, chỉ cập nhật sự cố
      const query = {
        text: `
          UPDATE incidents
          SET name = COALESCE($1, name), type = COALESCE($2, type), description = COALESCE($3, description), 
          location = COALESCE($4, location), status = COALESCE($5, status), updated_at = CURRENT_TIMESTAMP
          WHERE id = $6
          RETURNING *
        `,
        values: [name, type, description, location, status, incidentId],
      };
  
      try {
        const result = await pool.query(query);
        return result.rows[0];
      } catch (error) {
        console.error("Error when updating incident", error);
        throw error;
      }
    }
  }
,  
//tim kiem bang hashtag
  async findHashtagIncidents(startLocation, endLocation) {
    try {
      // Tìm các nhãn gần đúng cho startLocation và endLocation
      const queryStart = {
          text: `
          SELECT DISTINCT unnest(hashtags) AS hashtag 
          FROM incidents 
          WHERE location ILIKE $1
          `,
          values: [`%${startLocation}%`],
      };

      const queryEnd = {
          text: `
          SELECT DISTINCT unnest(hashtags) AS hashtag 
          FROM incidents 
          WHERE location ILIKE $1
          `,
          values: [`%${endLocation}%`],
      };

      const { rows: startHashtags } = await pool.query(queryStart);
      const { rows: endHashtags } = await pool.query(queryEnd);

      // Lấy ra danh sách nhãn từ kết quả truy vấn
      const startTags = startHashtags.map(row => row.hashtag);
      const endTags = endHashtags.map(row => row.hashtag);

      const query = {
          text: `
          SELECT * 
          FROM incidents 
          WHERE 
          (
              (location ILIKE $1 AND $3 && hashtags)
              OR
              (location ILIKE $2 AND $4 && hashtags)
          )
          OR
          (
              $5 = ANY(hashtags)
              OR
              $6 = ANY(hashtags)
          )
          `,
          values: [
              `%${startLocation}%`,
              `%${endLocation}%`,
              startTags,
              endTags,
              startLocation,
              endLocation
          ],
      };

      const { rows } = await pool.query(query);
      return rows;
  } catch (error) {
      console.error("Error in findIncidents service:", error.stack);
      throw error;
  }
},


async deleteIncidentById(incidentId){
  try {
    // Xóa sự cố từ database
    const query = {
      text: "DELETE FROM incidents WHERE id = $1",
      values: [incidentId],
    };
    await pool.query(query);
  } catch (error) {
    console.error("Error when deleting incident", error);
    throw error;
  }
},
async deleteHistoryIncidentById(historyIncidentId)  {
  try {
    const query = {
      text: "DELETE FROM history_incidents WHERE id = $1",
      values: [historyIncidentId],
    };

    await pool.query(query);
  } catch (error) {
    console.error("Error when deleting history incident:", error.stack);
    throw error;
  }
  },
  
};
export default incidentService;
