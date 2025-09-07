import { useEffect, useState, useCallback, useRef } from "react"
import { Text, View, TouchableOpacity, Dimensions } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { loginStyles } from "../../styles/common.style"
import { Button, useTheme } from "react-native-paper"
import { router } from "expo-router"
import { Background, Input } from "../../components"
import { useRegister } from "../../hooks/auth/useRegister"
import { useSnackBar } from "../../contexts/SnackBar.context"

export default () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailErr, setEmailErr] = useState("")
  const [passErr, setPassErr] = useState("")
  const [confirmPassErr, setConfirmPassErr] = useState("")
  const [enable, setEnable] = useState(true)

  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const confirmPasswordRef = useRef(null)

  const theme = useTheme()
  const { error, loading, register } = useRegister()
  const { showSnack } = useSnackBar()

  // #region Register
  const handlePress = async () => {
    const user = { email, password, confirmPassword }
    const { token } = await register(user).catch((err) => {
      console.log("[-] Register screen: ", err)
      return null
    })

    if (token) {
      // console.log("Usuario registrado! -> ", token)
      showSnack("Usuario registrado exitosamente", "success")
      router.replace("Home.screen")
    }
  }

  useEffect(() => {
    console.log("error -> ", error)
    if (error?.path === "email") {
      emailRef.current?.shake()
      setEmailErr(error?.message)
    } else if (error?.path === "password") {
      passwordRef.current?.shake()
      setPassErr(error?.message)
    }
    else if (error?.path === "confirmPassword") {
      confirmPasswordRef.current?.shake()
      setConfirmPassErr(error?.message)
    } else if (error?.path === "") {
      showSnack(error?.message, "error")
    }
  }, [error])

  useEffect(() => {
    const result = email.length > 0 && password.length > 5 && confirmPassword.length > 5
    setEnable(result)
  }, [email, password, confirmPassword])

  return (
    <>
      <Background />
      <View style={loginStyles.mainContainer}>
        {
          // #region Ligths
        }

        {
          // #region Form
        }
        <View style={[loginStyles.container]}>
          {/* <View style={{ marginBottom: 280 }} /> */}
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
                // setValue={setEmail}
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
                // setValue={setPassword}
                onChangeText={(text) => {
                  setPassword(text)
                  if (passErr !== "") setPassErr("")
                }}
                leftIcon="lock"
                isPassword
                error={passErr}
                textContentType="password"
                maxLength={64}
                enterKeyHint="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(400).duration(1000).springify()}
              style={loginStyles.form}
            >
              <Input
                ref={confirmPasswordRef}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                setValue={setConfirmPassword}
                leftIcon="lock"
                isPassword
                error={confirmPassErr}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                  if (confirmPassErr !== "") setConfirmPassErr/("")
                }}
                textContentType="password"
                maxLength={64}
                enterKeyHint="done"
              />
            </Animated.View>
            {
              // #region Buttons
            }
            <Animated.View
              entering={FadeInDown.delay(600).duration(1000).springify()}
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
                Registrarse
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
                Ya tienes una cuenta?
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/Login.screen")}
              >
                <Text
                  style={{
                    color: theme.colors.tertiary,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {" "}
                  Iniciar
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </>
  )
}
