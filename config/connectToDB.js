import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const connectToDB = async () => {
  try {
    await pool.connect();
    console.log("Connected to PostgreSQL database!");
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
    throw error;
  }
};

export { pool, connectToDB };
