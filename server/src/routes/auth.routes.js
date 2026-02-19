import { Router } from 'express'

import { loginSchema, registerSchema } from '../schemas/auth.schema.js'
import { validatorSchema } from '../middlewares/validator.middleware.js'
import { login, register, profile, ping, deleteUser } from '../controller/auth.controller.js'
import { authRequired } from '../middlewares/validateToken.js'

const router = Router()

router.post("/register", validatorSchema(registerSchema), register)

router.post("/login", validatorSchema(loginSchema), login)

// router.post("/logout", logout)

router.post("/profile", authRequired, profile)

router.patch("/profile", authRequired, profile)

router.post("/ping", ping)

router.delete("/delete", authRequired, deleteUser)

export default router