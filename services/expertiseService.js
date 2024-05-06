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

//   try {
//     // Lấy tất cả các sở trương của người dùng 
//     const expertiseResult = await client.query('SELECT specialty FROM expertise WHERE user_id = $1', [user_id]);
//     if (expertiseResult.rows.length === 0) {
//       throw new Error('User expertise not found');
//     }
//    // console.log(expertiseResult)
//     // Duyệt qua từng sở trường
//     const matches = {
//       problems: [],
//       natural_disasters: [],
//       incidents: []
//     };

//     for (let i = 0; i < expertiseResult.rows.length; i++) {
//       const expertise = expertiseResult.rows[i].specialty;
//       const problemResult = await client.query('SELECT name, type FROM problems');
//       matches.problems.push(...problemResult.rows.filter(problem => findSimilarityScore(problem.name.toLowerCase(), expertise.toLowerCase()) > 0.5));

//       const disasterResult = await client.query('SELECT name, type FROM natural_disasters');
//       matches.natural_disasters.push(...disasterResult.rows.filter(disaster => findSimilarityScore(disaster.name.toLowerCase(), expertise.toLowerCase()) > 0.5));

//       const incidentResult = await client.query('SELECT name, type FROM incidents');
//       matches.incidents.push(...incidentResult.rows.filter(incident => findSimilarityScore(incident.name.toLowerCase(), expertise.toLowerCase()) > 0.5));
  
//     }

//     return matches;
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
    // Lấy tất cả các sở trường của người dùng 
    const expertiseResult = await client.query('SELECT specialty FROM expertise WHERE user_id = $1', [user_id]);
    if (expertiseResult.rows.length === 0) {
      throw new Error('User expertise not found');
    }

    const matches = {
      problems: [],
      natural_disasters: [],
      incidents: []
    };

    // Duyệt qua từng sở trường của người dùng
    for (let i = 0; i < expertiseResult.rows.length; i++) {
      const expertise = expertiseResult.rows[i].specialty;


      const problemResult = await client.query('SELECT id, name, type FROM problems');
      for (const problem of problemResult.rows) {
        const similarity = calculateSimilarity(problem.name, expertise);
        if (similarity > 0.2) {
          matches.problems.push({ ...problem });
        }
      }

      const disasterResult = await client.query('SELECT id, name, type FROM natural_disasters');
      for (const disaster of disasterResult.rows) {
        const similarity = calculateSimilarity(disaster.name, expertise);
        if (similarity > 0.2) {
          matches.natural_disasters.push({ ...disaster });
        }
      }

      const incidentResult = await client.query('SELECT id, name, type FROM incidents');
      for (const incident of incidentResult.rows) {
        const similarity = calculateSimilarity(incident.name, expertise);
        if (similarity > 0.2) {
          matches.incidents.push({ ...incident });
        }
      }
    }

    return matches;
  } finally {
    client.release();
  }
};