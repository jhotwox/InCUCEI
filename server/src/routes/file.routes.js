import { Router } from "express"
import multer from "multer"
import path from "path"
import { cleanExistingFiles } from "../middlewares/cleanFiles.middleware.js"

import {
  getPlan,
  getSubjects,
  uploadFile,
  ping,
} from "../controller/file.controller.js"
import { authRequired } from "../middlewares/validateToken.js"

const router = Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/")
  },
  filename: function (req, file, cb) {
    const { imageType } = req.query
    const userId = req.user.id
    const extension = path.extname(file.originalname)
    
    cb(null, `${imageType}_${userId}${extension}`)
  },
})
const upload = multer({ storage })
// const limits = { fileSize: 10 * 1024 * 1024 } // 10MB
// const upload = multer({ storage, limits })

router.get("/find/:subject", authRequired, getPlan)

router.get("/subjects", authRequired, getSubjects)

// router.get("/exist/:subject", authRequired, subjectExist)

// router.post("/login", validatorSchema(loginSchema), login)

router.post("/upload", authRequired, cleanExistingFiles, upload.single("file"), uploadFile)

router.post("/ping", ping)

export default router
