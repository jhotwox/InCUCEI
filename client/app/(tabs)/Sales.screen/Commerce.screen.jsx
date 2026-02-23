import { useEffect, useRef, useState } from "react"
import { View } from "react-native"
import { Button, Text, useTheme } from "react-native-paper"
import { Background, Input, FileInput, BlurCard, AnimatedContainer } from "../../../components"
import {
  getCommerce,
  createCommerce,
  updateCommerce,
  deleteCommerce,
} from "../../../api/commerce.api"
import { useToast } from "../../../contexts/Toast.context"
import { createFileObjectFromUrl } from "../../../utils/generateFileObjectFromURL"

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
  const { showToast } = useToast()


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
            console.log("Logo File: ", logoFile)
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
          showToast("Error cargando datos del comercio", "error")
        })
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
          showToast("Comercio creado correctamente", "success")
        })
        .catch((err) => {
          console.error("Error creating commerce: ", err)
          showToast("Error creando comercio", "error")
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
          showToast("Datos actualizados correctamente", "success")
        })
        .catch((err) => {
          console.log("Error updating commerce: ", err)
          if (typeof err === "string") showToast(err, "error")
          else showToast("Error actualizando los datos", "error")
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
        showToast("Comercio eliminado correctamente", "success")
      })
      .catch((err) => {
        console.error("Error deleting commerce: ", err)
        showToast("Error eliminando el comercio", "error")
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

  // Componentes divididos para animación
  const TitleSection = (
    <Text
      variant="titleLarge"
      style={{ marginBottom: 16, textAlign: "center", fontWeight: "bold", color: theme.colors.tertiary }}
    >
      {!commerce
        ? "Crear comercio".toUpperCase()
        : "Actualizar comercio".toUpperCase()}
    </Text>
  )

  const FormSection = (
    <BlurCard styles={{ marginTop: 8, paddingVertical: 8, paddingHorizontal: 18 }}>
      <Input
        label="Nombre"
        value={name}
        onChangeText={setName}
        leftIcon="format-title"
        style={{ marginTop: 8 }}
        ref={nameRef}
        key="name"
        />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        leftIcon="view-agenda"
        multiline
        numberOfLines={3}
        ref={descriptionRef}
        key="description"
      />
    </BlurCard>
  )

  const FileInputsSection = (
    <BlurCard styles={{ paddingBottom: 20, paddingHorizontal: 18 }}>
      <FileInput
        placeholder="Selecciona logo"
        value={logoUrl}
        onFileSelect={handleLogoSelect}
        type="logo"
        ref={logoUrlRef}
        key="logo"
        />
      <FileInput
        placeholder="Selecciona banner"
        value={bannerUrl}
        onFileSelect={handleBannerSelect}
        type="banner"
        ref={bannerRef}
        key="banner"
      />
    </BlurCard>
  )

  const ButtonsSection = (
    <>
      <Button
        icon={!commerce ? "plus" : "content-save"}
        mode="contained"
        style={{ marginTop: 16 }}
        onPress={handleSave}
        buttonColor={commerce && theme.colors.secondary}
        textColor={commerce && theme.colors.onSecondary}
        key="save"
        >
        {!commerce ? "Crear" : "Actualizar"}
      </Button>
      {commerce && (
        <Button
          onPress={handleDelete}
          mode="contained"
          style={{ marginTop: 8 }}
          buttonColor={theme.colors.delete}
          textColor={theme.colors.onDelete}
          icon="delete"
          key="delete"
        >
          Eliminar
        </Button>
      )}
    </>
  )

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Background background={theme.colors.onPrimary} />
      <AnimatedContainer 
        animation="fadeInUp"
        delays={[0, 200, 400, 600]}
        // scrollProps={{ contentContainerStyle: { paddingBottom: 20 } }}
        // resetOnFocus
      >
        {[TitleSection, FormSection, FileInputsSection, ButtonsSection]}
      </AnimatedContainer>
    </View>
  )
}
