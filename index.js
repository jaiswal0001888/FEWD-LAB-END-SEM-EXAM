require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const db = require("./db");
const { createToken, setAuthCookie, requireAuth, COOKIE_NAME } = require("./auth");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("Set JWT_SECRET in .env to a random value of at least 32 characters.");
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

const findUserByEmail = db.prepare("SELECT * FROM users WHERE email = ?");
const findPublicUserById = db.prepare(
  "SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?"
);
const insertUser = db.prepare(
  "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: "Name must be between 2 and 60 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Password must be between 8 and 72 characters." });
    }
    if (findUserByEmail.get(email)) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = insertUser.run(name, email, passwordHash);
    const user = findPublicUserById.get(result.lastInsertRowid);
    setAuthCookie(res, createToken(user));
    return res.status(201).json({ user });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Unable to create your account right now." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    const userRecord = findUserByEmail.get(email);
    const passwordMatches = userRecord
      ? await bcrypt.compare(password, userRecord.password_hash)
      : false;

    if (!userRecord || !passwordMatches) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    const user = findPublicUserById.get(userRecord.id);
    setAuthCookie(res, createToken(user));
    return res.json({ user });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Unable to sign in right now." });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  res.json({ message: "Signed out successfully." });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = findPublicUserById.get(Number(req.auth.sub));
  if (!user) return res.status(401).json({ message: "Account not found." });
  res.json({ user });
});

app.get("/api/private/overview", requireAuth, (req, res) => {
  const user = findPublicUserById.get(Number(req.auth.sub));
  res.json({
    message: "This information is available only to authenticated users.",
    user,
    stats: [
      { label: "Account status", value: "Active" },
      { label: "Authentication", value: "Protected" },
      { label: "Session", value: "Valid" }
    ]
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
