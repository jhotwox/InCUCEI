import z from 'zod'

const loginSchema = z.object({
  email: z.string({ error: "El correo no puede estar vacío" }).email({ error: "Correo inválido" }),
  password: z.string().min(6, { error: "La contraseña debe tener al menos 6 caracteres" })
})

const registerSchema = z.object({
  email: z.string({ error: "El correo no puede estar vacío" }).email({ error: "Correo inválido" }),
  password: z.string().min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { error: "La contraseña debe tener al menos 6 caracteres" })
}).refine((data) => data.password === data.confirmPassword, {
  error: "Las contraseñas no coinciden", path: ["confirmPassword"]
})

export const RegisterValidator = registerSchema
export const LoginValidator = loginSchema
