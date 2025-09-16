import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react"
import { View, TouchableOpacity, Image, Alert } from "react-native"
import {
  Text,
  useTheme,
  IconButton,
  Surface,
  ActivityIndicator,
} from "react-native-paper"
import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import ShakeView from "./ShakeView"
import { useSnackBar } from "../../contexts/SnackBar.context"
import { uploadImage } from "../../api/commerce.api"

export default forwardRef(
  (
    {
      label = "",
      accept = "images", // "images", "documents", "all"
      multiple = false,
      value = null,
      onFileSelect,
      type,
      error = "",
      placeholder = "Ningún archivo seleccionado",
      ...props
    },
    ref
  ) => {
    const [selectedFile, setSelectedFile] = useState(value)
    const [isUploading, setIsUploading] = useState(false)
    const shakeRef = useRef(null)
    const theme = useTheme()
    const { showSnack } = useSnackBar()

    useImperativeHandle(ref, () => ({
      shake: () => shakeRef.current?.shake(),
      clear: () => {
        setSelectedFile(null)
        onFileSelect?.(null)
      },
      isEmpty: () => {
        if (error !== "" || !selectedFile) return false
        return true
      },
    }))

    useEffect(() => {
      // console.log("FileInput value changed: ", value)
      setSelectedFile(value)
    }, [value])

    const requestPermissions = async () => {
      if (accept === "images" || accept === "all") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
          showSnack("Se necesitan permisos para acceder a la galería", "error")
          // Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería')
          return false
        }
      }
      return true
    }

    const handleImageUpload = async (imageFile) => {
      if (!imageFile || accept !== "images") return imageFile

      setIsUploading(true)
      try {
        const { data } = await uploadImage(imageFile, type)
        console.log("[+]Upload data: ", data)

        if (data.status) {
          showSnack("Imagen subida correctamente", "success")

          return {
            ...imageFile,
            uploadedUrl: data?.file?.path,
            isUploaded: true,
          }
        } else {
          throw new Error(response.message || "Error al subir imagen")
        }
      } catch (err) {
        console.error("Error uploading image:", err)
        showSnack("No se pudo subir la imagen", "error")
        return imageFile
      } finally {
        setIsUploading(false)
      }
    }

    const pickImage = async () => {
      const hasPermission = await requestPermissions()
      if (!hasPermission) return

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.mediaTypes,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          allowsMultipleSelection: multiple,
        })

        if (!result.canceled) {
          const file = multiple ? result.assets : result.assets[0]

          // Upload image
          if (multiple) {
            setSelectedFile(file)
            const uploadPromises = file.map((f) => handleImageUpload(f))
            const uploadedFiles = await Promise.all(uploadPromises)
            onFileSelect?.(file)
          } else {
            const uploadFile = await handleImageUpload(file)
            setSelectedFile(uploadFile)
            onFileSelect?.(uploadFile)
          }
        }
      } catch (error) {
        console.error("Error picking image:", error)
        showSnack("No se pudo seleccionar la imagen", "error")
        // Alert.alert('Error', 'No se pudo seleccionar la imagen')
      }
    }

    const pickDocument = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          copyToCacheDirectory: true,
          multiple: multiple,
        })

        if (!result.canceled) {
          const file = multiple ? result.assets : result.assets[0]
          setSelectedFile(file)
          onFileSelect?.(file)
        }
      } catch (error) {
        console.error("Error picking document:", error)
        showSnack("No se pudo seleccionar el archivo", "error")
        // Alert.alert('Error', 'No se pudo seleccionar el archivo')
      }
    }

    const handleFileSelection = () => {
      if (accept === "images") {
        pickImage()
      } else if (accept === "documents") {
        pickDocument()
      } else {
        // Mostrar opciones
        Alert.alert("Seleccionar archivo", "Elige el tipo de archivo", [
          { text: "Imagen", onPress: pickImage },
          { text: "Documento", onPress: pickDocument },
          { text: "Cancelar", style: "cancel" },
        ])
      }
    }

    const renderPreview = () => {
      if (!selectedFile) return null

      if (Array.isArray(selectedFile)) {
        return (
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}
          >
            {selectedFile.map((file, index) => (
              <Surface key={index} style={{ margin: 4, borderRadius: 8 }}>
                {file.type?.startsWith("image/") ? (
                  <>
                    <Image
                      source={{ uri: file.uri }}
                      style={{ width: 60, height: 60, borderRadius: 8 }}
                    />
                    {file.isUploaded && (
                      <View
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          backgroundColor: theme.colors.primary,
                          borderRadius: 10,
                          width: 16,
                          height: 16,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <IconButton
                          icon="check"
                          size={8}
                          iconColor={theme.colors.onPrimary}
                        />
                      </View>
                    )}
                  </>
                ) : (
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: theme.colors.surfaceVariant,
                      borderRadius: 8,
                    }}
                  >
                    <Text variant="bodySmall">
                      {file.name?.split(".").pop()}
                    </Text>
                  </View>
                )}
              </Surface>
            ))}
          </View>
        )
      }

      return (
        <Surface style={{ marginTop: 8, padding: 8, borderRadius: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {selectedFile.type?.startsWith("image/") ||
            selectedFile.mimeType?.startsWith("image/") ? (
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: selectedFile.uri }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    marginRight: 8,
                  }}
                />
                {selectedFile.isUploaded && (
                  <View
                    style={{
                      position: "absolute",
                      top: -2,
                      right: 6,
                      backgroundColor: theme.colors.primary,
                      borderRadius: 8,
                      width: 16,
                      height: 16,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      icon="check"
                      size={8}
                      iconColor={theme.colors.onPrimary}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: 4,
                  marginRight: 8,
                }}
              >
                <Text variant="bodySmall">
                  {selectedFile.name?.split(".").pop() || "FILE"}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" numberOfLines={1}>
                {selectedFile.name || "Archivo seleccionado"}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {selectedFile.size
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : ""}
              </Text>
            </View>
          </View>
        </Surface>
      )
    }

    return (
      <ShakeView ref={shakeRef}>
        <View>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurface, marginBottom: 8 }}
          >
            {label === "" ? null : label}
          </Text>

          <TouchableOpacity
            onPress={handleFileSelection}
            disabled={isUploading}
          >
            <Surface
              style={{
                padding: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: error ? theme.colors.error : theme.colors.outline,
                borderStyle: "dashed",
                opacity: isUploading ? 0.6 : 1,
              }}
            >
              <View style={{ alignItems: "center" }}>
                {isUploading ? (
                  <ActivityIndicator
                    animating={true}
                    size="small"
                    color={theme.colors.primary}
                    style={{ marginVertical: 8 }}
                  />
                ) : (
                  <IconButton
                    icon={accept === "images" ? "image-plus" : "file-plus"}
                    size={32}
                    iconColor={theme.colors.primary}
                  />
                )}
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurface }}
                >
                  {isUploading
                    ? "Subiendo imagen..."
                    : selectedFile
                    ? "Cambiar " + type
                    : placeholder}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.outline, marginTop: 4 }}
                >
                  {isUploading ? "Espera un momento" : "Toca para seleccionar"}
                </Text>
              </View>
            </Surface>
          </TouchableOpacity>

          {renderPreview()}

          {error !== "" && (
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.error,
                backgroundColor: theme.colors.errorContainer,
                padding: 8,
                borderRadius: 4,
                marginTop: 8,
              }}
            >
              {error}
            </Text>
          )}
        </View>
      </ShakeView>
    )
  }
)
