import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/conn.js";
import router from "./routes/router.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.use("/uploads", express.static("./uploads"));
app.use("/files", express.static("./public/files"));

const port = process.env.POST || 3050;
app.listen(port, () => {
  console.log(`Server running http://localhost:${port}`);
});
