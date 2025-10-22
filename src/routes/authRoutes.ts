import express from "express";
const router = express.Router();

// Dummy login endpoint
router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint working!" });
});

// Dummy register endpoint
router.post("/register", (req, res) => {
  res.json({ message: "Register endpoint working!" });
});

// Dummy get profile
router.get("/me", (req, res) => {
  res.json({ message: "Profile endpoint working!" });
});

export default router;