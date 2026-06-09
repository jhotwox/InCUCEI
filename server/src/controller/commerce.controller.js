import Commerce from "../models/commerce.model.js"
import User from "../models/user.model.js"

const toCommerceResponse = (commerce, req, { logoUrlFallback, bannerUrlFallback } = {}) => {
  return {
    id: commerce._id,
    name: commerce.name,
    description: commerce.description,
    userId: commerce.userId,
    logoUrl: commerce.logoUrl ?? logoUrlFallback ?? null,
    bannerUrl: commerce.bannerUrl ?? bannerUrlFallback ?? null,
    createdAt: commerce.createdAt,
    updatedAt: commerce.updatedAt,
  }
}

export const createCommerce = async (req, res) => {
  const { name, description } = req.body
  const userId = req.user.id
  console.log(name, description, userId)

  try {
    const newCommerce = new Commerce({
      name,
      description,
      userId,
    })
    const commerce = await newCommerce.save()

    // If the user uploaded logo/banner before creating the commerce, attach them now.
    const user = await User.findById(userId)
      .select("pendingLogoUrl pendingLogoPublicId pendingBannerUrl pendingBannerPublicId")
      .lean(false)

    if (user?.pendingLogoUrl || user?.pendingBannerUrl) {
      commerce.logoUrl = user.pendingLogoUrl ?? commerce.logoUrl
      commerce.logoPublicId = user.pendingLogoPublicId ?? commerce.logoPublicId
      commerce.bannerUrl = user.pendingBannerUrl ?? commerce.bannerUrl
      commerce.bannerPublicId = user.pendingBannerPublicId ?? commerce.bannerPublicId
      await commerce.save()

      user.pendingLogoUrl = null
      user.pendingLogoPublicId = null
      user.pendingBannerUrl = null
      user.pendingBannerPublicId = null
      await user.save()
    }

    return res.json({
      commerce: toCommerceResponse(commerce, req),
      status: true,
    })
  } catch (err) {
    if (err?.code === 11000)
      return res.status(409).json({
        message: "Este usuario ya registro un comercio",
        status: false,
      })

    if (err.name === "ValidationError")
      return res.status(400).json({ message: err.message, status: false })

    return res
      .status(500)
      .json({ message: "Error en el servidor", status: false })
  }
}

export const updateCommerce = async (req, res) => {
  const commerce = req.body
  console.log(commerce.name, commerce.description)

  try {
    const commerceUpdated = await Commerce.findByIdAndUpdate(
      req.params.id,
      {
        $set: commerce,
      },
      { new: true, runValidators: true }
    )
    if (!commerceUpdated)
      return res
        .status(400)
        .json({ message: "Comercio no encontrado", status: false })

    return res.json({
      message: "Comercio actualizado",
      commerce: {
        id: commerceUpdated._id,
        name: commerceUpdated.name,
        description: commerceUpdated.description,
        userId: commerceUpdated.userId,
        logoUrl: commerceUpdated.logoUrl ?? null,
        bannerUrl: commerceUpdated.bannerUrl ?? null,
        createdAt: commerceUpdated.createdAt,
        updatedAt: commerceUpdated.updatedAt,
      },
      status: true,
    })
  } catch (err) {
    if (err.name === "ValidationError")
      return res.status(400).json({ message: err.message, status: false })

    return res
      .status(500)
      .json({ message: "Error en el servidor", status: false })
  }
}

export const deleteCommerce = async (req, res) => {
  try {
    const commerceDeleted = await Commerce.findByIdAndDelete(req.params.id)
    if (!commerceDeleted)
      return res
        .status(400)
        .json({ message: "Comercio no encontrado", status: false })

    return res.json({
      message: "Comercio eliminado",
      status: true,
    })
  } catch (err) {
    return res.status(500).json({ message: err.message, status: false })
  }
}

export const getCommerceByUserId = async (req, res) => {
  try {
    const commerceFound = await Commerce.findOne({ userId: req.user.id })
    if (!commerceFound)
      return res
        .status(400)
        .json({ message: "Comercio no encontrado", status: false })

    // Fallback: if the user uploaded images but the commerce hasn't been updated yet.
    const user = await User.findById(req.user.id)
      .select("pendingLogoUrl pendingBannerUrl")
      .lean()

    return res.json({
      commerce: toCommerceResponse(commerceFound, req, {
        logoUrlFallback: user?.pendingLogoUrl,
        bannerUrlFallback: user?.pendingBannerUrl,
      }),
      status: true,
    })
  } catch (err) {
    return res.status(500).json({ message: err.message, status: false })
  }
}

export const getAllCommerce = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Exclude commerces from the current user
    const commerces = await Commerce.find({ userId: { $ne: userId } })
    if (!commerces)
      return res
        .status(400)
        .json({ message: "Comercios no encontrados", status: false })

    const commercesWithImages = commerces.map((commerce) => toCommerceResponse(commerce, req))

    return res.json({
      commerces: commercesWithImages,
      status: true,
    })
  } catch (err) {
    return res.status(500).json({ message: err.message, status: false })
  }
}
