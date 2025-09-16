import { useEffect, useRef, useState } from "react"
import { Text, View, TouchableOpacity, Dimensions } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { loginStyles } from "../../styles/common.style"
// Redux
// import { setUser } from "../slices/home.slice"
import { Button, useTheme } from "react-native-paper"
import { router } from "expo-router"
import { Background, Input } from "../../components"
import { useSnackBar } from "../../contexts/SnackBar.context"
import { useAuth } from '../../contexts/Auth.context'

// slice de toast para el futuro

export default () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("123456")
  const [emailErr, setEmailErr] = useState("")
  const [passErr, setPassErr] = useState("")
  const [enable, setEnable] = useState(true)

  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const theme = useTheme()
  const { login, loading, error } = useAuth()
  const { showSnack } = useSnackBar()

  // #region Login
  const handlePress = async () => {
    const credentials = { email, password }
    const response = await login(credentials).catch((err) => console.log("[-] Login screen: ", err))
    console.log("[+] response -> ", response.data)
  }
  

  useEffect(() => {
    console.log("error -> ", error)
    if (error?.path === "email") {
      emailRef.current?.shake()
      setEmailErr(error?.message)
    } else if (error?.path === "password") {
      passwordRef.current?.shake()
      setPassErr(error?.message)
    } else if (error?.path === "") {
      showSnack(error?.message, "error")
    }
  }, [error])

  useEffect(() => {
    const result = email.length > 0 && password.length > 5
    setEnable(result)
  }, [email, password])

  return (
    <>
      <Background background={theme.colors.inversePrimary} />

      <View style={loginStyles.mainContainer}>
        {
          // #region Ligths
        }

        {
          // #region Form
        }
        <View style={[loginStyles.container, loginStyles.containerLogin]}>
          <Animated.View
            entering={FadeInUp.duration(1000).springify()}
            style={loginStyles.titleContainer}
          >
            <Text style={loginStyles.title}>InCUCEI</Text>
          </Animated.View>
          <View style={loginStyles.formContainer}>
            {
              // #region Inputs
            }
            <Animated.View
              entering={FadeInDown.duration(1000).springify()}
              style={loginStyles.form}
            >
              <Input
                ref={emailRef}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  if (emailErr !== "") setEmailErr("")
                }}
                leftIcon="email"
                error={emailErr}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                maxLength={64}
                autoCapitalize="none"
                enterKeyHint="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(200).duration(1000).springify()}
              style={loginStyles.form}
            >
              <Input
                ref={passwordRef}
                placeholder="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  if (passErr !== "") setPassErr("")
                }}
                leftIcon="lock"
                isPassword
                error={passErr}
                textContentType="password"
                maxLength={64}
                enterKeyHint="done"
              />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(200).duration(1000).springify()}
              style={loginStyles.form}
            >
              <Input disabled style={{ opacity: 0 }} />
            </Animated.View>
            {
              // #region Buttons
            }
            <Animated.View
              entering={FadeInDown.delay(400).duration(1000).springify()}
              style={loginStyles.formButton}
            >
              <Button
                mode="contained"
                onPress={handlePress}
                width={Dimensions.get("window").width * 0.5}
                style={{ borderRadius: 50 }}
                labelStyle={{ fontSize: 18, fontWeight: "bold" }}
                disabled={!enable || loading}
                loading={loading}
              >
                Iniciar Sesión
              </Button>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(600).duration(1000).springify()}
              style={{ flexDirection: "row", justifyContent: "center" }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.background,
                }}
              >
                No tienes una cuenta?
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/Register.screen")}
              >
                <Text
                  style={{
                    color: theme.colors.tertiary,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {" "}
                  Registrarse
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </>
  )
}
