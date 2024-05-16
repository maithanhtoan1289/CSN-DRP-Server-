import { pool } from "../config/connectToDB.js";
export const getExpertiseByUserId = async (userId) => {
    try {
        const query = {
            text: "SELECT * FROM expertise WHERE user_id = $1",
            values: [userId]
        };

        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error when getting expertise by user ID:", error);
        throw error;
    }
};
// Thêm một bản ghi mới vào bảng expertise
export const addExpertise = async (userId, specialty, description) => {
    try {
        const query = {
            text: "INSERT INTO expertise (user_id, specialty, description) VALUES ($1, $2, $3) RETURNING *",
            values: [userId, specialty, description]
        };

        const result = await pool.query(query);
        return result.rows[0];
    } catch (error) {
        console.error("Error when adding expertise:", error);
        throw error;
    }
};

// Cập nhật một bản ghi trong bảng expertise
export const updateExpertise = async (expertiseId, specialty, description) => {
    try {
        const query = {
            text: "UPDATE expertise SET specialty = $1, description = $2 WHERE id = $3 RETURNING *",
            values: [specialty, description, expertiseId]
        };

        const result = await pool.query(query);
        return result.rows[0];
    } catch (error) {
        console.error("Error when updating expertise:", error);
        throw error;
    }
};

// Xóa một bản ghi từ bảng expertise
export const deleteExpertise = async (expertiseId) => {
    try {
        const query = {
            text: "DELETE FROM expertise WHERE id = $1 RETURNING *",
            values: [expertiseId]
        };

        const result = await pool.query(query);
        return result.rows[0];
    } catch (error) {
        console.error("Error when deleting expertise:", error);
        throw error;
    }
};function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function calculateSimilarity(str1, str2) {
  const normalizedStr1 = removeAccents(str1.toLowerCase());
  const normalizedStr2 = removeAccents(str2.toLowerCase());
  const set1 = new Set(normalizedStr1.split(' '));
  const set2 = new Set(normalizedStr2.split(' '));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const similarity = intersection.size / Math.min(set1.size, set2.size);
  return similarity;
}
export const findMatches = async (user_id) => {
  const client = await pool.connect();

  try {
    const userResult = await client.query('SELECT name, address, phone FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    const { name, address, phone } = userResult.rows[0];

    const expertiseResult = await client.query('SELECT specialty FROM expertise WHERE user_id = $1', [user_id]);
    if (expertiseResult.rows.length === 0) {
      throw new Error('User expertise not found');
    }


    const addedEvents = new Set();


    const matches = {
      problems: [],
      natural_disasters: [],
      incidents: []
    };

    const eventTypes = ['problems', 'natural_disasters', 'incidents'];
    for (const eventType of eventTypes) {
      const eventResult = await client.query(`SELECT id, name, user_id FROM ${eventType}`);

      for (const event of eventResult.rows) {
        const { id: eventId, name: eventName, user_id: eventUserId } = event;

        if (!addedEvents.has(eventId)) {
          const eventUserResult = await client.query('SELECT name, address, phone FROM users WHERE id = $1', [eventUserId]);
          if (eventUserResult.rows.length === 0) {
            throw new Error('User not found');
          }
          const { name: eventUserName, address: eventUserAddress, phone: eventUserPhone } = eventUserResult.rows[0];

          for (const expertiseRow of expertiseResult.rows) {
            const specialty = expertiseRow.specialty;
            const similarity = calculateSimilarity(specialty, eventName);


            if (similarity > 0.2) {
              matches[eventType].push({
                id: eventId,
                name: eventName,
                user_name: eventUserName,
                user_address: eventUserAddress,
                user_phone: eventUserPhone,
              });
              addedEvents.add(eventId);
              break; 
            }
          }
        }
      }
    }

    return matches;
  } finally {
    client.release();
  }
};

export const findRelatedUsersToCurrentUserEvents = async (user_id) => {
  const client = await pool.connect();

  try {
    const currentUserEvents = await client.query(`
      SELECT e.id, e.name, e.type 
      FROM ( 
        SELECT id, name, 'problem' as type FROM problems WHERE user_id = $1 
        UNION 
        SELECT id, name, 'natural_disaster' as type FROM natural_disasters WHERE user_id = $1 
        UNION 
        SELECT id, name, 'incident' as type FROM incidents WHERE user_id = $1
      ) e;
    `, [user_id]);

    const allExpertiseResult = await client.query('SELECT user_id, specialty FROM expertise');
    const allExpertise = allExpertiseResult.rows;

    const allUsersResult = await client.query('SELECT id, name, address, phone FROM users');
    const allUsers = allUsersResult.rows;

    const addedUsers = new Set();
    const matchedEvents = [];
    for (const { id: event_id, name: event_name, type: event_type } of currentUserEvents.rows) {
      for (const { user_id: current_user_id, specialty } of allExpertise) {
        const similarity = calculateSimilarity(specialty, event_name);
        if (similarity > 0.1 && current_user_id !== user_id) {
          const user = allUsers.find(u => u.id === current_user_id);
          if (user && !addedUsers.has(current_user_id)) {
            matchedEvents.push({
              
              user_name: user.name,
              user_id: current_user_id,
              specialty,
              user_address: user.address,
              user_phone: user.phone
            });
            addedUsers.add(current_user_id);
          }
        }
      }
    }

    return matchedEvents;
  } finally {
    client.release();
  }
};