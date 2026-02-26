const express = require("express")
const {
  registerStudentHandler,
  getRegisteredStudentsHandler,
  updateRegisteredStudentHandler,
  deleteRegisteredStudentHandler
} = require("../controllers/registrationController")
const { auth, requireRole } = require("../middleware/authMiddleware")
const {
  validate,
  registrationCreateSchema,
  registrationUpdateSchema
} = require("../middleware/validationMiddleware")

const router = express.Router()

router.post(
  "/:eventId/register",
  auth,
  requireRole(["student"]),
  validate(registrationCreateSchema),
  registerStudentHandler
)
router.get("/:eventId/students", getRegisteredStudentsHandler)
router.put(
  "/:eventId/students/:studentId",
  auth,
  requireRole(["admin"]),
  validate(registrationUpdateSchema),
  updateRegisteredStudentHandler
)
router.delete(
  "/:eventId/students/:studentId",
  auth,
  requireRole(["admin"]),
  deleteRegisteredStudentHandler
)

module.exports = router


