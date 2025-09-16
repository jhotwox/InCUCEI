import { z } from 'zod'

export const commerceSchema = z.object({
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, { message: "El nombre esta vacio" }),
  description: z
    .string({ required_error: "La descripción es requerida" })
    .min(6, { message: "La descripción debe tener mínimo 6 caracteres" }),
})

export const updateCommerceSchema = z.object({
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, { message: "El nombre esta vacio" })
    .optional(),
  description: z
    .string({ required_error: "La descripción es requerida" })
    .min(6, { message: "La descripción debe tener mínimo 6 caracteres" })
    .optional(),
})