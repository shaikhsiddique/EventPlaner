const mongoose = require("mongoose")

const registeredStudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    paymentDetails: { type: String, required: true },
    contact: { type: String, required: true },
    collegeName: { type: String, required: true },
    branch: { type: String, required: true },
    year: { type: String, required: true }
  },
  { _id: true, timestamps: true }
)

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
    students: [registeredStudentSchema]
  },
  { timestamps: true }
)

const Registration = mongoose.model("Registration", registrationSchema)

module.exports = Registration


