const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const config = require("./config")
const authRoutes = require("./routes/authRoutes")
const eventRoutes = require("./routes/eventRoutes")
const registrationRoutes = require("./routes/registrationRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")

const app = express()

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan("dev"))

app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/registrations", registrationRoutes)

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.use(notFound)
app.use(errorHandler)

module.exports = app



