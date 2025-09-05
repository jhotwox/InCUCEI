export const validatorSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body)
    next()
  } catch (err) {
    return res.status(200).json({ err: err.errors.map(i => i.message) })
  }
}