import { Slot, SplashScreen, Stack } from 'expo-router';
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
import { ClerkProvider, ClerkLoaded, useAuth, useUser } from '@clerk/clerk-expo';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, ThemeProvider, DarkTheme } from '@react-navigation/native';

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
  const user = useUser();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // Automatic login
  // useEffect(() => {
  //   if (!isLoaded) return;

  //   const inTabsGroup = segments[0] === '(auth)';

  //   if (isSignedIn && !inTabsGroup) {
  //     router.replace('/(auth)/(tabs)/feed');
  //   } else if (!isSignedIn && inTabsGroup) {
  //     router.replace('/(public)');
  //   }
  // }, [isSignedIn]);

  // Sentry
  // useEffect(() => {
  //   if (user && user.user) {
  //     Sentry.setUser({ email: user.user.emailAddresses[0].emailAddress, id: user.user.id });
  //   } else {
  //     Sentry.setUser(null);
  //   }
  // }, [user]);

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
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
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
