const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    contactNo : { type: String, required: true },
    fee : { type: String, required: true,default:null },
    venue: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
)

const Event = mongoose.model("Event", eventSchema)

module.exports = Event


