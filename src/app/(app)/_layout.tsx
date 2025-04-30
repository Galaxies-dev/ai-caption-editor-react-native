import { Redirect, Slot, useSegments } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const Layout = () => {
  const segments = useSegments();
  const inAuthGroup = segments[1] === '(authenticated)';

  const { isSignedIn } = useAuth();

  // Protect the inside area
  if (!isSignedIn && inAuthGroup) {
    return <Redirect href="/login" />;
  }

  if (isSignedIn && !inAuthGroup) {
    return <Redirect href="/(app)/(authenticated)/(drawer)/(tabs)/projects" />;
  }

  return <Slot />;
};

export default Layout;
