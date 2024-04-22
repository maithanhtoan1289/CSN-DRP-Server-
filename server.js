import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import naturalDisasterRoutes from "./routes/natural-disaster.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import historyRoutes from "./routes/history.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { connectToDB } from "./config/connectToDB.js";
import { v2 as cloudinary } from "cloudinary";

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

dotenv.config();
const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.static("public"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/natural-disasters", naturalDisasterRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/histories", historyRoutes);
app.use("/api/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectToDB();
});
