import React, { useEffect, useState, useCallback } from "react"
import { Text, View, TouchableOpacity, Image, Dimensions } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { loginStyles } from "../../styles/common.style"
import { Button, TextInput, useTheme } from "react-native-paper"
import { router } from "expo-router"
import { Background } from "../../components"
// API
// import { loginRequest } from "../api/auth.api"
// Redux
// import { setUser } from "../slices/home.slice"
// slice de toast para el futuro

export default () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [usernameErr, setUsernameErr] = useState("")
  const [emailErr, setEmailErr] = useState("")
  const [passErr, setPassErr] = useState("")
  const [showPass, setShowPass] = useState(false)

  const theme = useTheme()

  // #region Register
  const register = async () => {
    const response = await registerRequest({ email, password, username })
    if (Array.isArray(response)) {
      setErrors(response)
      return
    }
    if (response.data.username != undefined)
      console.log("[+] Usuario registrado! -> ", response.data.username)
  }

  return (
    <>
      <Background />
      <View style={loginStyles.mainContainer}>
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
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                left={<TextInput.Icon icon={"email"} />}
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
                left={<TextInput.Icon icon={"lock"} />}
                right={
                  <TextInput.Icon
                    icon={showPass ? "eye" : "eye-off"}
                    onPress={() => setShowPass(!showPass)}
                  />
                }
              />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(400).duration(1000).springify()}
              style={loginStyles.form}
            >
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!showPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                maxLength={64}
                autoComplete="password"
                textContentType="password"
                left={<TextInput.Icon icon={"lock"} />}
                right={
                  <TextInput.Icon
                    icon={showPass ? "eye" : "eye-off"}
                    onPress={() => setShowPass(!showPass)}
                  />
                }
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
                onPress={register}
                width={Dimensions.get("window").width * 0.5}
                style={{ padding: 4, borderRadius: 50 }}
                labelStyle={{ fontSize: 18, fontWeight: "bold" }}
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
