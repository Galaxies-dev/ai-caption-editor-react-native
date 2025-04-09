import React from 'react';
import {
  Text,
  View,
  Pressable,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import Checkbox from 'expo-checkbox';
import { Link, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../../tailwind.config';
import { useSetAtom } from 'jotai';
import { emailAtom } from '@/store/login';
const twFullConfig = resolveConfig(tailwindConfig);

export default function LoginScreen() {
  const [loading, setLoading] = useState<'google' | 'apple' | 'microsoft' | 'email' | false>(false);
  const [isTermsChecked, setTermsChecked] = useState(false);
  const [email, setEmail] = useState('saimon@devdactic.com');
  const setEmailAtom = useSetAtom(emailAtom);

  const { startSSOFlow } = useSSO();
  const { signUp } = useSignUp();
  const router = useRouter();
  const handleSignInWithSSO = async (
    strategy: 'oauth_google' | 'oauth_apple' | 'oauth_microsoft'
  ) => {
    if (
      strategy === 'oauth_google' ||
      strategy === 'oauth_apple' ||
      strategy === 'oauth_microsoft'
    ) {
      setLoading(strategy.replace('oauth_', '') as 'google' | 'apple' | 'microsoft');
    } else {
      setLoading(false);
    }
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!isTermsChecked) {
      console.log('Please agree to the terms.');
      return;
    }
    try {
      const result = await signUp?.create({
        emailAddress: email,
      });
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      setEmailAtom(email);
      router.push('/verify');
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleLinkPress = (linkType: 'terms' | 'privacy') => {
    console.log(`Link pressed: ${linkType}`);
    Linking.openURL(
      linkType === 'terms' ? 'https://galaxies.dev/terms' : 'https://galaxies.dev/privacy'
    );
  };

  const Logo = () => (
    <View className="items-center mb-24 pt-10">
      <View className="flex-row">
        <Text className="text-white text-6xl font-bold">captions</Text>
        <Text className="text-white text-xl font-bold">®</Text>
      </View>
      <Text className="text-gray-400 text-md mt-2 font-Poppins_400Regular">
        Generate and edit talking videos with AI.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      {/* Container for Colored Blobs */}
      <View className="absolute top-0 left-0 right-0 h-[400px] overflow-hidden">
        {/* Colored Blobs */}
        <View className="absolute -top-20 -left-40 w-96 h-96 bg-sky-400 rounded-full opacity-80" />
        <View className="absolute -top-40 -right-20 w-96 h-96 bg-blue-600 rounded-full opacity-50" />
        <View className="absolute top-20 -right-20 w-72 h-72 bg-indigo-600 rounded-full opacity-40" />
      </View>

      {/* Blurred Overlay */}
      <BlurView
        intensity={100}
        tint="dark"
        className="absolute top-0 left-0 right-0 h-[400px]"></BlurView>

      {/* Gradient Overlay for Smooth Transition */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'black']} // Fade from transparent to the background black
        className="absolute left-0 right-0 h-[150px]" // Height of the gradient fade
        style={{ top: 200 - 150 }} // Position gradient at the bottom of the 400px blur area
      />

      {/* Main Content Area */}
      <View className="flex-1 p-6 pt-safe z-10">
        <View className="flex-row justify-end">
          <Link href="/faq" asChild>
            <TouchableOpacity className="bg-gray-700 rounded-xl p-2">
              <Feather name="help-circle" size={30} color="white" />
            </TouchableOpacity>
          </Link>
        </View>
        <Logo />

        <TextInput
          className="bg-gray-800 text-gray-300 p-5 rounded-xl mb-6"
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View className="flex-row items-center">
          <Checkbox
            value={isTermsChecked}
            onValueChange={(newValue) => {
              console.log('Checkbox value changed:', newValue);
              setTermsChecked(newValue);
            }}
            color={isTermsChecked ? (twFullConfig.theme.colors as any).primary : undefined}
            className="mr-3"
          />
          <Text className="text-gray-400 text-md font-Poppins_500Medium flex-1 flex-wrap">
            I agree to the{' '}
            <Text className="text-white underline" onPress={() => handleLinkPress('terms')}>
              Terms of Service
            </Text>{' '}
            and acknowledge Captions'{' '}
            <Text className="text-white underline" onPress={() => handleLinkPress('privacy')}>
              Privacy Policy
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-lg mt-6 mb-14 transition-colors duration-300 ${
            !email || !isTermsChecked || loading === 'email' ? 'bg-gray-800' : 'bg-primary'
          }`}
          onPress={handleEmailSignIn}
          disabled={!email || !isTermsChecked || loading === 'email'}>
          {loading === 'email' ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-Poppins_600SemiBold text-lg ">
              Continue
            </Text>
          )}
        </TouchableOpacity>

        <View className="gap-4">
          <Pressable
            className="w-full flex-row justify-center items-center bg-gray-800 p-4 rounded-lg"
            onPress={() => handleSignInWithSSO('oauth_apple')}
            disabled={!!loading}>
            {loading === 'apple' ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="logo-apple" size={24} color="white" />
                <Text className="text-white text-center font-Poppins_600SemiBold ml-3 text-base">
                  Continue with Apple
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            className="w-full flex-row justify-center items-center bg-gray-800 p-4 rounded-lg"
            onPress={() => handleSignInWithSSO('oauth_google')}
            disabled={!!loading}>
            {loading === 'google' ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Image source={require('@/assets/images/google.webp')} className="w-6 h-6" />
                <Text className="text-white text-center font-Poppins_600SemiBold ml-3 text-base">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            className="w-full flex-row justify-center items-center bg-gray-800 p-4 rounded-lg"
            onPress={() => handleSignInWithSSO('oauth_microsoft')}
            disabled={!!loading}>
            {loading === 'microsoft' ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Image source={require('@/assets/images/microsoft.webp')} className="w-6 h-6" />
                <Text className="text-white text-center font-Poppins_600SemiBold ml-3 text-base">
                  Continue with Microsoft
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View className="items-center pt-6">
          <TouchableOpacity>
            <Text className="text-gray-400 text-center font-Poppins_600SemiBold text-base">
              Continue another way
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
