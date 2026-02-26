const express = require("express")
const {
  studentSignup,
  studentLogin,
  adminSignup,
  adminLogin,
  logout
} = require("../controllers/authController")
const { auth } = require("../middleware/authMiddleware")
const {
  validate,
  studentSignupSchema,
  studentLoginSchema,
  adminSignupSchema,
  adminLoginSchema
} = require("../middleware/validationMiddleware")

const router = express.Router()

router.post("/student/signup", validate(studentSignupSchema), studentSignup)
router.post("/student/login", validate(studentLoginSchema), studentLogin)
router.post("/admin/signup", validate(adminSignupSchema), adminSignup)
router.post("/admin/login", validate(adminLoginSchema), adminLogin)
router.post("/logout", auth, logout)

module.exports = router



