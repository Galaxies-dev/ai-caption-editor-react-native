import { Slot, SplashScreen } from 'expo-router';
import '@/global.css';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { LogBox, useColorScheme } from 'react-native';
import { tokenCache } from '@/utils/cache';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, ThemeProvider, DarkTheme } from '@react-navigation/native';
import { passkeys } from '@clerk/clerk-expo/passkeys';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}
LogBox.ignoreLogs(['Clerk: Clerk has been loaded with development keys.']);

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const InitialLayout = () => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Sentry
  // useEffect(() => {
  //   if (user && user.user) {
  //     Sentry.setUser({ email: user.user.emailAddresses[0].emailAddress, id: user.user.id });
  //   } else {
  //     Sentry.setUser(null);
  //   }
  // }, [user]);

  if (!fontsLoaded) {
    return null;
  }

  return <Slot />;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Sentry
  // const ref = useNavigationContainerRef();

  // useEffect(() => {
  //   if (ref) {
  //     routingInstrumentation.registerNavigationContainer(ref);
  //   }
  // }, [ref]);

  return (
    <ClerkProvider
      publishableKey={publishableKey!}
      tokenCache={tokenCache}
      __experimental_passkeys={passkeys}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <InitialLayout />
            </ThemeProvider>
          </GestureHandlerRootView>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
