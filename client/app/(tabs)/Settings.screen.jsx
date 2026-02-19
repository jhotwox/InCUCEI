import { useState, useRef, useEffect } from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { Button, Text, useTheme, Switch, List } from "react-native-paper"
import { Background, BlurCard, FileInput } from "../../components"
import { useAuth } from "../../contexts/Auth.context"
import { useBackgroundAnimation } from "../../contexts/BackgroundAnimation.context"
import WaveHand from "../../components/WaveHand"
import { createFileObjectFromUrl } from "../../utils/generateFileObjectFromURL"

export default () => {
  const [profileUrl, setProfileUrl] = useState(null)
  const profileUrlRef = useRef(null)
  
  const theme = useTheme()
  const { loading, error, logout, user, updateUser } = useAuth()
  const { isAnimationEnabled, setIsAnimationEnabled } = useBackgroundAnimation()
  

  useEffect(() => {
    // console.log("url: ", user?.profileUrl)
    
    if (user?.profileUrl) {
      const url = createFileObjectFromUrl(user.profileUrl, "profile")
      url.uri = `${url.uri}?t=${Date.now()}`
      setProfileUrl(url)
      // console.log("new profileUrl: ", url)
    }
  }, [user?.profileUrl])


  const handlePress = () => {
    logout()
  }

  const handleUploadSuccess = async (uploadedPath) => {
    try {
      // Actualizar el perfil del usuario con la nueva URL
      await updateUser({ profileUrl: uploadedPath })
      console.log("[+] Foto de perfil actualizada correctamente")
    } catch (err) {
      console.error("[-] Error al actualizar foto de perfil:", err)
    }
  }

  return (
    <View style={styles.container}>
      <Background />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.header, { borderColor: theme.colors.onSurface + "22", backgroundColor: theme.colors.errorContainer + "22" }]}>
          <View>
            <Text variant="headlineMedium" style={[styles.greeting, { color: theme.colors.title }]}>Hola {user?.name}</Text>
            <Text variant="bodyMedium" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>¡Bienvenido a la configuración de tu cuenta!</Text>
          </View>
          {/* Hi animation */}
          <View>
            <WaveHand emojiStyle={{ fontSize: 48, color: theme.colors.primary }} />
          </View>
        </View>
        
        <BlurCard styles={{ margin: 16, padding: 0 }}>
        <List.Section>
          <List.Subheader style={{ color: theme.colors.secondary }}>Preferencias</List.Subheader>
          <List.Item
            title="Animación de fondo"
            description="Activar/desactivar animación del background"
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            left={props => <List.Icon {...props} icon="animation" />}
            right={() => (
              <Switch
                value={isAnimationEnabled}
                onValueChange={setIsAnimationEnabled}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>
        </BlurCard>

        {/* TODO: A veces no se sube la imagen al server sin dar error de server.
        Lo mas probable es que sea porque se desconecta y conecta Socket.io, se debe de crear una conexion global para eso y manejar las desconexiones manualmente en lugar de hacerlo de la siguiente forma:
          useEffect(() => {
            return () => socket.disconnect()
          }, [])
        */}
        <BlurCard styles={{ paddingBottom: 20, paddingHorizontal: 18, marginHorizontal: 16 }}>
          <FileInput
            placeholder="Selecciona foto de perfil"
            value={profileUrl}
            onFileSelect={setProfileUrl}
            type="profile"
            ref={profileUrlRef}
            onUploadSuccess={handleUploadSuccess}
          />
        </BlurCard>
        
        <View style={styles.logoutContainer}>
          <Button 
            onPress={handlePress} 
            icon="logout" 
            mode="contained-tonal"
            style={styles.logoutButton}
          >
            Cerrar sesión
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    borderWidth: 1,
    borderTopWidth: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32
  },
  greeting: {
    fontWeight: 'bold',
  },
  logoutContainer: {
    padding: 24,
    marginTop: 24,
  },
  logoutButton: {
    marginTop: 8,
  },
})
