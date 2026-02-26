const Event = require("../models/Event")
const Admin = require("../models/Admin")

const createEvent = async (data, creatorId) => {
  const event = await Event.create({
    name: data.name,
    image: data.image || "",
    description: data.description,
    date: data.date,
    time: data.time,
    contactNo : data.contactNo,
    venue: data.venue,
    fee : data.fee || null,
    totalSeats: data.totalSeats,
    createdBy: creatorId
  })
  await Admin.findByIdAndUpdate(creatorId, { $addToSet: { createdEvents: event._id } })
  return event
}

const updateEvent = async (eventId, data, userId) => {
  const event = await Event.findById(eventId)
  if (!event) {
    const error = new Error("Event not found")
    error.statusCode = 404
    throw error
  }
  if (event.createdBy.toString() !== userId.toString()) {
    const error = new Error("Not allowed to edit this event")
    error.statusCode = 403
    throw error
  }
  Object.assign(event, data)
  await event.save()
  return event
}

const deleteEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId)
  if (!event) {
    const error = new Error("Event not found")
    error.statusCode = 404
    throw error
  }
  if (event.createdBy.toString() !== userId.toString()) {
    const error = new Error("Not allowed to delete this event")
    error.statusCode = 403
    throw error
  }
  await event.deleteOne()
  await Admin.findByIdAndUpdate(userId, { $pull: { createdEvents: eventId } })
}

const getEvents = async () => {
  const events = await Event.find().sort({ createdAt: -1 })
  return events
}

const getEventById = async (id) => {
  const event = await Event.findById(id)
  if (!event) {
    const error = new Error("Event not found")
    error.statusCode = 404
    throw error
  }
  return event
}

module.exports = { createEvent, updateEvent, deleteEvent, getEvents, getEventById }



