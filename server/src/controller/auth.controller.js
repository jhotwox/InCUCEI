import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { createAccessToken } from '../libs/jwt.js'

export const register = async (req, res) => {
  const { username, email, password } = req.body
  console.log(username, email, password)

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = new User({
      username,
      email,
      passwordHash
    })
    const user = await newUser.save()
    const token = await createAccessToken({ id: user._id })
    res.cookie("token", token)
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  console.log(email, password)

  try {
    const userFound = await User.findOne({ email })
    if (!userFound) return res.status(400).json({ message: "No se encontro el usuario" })
    
    const isMatch = await bcrypt.compare(password, userFound.passwordHash)
    if (!isMatch) return res.status(400).json({ message: "Correo o contraseña incorrecta" })
    
    const token = await createAccessToken({ id: userFound._id })
    res.cookie("token", token)
    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
}

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  })
  return res.sendStatus(200)
}

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id)
  if (!userFound) return res.status(400).json({ message: "Usuario no encontrado" })
    
    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
  })
}

export const ping = async (req, res) => {
  return await res.status(200).json({ message: "Servidor vivo!" })
}