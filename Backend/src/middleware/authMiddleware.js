const jwt = require("jsonwebtoken");
const config = require("../config");
const Student = require("../models/Student");
const Admin = require("../models/Admin");

const auth = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    let Model;
    if (decoded.role === "admin") {
      Model = Admin;
    } else if (decoded.role === "student") {
      Model = Student;
    } else {
      return res.status(401).json({ message: "Invalid role" });
    }

    const user = await Model.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

module.exports = { auth, requireRole };