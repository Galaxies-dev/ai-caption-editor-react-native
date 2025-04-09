import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { twFullConfig } from '@/utils/twconfig';

const Layout = () => {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
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
            <Pressable onPress={() => router.dismissAll()}>
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          ),
          headerStyle: {
            backgroundColor: (twFullConfig.theme.colors as any).dark,
          },
          headerTitle: 'Project',
          headerTitleStyle: {
            color: 'white',
          },
        }}
      />
    </Stack>
  );
};
export default Layout;
