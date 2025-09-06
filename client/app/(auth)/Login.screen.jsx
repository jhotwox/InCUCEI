import { useEffect, useState } from "react"
import { Text, View, TouchableOpacity, Dimensions } from "react-native"
// import Icon from "@expo/vector-icons/FontAwesome6"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { loginStyles } from "../../styles/common.style"
// import MetallicText from "../components/MetallicText"
// API
// import { loginRequest } from "../api/auth.api"
// Redux
// import { setUser } from "../slices/home.slice"
import { Button, TextInput, useTheme } from 'react-native-paper'
import { router } from "expo-router"
import { Background } from "../../components"
// slice de toast para el futuro

export default () => {
  const [email, setEmail] = useState("cris.gamers50@gmail.com")
  const [password, setPassword] = useState("123456")
  const [emailErr, setEmailErr] = useState("")
  const [passErr, setPassErr] = useState("")
  const [showPass, setShowPass] = useState(false)

  const theme = useTheme()

  // #region Errors
  setErrors = (errors) => {
    const dictionary = [
      "Invalid email",
      "Password must be at least 6 characters",
      "Incorrect email or password",
      "User not found",
    ]
    for (let i = 0; i < errors.length; i++) {
      if (errors[i] == dictionary[0]) {
        this.email.shake()
        setEmailErr(dictionary[0])
      }
      if (errors[i] == dictionary[1]) {
        this.password.shake()
        setPassErr(dictionary[1])
      }
      if (errors[i] == dictionary[2]) {
        this.password.shake()
        this.email.shake()
        setEmailErr("Incorrect email")
        setPassErr("Incorrect password")
      }
      if (errors[i] == dictionary[3]) setEmailErr(dictionary[3])
    }
  }

  // #region Login
  const login = async () => {
    console.log("Email -> ", email, "Pass -> ", password)
    // const response = await loginRequest({ email, password })
    // console.log("isArray? -> ", Array.isArray(response))
    // if (Array.isArray(response)) {
    //   setErrors(response)
    //   return
    // }
    // if (response.data.username != undefined) {
    //   const newUser = {
    //     id: response.data.id,
    //     username: response.data.username,
    //   }
    //   dispatch(setUser(newUser))
    //   console.log("[+] Logueado exitosamente")
    //   navigation.replace("Inicio")
    // }
  }

  return (
    <>
    <Background />
    
    <View style={loginStyles.mainContainer} >
      {
        // #region Ligths
      }
      <View style={loginStyles.lights}>
        <Animated.Image
          entering={FadeInUp.delay(200).duration(1000).springify().damping(6)}
          style={loginStyles.light1}
          source={require("../../assets/images/login/light.png")}
        />
        <Animated.Image
          entering={FadeInUp.delay(200).duration(1000).springify().damping(6)}
          style={loginStyles.light2}
          source={require("../../assets/images/login/light.png")}
        />
      </View>
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
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              left={ <TextInput.Icon icon={"email"} /> }
              maxLength={64}
              autoCapitalize="none"
              enterKeyHint="next"
            />
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(200).duration(1000).springify()}
            style={loginStyles.form}
          >
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              maxLength={64}
              autoComplete="password"
              textContentType="password"
              left={ <TextInput.Icon icon={"lock"} /> }
              right={ <TextInput.Icon icon={showPass ? "eye" : "eye-off"} onPress={() => setShowPass(!showPass)} /> }
            />
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
              onPress={login}
              width={Dimensions.get("window").width * 0.5}
              style={{ padding: 4, borderRadius: 50 }}
              labelStyle={{ fontSize: 18, fontWeight: "bold" }}
            >Iniciar Sesión</Button>
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
            <TouchableOpacity onPress={() => router.replace('/(auth)/Register.screen')}>
              <Text
                style={{
                  color: theme.colors.tertiary,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                {" "}Registrarse
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
    </>
  )
}
