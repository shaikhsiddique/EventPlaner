const jwt = require("jsonwebtoken")
const config = require("../config")

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" })
}

module.exports = generateToken


