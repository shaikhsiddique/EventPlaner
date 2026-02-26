const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true, default: "admin", enum: ["admin"] },
    createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]
  },
  { timestamps: true }
)

const Admin = mongoose.model("Admin", adminSchema)

module.exports = Admin



