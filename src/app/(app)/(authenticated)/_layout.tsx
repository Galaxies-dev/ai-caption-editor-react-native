import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { twFullConfig } from '@/utils/twconfig';

// screenOptions={{
//   drawerActiveTintColor: '#ffffff',
//   drawerInactiveTintColor: '#ffffff',
//   headerShown: false,
//   drawerStyle: {
//     backgroundColor: '#1a1a1a',
//   },
//   drawerLabelStyle: {
//     fontSize: 16,
//     fontFamily: 'Poppins_500Medium',
//     paddingVertical: 2,
//   },
//   drawerActiveBackgroundColor: '#2a2a2a',
//   drawerItemStyle: {
//     borderRadius: 10,
//   },
//   headerStyle: {
//     backgroundColor: '#1a1a1a',
//   },
//   headerTitleStyle: {
//     fontFamily: 'Poppins_600SemiBold',
//     fontSize: 22,
//   },
//   headerTintColor: '#ffffff',
// }}

const Layout = () => {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modal)/create"
        options={{
          presentation: 'formSheet',
          animation: 'slide_from_bottom',
          sheetAllowedDetents: [0.5],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: false,
          sheetCornerRadius: 20,
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Stack.Screen
        name="(modal)/filelist"
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
          headerLeft: () => (
            <Pressable onPress={() => router.dismissAll()}>
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          ),
          headerStyle: {
            backgroundColor: (twFullConfig.theme.colors as any).dark,
          },
          headerTitle: 'File List',
          headerTitleStyle: {
            color: 'white',
          },
        }}
      />
      <Stack.Screen
        name="(modal)/project/[id]"
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
          headerLeft: () => (
            <Pressable
              onPress={() => router.dismissAll()}
              className="bg-neutral-800 p-2 rounded-xl">
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          ),
          headerTransparent: true,
          headerTitleStyle: {
            color: 'white',
          },
        }}
      />
    </Stack>
  );
};
export default Layout;
