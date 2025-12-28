import { useEffect, useRef, useState } from "react"
import { Text, View, TouchableOpacity, Dimensions } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { loginStyles } from "../../styles/common.style"
// Redux
// import { setUser } from "../slices/home.slice"
import { Button, useTheme } from "react-native-paper"
import { router } from "expo-router"
import { Background, Input } from "../../components"
import { useToast } from "../../contexts/Toast.context"
import { useAuth } from '../../contexts/Auth.context'

// slice de toast para el futuro
/**
 * Login screen component (default export).
 *
 * Renders a login form with email and password inputs, client-side validation,
 * animated transitions, and buttons to submit credentials or navigate to the
 * registration screen. Integrates with app theme, auth and toast hooks.
 *
 * State:
 * - email {string} - controlled email input, initialised from EXPO_PUBLIC_USER_EMAIL env var or empty string.
 * - password {string} - controlled password input (default "123456" in selection).
 * - emailErr {string} - email field error message.
 * - passErr {string} - password field error message.
 * - enable {boolean} - whether the submit button should be enabled (true when email present and password length > 5).
 *
 * Refs:
 * - emailRef {React.RefObject} - used to shake the email input on validation errors and to focus/clear as needed.
 * - passwordRef {React.RefObject} - used to shake the password input and focus from the email input.
 *
 * Hooks / side effects:
 * - useTheme() supplies styling/theme colors.
 * - useAuth() provides { login, loading, error } where `login(credentials)` returns a response with `data.token` on success.
 *   - handlePress: constructs { email, password }, calls login, logs the response, and shows a success toast when a token is received.
 * - useToast() provides showToast(message, type) for success/error notifications.
 * - useEffect watching `error`: if error.path === "email" or "password" the corresponding field is shaken and an error state set;
 *   if error.path === "" an error toast is shown.
 * - useEffect watching `email` and `password`: updates `enable` based on simple validation (email non-empty and password length > 5).
 *
 * UI behavior:
 * - Inputs clear their respective error state on change.
 * - Email input uses keyboard/email optimizations and moves focus to password on submit.
 * - Password input supports secure entry and limits input length.
 * - Submit button is disabled when `!enable` or while `loading` and shows a loading indicator when `loading`.
 *
 * @component
 * @returns {JSX.Element} A React element representing the login screen.
 */

export default () => {
  const [email, setEmail] = useState(process.env.EXPO_PUBLIC_USER_EMAIL || "")
  const [password, setPassword] = useState(process.env.EXPO_PUBLIC_USER_PASSWORD || "")
  const [emailErr, setEmailErr] = useState("")
  const [passErr, setPassErr] = useState("")
  const [enable, setEnable] = useState(true)

  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const theme = useTheme()
  const { login, loading, error } = useAuth()
  const { showToast } = useToast()

  // #region Login
  const handlePress = async () => {
    const credentials = { email, password }
    console.log("Credentials: ", { email, password })
    const response = await login(credentials).catch((err) => console.log("[-] Login screen: ", err))
    console.log("[+] response -> ", response.data)
    if (response?.data?.token)
      showToast("¡Inicio de sesión exitoso!", "success")
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
      console.log("General")
      console.log("Mesage in login: ", error?.message)
      showToast(error?.message, "error")
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