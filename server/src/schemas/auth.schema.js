import { z } from "zod"

export const registerSchema = z.object({
  email: z
    .string({ required_error: "El correo es requerido" })
    .email({ message: "Correo inválido" })
    .refine((email) => email.endsWith("udg.mx"), {
      message: "Registrate con un correo institucional",
    }),
  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(6, { message: "La contraseña debe tener mínimo 6 caracteres" }),
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(2, { message: "El nombre debe tener mínimo 2 caracteres" }),
})

export const loginSchema = z.object({
  email: z
    .string({ required_error: "El correo es requerido" })
    .email({ message: "Correo inválido" }),
  password: z
    .string({ required_error: "La contraseña es requerida" })
    .min(6, { message: "La contraseña debe tener mínimo 6 caracteres" }),
})
