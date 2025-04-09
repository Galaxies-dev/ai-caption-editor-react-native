import { Stack } from 'expo-router';

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modal)/create"
        options={{
          presentation: 'formSheet',
          animation: 'slide_from_bottom',
          sheetAllowedDetents: [0.6],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: false,
          sheetCornerRadius: 20,
          headerShown: false,
        }}
      />
    </Stack>
  );
};
export default Layout;
