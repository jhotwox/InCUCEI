export const validatorSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body)
    next()
  } catch (err) {
    // console.log("[-] validator err -> ", err.issues)
    return res.status(400).json({ err: err.issues[0].message, status: false })
  }
}