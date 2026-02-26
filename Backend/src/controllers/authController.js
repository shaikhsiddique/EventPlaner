const { createUser, createAdmin, authenticateUser } = require("../services/authService")
const generateToken = require("../utils/generateToken")

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

const studentSignup = async (req, res, next) => {
  try {
    console.log(req.body)
    const user = await createUser(req.body, "student")
    const token = generateToken({ id: user._id, role: user.role })
    setTokenCookie(res, token)
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const studentLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await authenticateUser(email, password, "student")
    const token = generateToken({ id: user._id, role: user.role })
    setTokenCookie(res, token)
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    next(error)
  }
}

const adminSignup = async (req, res, next) => {
  try {
    const {  ...adminData } = req.body
   
    const admin = await createAdmin(adminData)
    const token = generateToken({ id: admin._id, role: admin.role })
    setTokenCookie(res, token)
    res.status(201).json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const admin = await authenticateUser(email, password, "admin")
    const token = generateToken({ id: admin._id, role: admin.role })
    setTokenCookie(res, token)
    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const logout = (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logged out" })
}

module.exports = { studentSignup, studentLogin, adminSignup, adminLogin, logout }


