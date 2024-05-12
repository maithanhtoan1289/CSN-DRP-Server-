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
};
// function levenshteinDistance(str1, str2) {
//   const len1 = str1.length;
//   const len2 = str2.length;
//   const matrix = [];
//   for (let i = 0; i <= len1; i++) {
//     matrix[i] = [i];
//   }
//   for (let j = 0; j <= len2; j++) {
//     matrix[0][j] = j;
//   }
//   for (let i = 1; i <= len1; i++) {
//     for (let j = 1; j <= len2; j++) {
//       const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
//       matrix[i][j] = Math.min(
//         matrix[i - 1][j] + 1,
//         matrix[i][j - 1] + 1,
//         matrix[i - 1][j - 1] + cost
//       );
//     }
//   }

//   return matrix[len1][len2];
// }


// function findSimilarityScore(str1, str2) {
//   const maxLength = Math.max(str1.length, str2.length);
//   const distance = levenshteinDistance(str1, str2);
//   return 1 - distance / maxLength;
// }

// export const findMatches = async (user_id) => {
//   const client = await pool.connect();
// try {
//   // Lấy thông tin địa chỉ và số điện thoại của người dùng từ bảng users
//   const userResult = await client.query('SELECT address, phone FROM users WHERE id = $1', [user_id]);
//   if (userResult.rows.length === 0) {
//     throw new Error('User not found');
//   }
//   const { address, phone } = userResult.rows[0];

//   // Lấy tất cả các sở trường của người dùng từ bảng expertise
//   const expertiseResult = await client.query('SELECT specialty FROM expertise WHERE user_id = $1', [user_id]);
//   if (expertiseResult.rows.length === 0) {
//     throw new Error('User expertise not found');
//   }

//   // Khởi tạo đối tượng matches
//   const matches = {
//     problems: [],
//     natural_disasters: [],
//     incidents: []
//   };

//   // Duyệt qua từng sở trường của người dùng
//   for (let i = 0; i < expertiseResult.rows.length; i++) {
//     const expertise = expertiseResult.rows[i].specialty;

//     // Tìm các sự kiện tương tự trong mỗi bảng và thêm vào matches
//     const problemResult = await client.query('SELECT p.id AS problem_id, p.name AS problem_name, p.type AS problem_type, u.name AS user_name, u.address AS user_address, u.phone AS user_phone FROM problems p JOIN users u ON p.user_id = u.id');
//     for (const problem of problemResult.rows) {
//       const similarity = calculateSimilarity(problem.problem_name, expertise);
//       if (similarity > 0.5) {
//         matches.problems.push({ ...problem, similarity, user_address: address, user_phone: phone });
//       }
//     }

//     const disasterResult = await client.query('SELECT d.id AS disaster_id, d.name AS disaster_name, d.type AS disaster_type, u.name AS user_name, u.address AS user_address, u.phone AS user_phone FROM natural_disasters d JOIN users u ON d.user_id = u.id');
//     for (const disaster of disasterResult.rows) {
//       const similarity = calculateSimilarity(disaster.disaster_name, expertise);
//       if (similarity > 0.5) {
//         matches.natural_disasters.push({ ...disaster, similarity, user_address: address, user_phone: phone });
//       }
//     }

//     const incidentResult = await client.query('SELECT i.id AS incident_id, i.name AS incident_name, i.type AS incident_type, u.name AS user_name, u.address AS user_address, u.phone AS user_phone FROM incidents i JOIN users u ON i.user_id = u.id');
//     for (const incident of incidentResult.rows) {
//       const similarity = calculateSimilarity(incident.incident_name, expertise);
//       if (similarity > 0.5) {
//         matches.incidents.push({ ...incident, similarity, user_address: address, user_phone: phone });
//       }
//     }
//   }

//   return matches;
//   } finally {
//     client.release();
//   }
// };
function calculateSimilarity(str1, str2) {
  const set1 = new Set(str1.toLowerCase().split(' '));
  const set2 = new Set(str2.toLowerCase().split(' '));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const similarity = intersection.size / Math.min(set1.size, set2.size);
  return similarity;
}

export const findMatches = async (user_id) => {
  const client = await pool.connect();

  try {
    // Lấy thông tin địa chỉ và số điện thoại của người dùng từ bảng users
    const userResult = await client.query('SELECT name,address, phone FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    const { name,address, phone } = userResult.rows[0];

    // Lấy tất cả các sở trường của người dùng từ bảng expertise
    const expertiseResult = await client.query('SELECT specialty FROM expertise WHERE user_id = $1', [user_id]);
    if (expertiseResult.rows.length === 0) {
      throw new Error('User expertise not found');
    }

    // Khởi tạo một Set để lưu trữ id của các sự kiện đã thêm vào kết quả
    const addedEvents = new Set();

    // Khởi tạo đối tượng matches
    const matches = {
      problems: [],
      natural_disasters: [],
      incidents: []
    };

    // Duyệt qua từng sở trường của người dùng
    for (let i = 0; i < expertiseResult.rows.length; i++) {
      const expertise = expertiseResult.rows[i].specialty;

      // Tìm các sự kiện tương tự trong mỗi bảng và thêm vào matches nếu chưa được thêm trước đó
      const problemResult = await client.query('SELECT id, name FROM problems');
      for (const problem of problemResult.rows) {
        if (!addedEvents.has(problem.id)) {
          matches.problems.push({ ...problem,user_name: name, user_address: address, user_phone: phone });
          addedEvents.add(problem.id);
        }
      }

      const disasterResult = await client.query('SELECT id, name FROM natural_disasters');
      for (const disaster of disasterResult.rows) {
        if (!addedEvents.has(disaster.id)) {
          matches.natural_disasters.push({ ...disaster,user_name: name, user_address: address, user_phone: phone });
          addedEvents.add(disaster.id);
        }
      }

      const incidentResult = await client.query('SELECT id, name FROM incidents');
      for (const incident of incidentResult.rows) {
        if (!addedEvents.has(incident.id)) {
          matches.incidents.push({ ...incident, user_name: name,user_address: address, user_phone: phone });
          addedEvents.add(incident.id);
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
        SELECT id, name, type FROM problems WHERE user_id = $1 
        UNION 
        SELECT id, name, type FROM natural_disasters WHERE user_id = $1 
        UNION 
        SELECT id, name, type FROM incidents WHERE user_id = $1
      ) e;
    `, [user_id]);


    const allExpertiseResult = await client.query('SELECT user_id, specialty FROM expertise');
    const allExpertise = allExpertiseResult.rows;


    const allUsersResult = await client.query('SELECT id,name, address, phone FROM users');
    const allUsers = allUsersResult.rows;
    const addedUsers = new Set();

    const matchedEvents = [];
    for (const { id: event_id, name: event_name, type: event_type } of currentUserEvents.rows) {
      for (const { user_id: current_user_id, specialty } of allExpertise) {
        const similarity = calculateSimilarity(specialty, event_name);
        if (similarity > 0.2 && current_user_id !== user_id && !addedUsers.has(current_user_id)) {
          const user = allUsers.find(u => u.id === current_user_id);
          if (user) {
            matchedEvents.push({
              //event_id,
              //event_name,
             // event_type,
             user_name:user.name,
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