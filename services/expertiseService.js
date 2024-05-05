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
