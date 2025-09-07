import { Stack } from 'expo-router'

export default () => {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName='Home.screen' >
      {/* <Stack.Screen name="Home.screen" /> */}
    </Stack>
  );
};