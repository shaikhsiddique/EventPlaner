const {
  registerStudentForEvent,
  getRegisteredStudentsForEvent,
  updateRegisteredStudent,
  deleteRegisteredStudent
} = require("../services/registrationService")

const registerStudentHandler = async (req, res, next) => {
  try {
    const eventId = req.params.eventId
    const {
      fullName,
      email,
      phone,
      college,
      branch,
      year,
      paymentReference
    } = req.body

    const studentData = {
      user: req.user._id,
      name: fullName,
      email,
      paymentDetails: paymentReference || "",
      contact: phone,
      collegeName: college,
      branch,
      year
    }
    const registration = await registerStudentForEvent(eventId, studentData)
    res.status(201).json(registration)
  } catch (error) {
    next(error)
  }
}

const getRegisteredStudentsHandler = async (req, res, next) => {
  try {
    const students = await getRegisteredStudentsForEvent(req.params.eventId)
    res.json(students)
  } catch (error) {
    next(error)
  }
}

const updateRegisteredStudentHandler = async (req, res, next) => {
  try {
    const updated = await updateRegisteredStudent(req.params.eventId, req.params.studentId, req.body)
    res.json(updated)
  } catch (error) {
    next(error)
  }
}

const deleteRegisteredStudentHandler = async (req, res, next) => {
  try {
    await deleteRegisteredStudent(req.params.eventId, req.params.studentId)
    res.json({ message: "Registration deleted" })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  registerStudentHandler,
  getRegisteredStudentsHandler,
  updateRegisteredStudentHandler,
  deleteRegisteredStudentHandler
}





