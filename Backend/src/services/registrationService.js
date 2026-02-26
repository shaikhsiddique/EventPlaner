const Registration = require("../models/Registration")

const registerStudentForEvent = async (eventId, studentData) => {
  let registration = await Registration.findOne({ event: eventId })
  if (!registration) {
    registration = await Registration.create({
      event: eventId,
      students: [studentData]
    })
  } else {
    const already = registration.students.find(
      (s) => s.user && s.user.toString() === studentData.user.toString()
    )
    if (already) {
      const error = new Error("Student already registered for this event")
      error.statusCode = 400
      throw error
    }
    registration.students.push(studentData)
    await registration.save()
  }
  return registration
}

const getRegisteredStudentsForEvent = async (eventId) => {
  const registration = await Registration.findOne({ event: eventId }).populate("students.user")
  if (!registration) {
    return []
  }
  return registration.students
}

const updateRegisteredStudent = async (eventId, studentId, data) => {
  const registration = await Registration.findOne({ event: eventId })
  if (!registration) {
    const error = new Error("Registration not found")
    error.statusCode = 404
    throw error
  }
  const student = registration.students.id(studentId)
  if (!student) {
    const error = new Error("Student registration not found")
    error.statusCode = 404
    throw error
  }
  Object.assign(student, data)
  await registration.save()
  return student
}

const deleteRegisteredStudent = async (eventId, studentId) => {
  const registration = await Registration.findOne({ event: eventId })
  if (!registration) {
    const error = new Error("Registration not found")
    error.statusCode = 404
    throw error
  }
  const student = registration.students.id(studentId)
  if (!student) {
    const error = new Error("Student registration not found")
    error.statusCode = 404
    throw error
  }
  student.deleteOne()
  await registration.save()
}

module.exports = {
  registerStudentForEvent,
  getRegisteredStudentsForEvent,
  updateRegisteredStudent,
  deleteRegisteredStudent
}



