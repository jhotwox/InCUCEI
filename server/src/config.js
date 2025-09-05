import { config } from 'dotenv'
config()

export const PORT = process.env.PORT
export const MONGOURI = process.env.MONGOURI 
export const TOKEN = process.env.TOKEN