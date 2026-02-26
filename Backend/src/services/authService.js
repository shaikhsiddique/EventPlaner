const bcrypt = require("bcryptjs")
const Student = require("../models/Student")
const Admin = require("../models/Admin")

const createUser = async (data, role) => {
  const existing = await Student.findOne({ email: data.email.toLowerCase() })
  if (existing) {
    const error = new Error("Email already in use")
    error.statusCode = 400
    throw error
  }
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const user = await Student.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    phone: data.phone,
    collegeName: data.collegeName,
    branch: data.branch,
    year: data.year,
    paymentDetails: data.paymentDetails || "none",
    role
  })
  return user
}

const createAdmin = async (data) => {
  const existing = await Admin.findOne({ email: data.email.toLowerCase() })
  if (existing) {
    const error = new Error("Admin already exists with this email")
    error.statusCode = 400
    throw error
  }
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const admin = await Admin.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    phone: data.phone,
    role: "admin"
  })
  return admin
}

const authenticateUser = async (email, password, role) => {
  if (!email || !password || !role) {
    const error = new Error("Email, password and role are required");
    error.statusCode = 400;
    throw error;
  }

  let Model;

  if (role === "admin") {
    Model = Admin;
  } else if (role === "student") {
    Model = Student;
  } else {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  const user = await Model.findOne({ email: email.toLowerCase() });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  return user;
};

module.exports = { createUser, createAdmin, authenticateUser }



