import { Router } from "express"

import {
  commerceSchema,
  updateCommerceSchema,
} from "../schemas/commerce.schema.js"
import { authRequired } from "../middlewares/validateToken.js"
import { validatorSchema } from "../middlewares/validator.middleware.js"
import {
  createCommerce,
  deleteCommerce,
  getAllCommerce,
  getCommerceByUserId,
  updateCommerce,
} from "../controller/commerce.controller.js"

const router = Router()

router.post(
  "/commerce",
  authRequired,
  validatorSchema(commerceSchema),
  createCommerce
)

router.patch(
  "/commerce/:id",
  authRequired,
  validatorSchema(updateCommerceSchema),
  updateCommerce
)

router.delete("/commerce/:id", authRequired, deleteCommerce)

router.get("/commerce", authRequired, getCommerceByUserId)

router.get("/commerces", authRequired, getAllCommerce)

export default router
