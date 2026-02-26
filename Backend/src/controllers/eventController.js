const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventById
} = require("../services/eventService")

const createEventHandler = async (req, res, next) => {
  try {
    

    // get image url from middleware
    if (req.optimizedImages && req.optimizedImages.length > 0) {
      req.body.image = req.optimizedImages[0].url
    }
    

    const event = await createEvent(req.body, req.user._id)

    res.status(201).json(event)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const updateEventHandler = async (req, res, next) => {
  try {
    const event = await updateEvent(req.params.id, req.body, req.user._id)
    res.json(event)
  } catch (error) {
    next(error)
  }
}

const deleteEventHandler = async (req, res, next) => {
  try {
    await deleteEvent(req.params.id, req.user._id)
    res.json({ message: "Event deleted" })
  } catch (error) {
    next(error)
  }
}

const getEventsHandler = async (req, res, next) => {
  try {
    const events = await getEvents()
    res.json(events)
  } catch (error) {
    next(error)
  }
}

const getEventByIdHandler = async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id)
    res.json(event)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createEventHandler,
  updateEventHandler,
  deleteEventHandler,
  getEventsHandler,
  getEventByIdHandler
}






