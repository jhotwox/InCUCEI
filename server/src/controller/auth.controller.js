import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import { createAccessToken } from "../libs/jwt.js"

export const register = async (req, res) => {
  const { name, email, password } = req.body
  // console.log( email, password)

  try {
    // The name is the part before the . and the lastname is the part after the . and before a number
    // const name = email.split("@")[0].split(".")[0]
    // const lastname = email.split("@")[0].split(".")[1] || ""
    // // console.log("Name ", `${name} ${lastname}`)

    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      email,
      passwordHash,
    })
    const user = await newUser.save()
    const token = await createAccessToken({ id: user._id })

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      status: true,
    })
  } catch (err) {
    console.log("[-] Register err: ", err)
    if (err?.code === 11000)
      return res
        .status(409)
        .json({ message: "Correo ya registrado", status: false })

    if (err.name === "ValidationError")
      return res.status(400).json({ message: err.message, status: false })

    return res
      .status(500)
      .json({ message: "Error en el servidor", status: false })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  console.log(email, password)

  try {
    const userFound = await User.findOne({ email })
    if (!userFound)
      return res
        .status(400)
        .json({ message: "No se encontro el usuario", status: false })

    const isMatch = await bcrypt.compare(password, userFound.passwordHash)
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Correo o contraseña incorrecta", status: false })

    const token = await createAccessToken({ id: userFound._id })
    // res.cookie("token", token)
    return res.json({
      user: {
        id: userFound._id,
        email: userFound.email,
        name: userFound.name,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
      },
      token,
      status: true,
    })
  } catch (err) {
    return res.status(500).json({ message: err.message, status: false })
  }
}

export const profile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id)
    if (!userFound)
      return res
        .status(400)
        .json({ message: "Usuario no encontrado", status: false })
    
    return res.json({
      id: userFound._id,
      email: userFound.email,
      name: userFound.name,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
      status: true,
    })
  } catch (err) {
    return res.status(500).json({ message: err.message, status: false })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const userDeleted = await User.findByIdAndDelete(req.user.id)
    if (!userDeleted)
      return res
        .status(400)
        .json({ message: "Usuario no encontrado", status: false })

    return res.json({
      id: userDeleted._id,
      email: userDeleted.email,
      name: userDeleted.name,
      createdAt: userDeleted.createdAt,
      updatedAt: userDeleted.updatedAt,
      status: true,
    })
  } catch (err) {
    return res.status(500).json({ message: err.message, status: false })
  }
}

export const ping = async (req, res) => {
  return await res.status(200).json({ message: "Servidor vivo!", status: true })
}
