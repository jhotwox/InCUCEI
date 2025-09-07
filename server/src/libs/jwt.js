import jwt from 'jsonwebtoken'
import { TOKEN } from '../config.js'

export const createAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      TOKEN,
      {
        expiresIn: "1d"
      },
      (err, token) => {
        if (err) reject(err)
        resolve(token)
      }
    )
  )
