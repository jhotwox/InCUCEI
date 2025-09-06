import { Stack } from 'expo-router'

export default () => {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName='Login.screen' >
      {/* <Stack.Screen name="Login.screen" />
      <Stack.Screen name="Register.screen" /> */}
    </Stack>
  );
};