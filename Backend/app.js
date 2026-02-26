const http = require("http")
const config = require("./src/config")
const connectDB = require("./src/config/db")
const app = require("./src/app")

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

