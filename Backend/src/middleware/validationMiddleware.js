const Joi = require("joi")

const validate = (schema) => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    }
    const { error, value } = schema.validate(req.body, options)
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((d) => d.message.replace(/"/g, ""))
      })
    }
    req.body = value
    next()
  }
}

const studentSignupSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s]{7,20}$/).required(),
  password: Joi.string().min(6).max(128).required(),
  collegeName: Joi.string().min(2).max(200).trim().required(),
  branch: Joi.string().min(2).max(100).trim().required(),
  year: Joi.string().valid("1st", "2nd", "3rd", "4th").required()
})

const studentLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(128).required()
})

const adminSignupSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().pattern(/^[0-9+\-\s]{7,20}$/).required(),
  
})

const adminLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(128).required()
})

const eventSchema = Joi.object({
  name: Joi.string().min(2).max(200).trim().required(),
  image: Joi.string().uri().allow("", null),
  description: Joi.string().min(10).max(2000).trim().required(),
  date: Joi.string().required(),
  time: Joi.string().required(),
  venue: Joi.string().min(2).max(200).trim().required(),
  totalSeats: Joi.number().integer().min(1).required()
})

const registrationCreateSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s]{7,20}$/).required(),
  college: Joi.string().min(2).max(200).trim().required(),
  branch: Joi.string().min(2).max(100).trim().required(),
  year: Joi.string().min(1).max(50).required(),
  teamSize: Joi.number().integer().min(1).max(20).default(1),
  paymentReference: Joi.string().max(200).allow("", null, "")
})

const registrationUpdateSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).trim(),
  email: Joi.string().email().lowercase(),
  phone: Joi.string().pattern(/^[0-9+\-\s]{7,20}$/),
  college: Joi.string().min(2).max(200).trim(),
  branch: Joi.string().min(2).max(100).trim(),
  year: Joi.string().min(1).max(50),
  teamSize: Joi.number().integer().min(1).max(20),
  paymentReference: Joi.string().max(200).allow("", null, "")
}).min(1)

module.exports = {
  validate,
  studentSignupSchema,
  studentLoginSchema,
  adminSignupSchema,
  adminLoginSchema,
  eventSchema,
  registrationCreateSchema,
  registrationUpdateSchema
}





