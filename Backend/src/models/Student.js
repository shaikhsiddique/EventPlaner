const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    collegeName: { type: String, required: true },
    branch: { type: String, required: true },
    year: { type: String, required: true },
    paymentDetails: { type: String, default: "none" },
    role: { type: String, required: true, default: "student", enum: ["student"] }
  },
  { timestamps: true }
)

const Student = mongoose.model("Student", studentSchema)

module.exports = Student



