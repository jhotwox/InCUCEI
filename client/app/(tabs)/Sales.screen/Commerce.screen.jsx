import { useEffect, useRef, useState } from "react"
import { View } from "react-native"
import { Button, Text, useTheme } from "react-native-paper"
import { Background, Input, FileInput } from "../../../components"
import {
  getCommerce,
  createCommerce,
  updateCommerce,
  deleteCommerce,
} from "../../../api/commerce.api"
import { useSnackBar } from "../../../contexts/SnackBar.context"
import { string } from "zod"

const createFileObjectFromUrl = (url, type) => {
  if (!url) return null

  return {
    uri: url.startsWith("http")
      ? url
      : `${process.env.EXPO_PUBLIC_API_URL}${url}`,
    name: `${type}_image.jpg`,
    type: "image/jpeg",
    isUploaded: true,
    uploadedUrl: url,
  }
}

export default () => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [logoUrl, setLogoUrl] = useState(null)
  const [bannerUrl, setBannerUrl] = useState(null)
  const [commerce, setCommerce] = useState(null)

  const nameRef = useRef(null)
  const descriptionRef = useRef(null)
  const logoUrlRef = useRef(null)
  const bannerRef = useRef(null)

  const inputs = [nameRef, descriptionRef]

  const theme = useTheme()
  const { showSnack } = useSnackBar()

  // useEffect(() => {
  //   console.log("Logo URL changed: ", logoUrl)
  //   console.log("Banner URL changed: ", bannerUrl)
  // }, [logoUrl, bannerUrl])

  useEffect(() => {
    const fetchCommerce = async () => {
      getCommerce()
        .then(({ data }) => {
          setCommerce(data.commerce)
          setName(data.commerce.name)
          setDescription(data.commerce.description)

          // console.log("Commerce data: ", data.commerce)

          if (data.commerce.logoUrl) {
            const logoFile = createFileObjectFromUrl(
              data.commerce.logoUrl,
              "logo"
            )
            setLogoUrl(logoFile)
          }

          if (data.commerce.bannerUrl) {
            const bannerFile = createFileObjectFromUrl(
              data.commerce.bannerUrl,
              "banner"
            )
            setBannerUrl(bannerFile)
          }
        })
        .catch((err) => {
          if (err?.message === "Comercio no encontrado") {
            setCommerce(null)
            return
          }
          console.error("Error fetching commerce data: ", err)
          showSnack("Error cargando datos del comercio", "error")
        })
      // Replace this with actual data fetching logic
    }

    fetchCommerce()
  }, [])

  const handleSave = async () => {
    for (let input of inputs) {
      if (!input.current?.isEmpty()) {
        input.current?.shake()
        return
      }
    }

    // Doesn't exist
    if (!commerce) {
      if (!logoUrlRef.current?.isEmpty()) {
        logoUrlRef.current?.shake()
        return
      }

      if (!bannerRef.current?.isEmpty()) {
        bannerRef.current?.shake()
        return
      }

      await createCommerce({
        name,
        description,
      })
        .then(({ data }) => {
          console.log("Create commerce data: ", data)
          setCommerce(data.commerce)
          showSnack("Comercio creado correctamente", "success")
        })
        .catch((err) => {
          console.error("Error creating commerce: ", err)
          showSnack("Error creando comercio", "error")
        })
    } else {
      await updateCommerce(
        {
          name,
          description,
        },
        commerce.id
      )
        .then(({ data }) => {
          console.log("Update commerce data: ", data)
          setCommerce(data.commerce)
          showSnack("Datos actualizados correctamente", "success")
        })
        .catch((err) => {
          console.log("Error updating commerce: ", err)
          if (typeof err === "string") showSnack(err, "error")
          else showSnack("Error actualizando los datos", "error")
        })
    }
  }

  const handleDelete = async () => {
    await deleteCommerce(commerce.id)
      .then(({ data }) => {
        console.log("Delete commerce data: ", data)
        setCommerce(null)
        setName("")
        setDescription("")
        setLogoUrl(null)
        setBannerUrl(null)
        showSnack("Comercio eliminado correctamente", "success")
      })
      .catch((err) => {
        console.error("Error deleting commerce: ", err)
        showSnack("Error eliminando el comercio", "error")
      })
  }

  const handleLogoSelect = (file) => {
    setLogoUrl(file)
    console.log("Logo seleccionado:", file)
  }

  const handleBannerSelect = (file) => {
    setBannerUrl(file)
    console.log("Banner seleccionado:", file)
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Background background={theme.colors.onPrimary} />
      <Text
        variant="titleLarge"
        style={{ marginBottom: 16, textAlign: "center", fontWeight: "bold" }}
      >
        {!commerce
          ? "Crear comercio".toUpperCase()
          : "Actualizar comercio".toUpperCase()}
      </Text>
      <Input label="Nombre" value={name} onChangeText={setName} ref={nameRef} />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        ref={descriptionRef}
      />
      <FileInput
        placeholder="Selecciona logo"
        value={logoUrl}
        // selectedFile={logoUrl}
        onFileSelect={handleLogoSelect}
        type="logo"
        ref={logoUrlRef}
      />
      <FileInput
        // label="Imagen de productos"
        placeholder="Selecciona banner"
        value={bannerUrl}
        onFileSelect={handleBannerSelect}
        type="banner"
        ref={bannerRef}
      />
      <Button
        icon={!commerce ? "plus" : "content-save"}
        mode="contained"
        style={{ marginTop: 16 }}
        onPress={handleSave}
      >
        {!commerce ? "Crear" : "Actualizar"}
      </Button>
      {commerce && (
        <Button
          onPress={handleDelete}
          mode="contained"
          style={{ marginTop: 8 }}
          buttonColor={theme.colors.error}
          icon="delete"
        >
          Eliminar
        </Button>
      )}
    </View>
  )
}
