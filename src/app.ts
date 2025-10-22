import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
// import bookRoutes, genreRoutes, transactionRoutes (tambahkan nanti)

dotenv.config();

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
// app.use("/books", bookRoutes);
// app.use("/genre", genreRoutes);
// app.use("/transactions", transactionRoutes);

app.get("/", (_, res) => res.send("IT Literature Shop API"));

export default app;