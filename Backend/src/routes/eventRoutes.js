const express = require("express")
const {
  createEventHandler,
  updateEventHandler,
  deleteEventHandler,
  getEventsHandler,
  getEventByIdHandler
} = require("../controllers/eventController")
const { auth, requireRole } = require("../middleware/authMiddleware")
const { validate, eventSchema } = require("../middleware/validationMiddleware")
const { upload, optimizeAndUpload } = require("../config/upload");

const router = express.Router()

router.get("/", auth, getEventsHandler)
router.get("/:id", auth, getEventByIdHandler)


router.post(
  "/",
  auth,
  requireRole(["admin"]),
  upload.single("image"),
  optimizeAndUpload, // ✅ this is missing
  createEventHandler
);
router.put("/:id", auth, requireRole(["admin"]), upload.single("image"),
optimizeAndUpload, updateEventHandler);
router.delete("/:id", auth, requireRole(["admin"]), deleteEventHandler)

module.exports = router



