import { Stack } from 'expo-router';
import '@/global.css';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });

  if (!fontsLoaded) return null;

  return <Stack />;
}
