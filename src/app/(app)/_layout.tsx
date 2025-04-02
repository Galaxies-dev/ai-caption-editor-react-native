import { Redirect, Slot, useSegments } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const Layout = () => {
  const { isSignedIn } = useAuth();
  const segments = useSegments();
  const inAuthGroup = segments[1] === '(authenticated)';

  // Protect the inside area
  if (!isSignedIn && inAuthGroup) {
    return <Redirect href="/login" />;
  }

  return <Slot />;
};

export default Layout;
