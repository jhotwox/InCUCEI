import jwt from 'jsonwebtoken'
import { TOKEN } from '../config.js'

export const authRequired = (req, res, next) => {
  console.log("[+] Validating token...")
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null
    
  // console.log("Token: ", token)
  if (!token) return res.status(401).json({ message: "Sin token" })

  jwt.verify(token, TOKEN, (err, user) => {
    if (err) {
      console.log("[-] Err: ", err)
      console.log(err.name)
      return res.status(403).json({ message: "Token invalido" })
    }

    req.user = user
    next()
  })
}