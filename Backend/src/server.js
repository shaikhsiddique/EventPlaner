const http = require("http")
const config = require("./config")
const connectDB = require("./config/db")
const app = require("./app")
const start = async () => {
  try {
    await connectDB()
    const server = http.createServer(app)
    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`)
    })
  } catch (error) {
    console.error("Failed to start server", error)
    process.exit(1)
  }
}

start()


