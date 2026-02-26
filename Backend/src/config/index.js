require("dotenv").config()

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "",
  googleAiKey: process.env.GOOGLE_AI_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "secret"
}

module.exports = config


