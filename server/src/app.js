import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import userRoutes from './routes/auth.routes.js'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())

app.use("/api", userRoutes)

export default app