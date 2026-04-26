import { Router } from "express"
import multer from "multer"
import "../config.js"

import {
  getPlan,
  getSubjects,
  uploadFile,
  ping,
  getCurriculum,
} from "../controller/file.controller.js"
import { authRequired } from "../middlewares/validateToken.js"

const router = Router()

// Cloudinary-only: keep uploads in memory and send to Cloudinary in the controller.
const upload = multer({ storage: multer.memoryStorage() })
// const limits = { fileSize: 10 * 1024 * 1024 } // 10MB
// const upload = multer({ storage, limits })

router.get("/find/:subject", authRequired, getPlan)

router.get("/find/curriculum/:career", authRequired, getCurriculum)

router.get("/subjects", authRequired, getSubjects)

// router.get("/exist/:subject", authRequired, subjectExist)

router.post("/upload", authRequired, upload.single("file"), uploadFile)

router.post("/ping", ping)

export default router
