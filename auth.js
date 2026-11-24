const jwt = require("jsonwebtoken");

const COOKIE_NAME = "northstar_session";

function createToken(user) {
  return jwt.sign(
    { sub: String(user.id), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
  });
}

function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", path: "/" });
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
}

module.exports = { createToken, setAuthCookie, requireAuth, COOKIE_NAME };
