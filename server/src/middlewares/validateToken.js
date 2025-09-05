import jwt from 'jsonwebtoken'
import { TOKEN } from '../config.js'

export const authRequired = (req, res, next) => {
  const { token } = req.cookies
  if (!token) return res.status(401).json({ message: "Sin token" })

  jwt.verify(token, TOKEN, (err, user) => {
    if (err) {
      console.log(err.name)
      return res.status(403).json({ message: "Token invalido" })
    }

    req.user = user
    next()
  })
}