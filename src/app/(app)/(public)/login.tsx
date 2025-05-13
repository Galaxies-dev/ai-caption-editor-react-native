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
import { useSignUp, useSSO, useSignIn, isClerkAPIResponseError } from '@clerk/clerk-expo';
import Checkbox from 'expo-checkbox';
import { Link, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useSetAtom } from 'jotai';
import { emailAtom } from '@/store/login';
import { twFullConfig } from '@/utils/twconfig';
import * as Sentry from '@sentry/react-native';

export default function LoginScreen() {
  const [loading, setLoading] = useState<'google' | 'apple' | 'email' | false>(false);
  const [isTermsChecked, setTermsChecked] = useState(false);
  const [email, setEmail] = useState('saimon@devdactic.com');
  const setEmailAtom = useSetAtom(emailAtom);

  const { startSSOFlow } = useSSO();
  const { signUp } = useSignUp();
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const handleSignInWithSSO = async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (strategy === 'oauth_google' || strategy === 'oauth_apple') {
      setLoading(strategy.replace('oauth_', '') as 'google' | 'apple');
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
      setEmailAtom(email);

      await signUp?.create({
        emailAddress: email,
      });
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      router.push('/verify');
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        if (error.status === 422) {
          handleSignInWithEmail();
        } else {
          Alert.alert('Error', 'Something went wrong');
        }
      }
    }
  };

  const handleSignInWithEmail = async () => {
    try {
      const signInAttempt = await signIn?.create({
        strategy: 'email_code',
        identifier: email,
      });
      console.log('signInAttempt', JSON.stringify(signInAttempt, null, 2));
      router.push('/verify?isLogin=true');
      // await signIn?.prepareFirstFactor({ strategy: 'email_code' });
    } catch (error) {
      console.error('Error:', JSON.stringify(error, null, 2));
    }
  };

  const handleLinkPress = (linkType: 'terms' | 'privacy') => {
    console.log(`Link pressed: ${linkType}`);
    Linking.openURL(
      linkType === 'terms' ? 'https://galaxies.dev/terms' : 'https://galaxies.dev/privacy'
    );
  };

  const signInWithPasskey = async () => {
    // 'discoverable' lets the user choose a passkey
    // without auto-filling any of the options
    try {
      const signInAttempt = await signIn?.authenticateWithPasskey({
        flow: 'discoverable',
      });

      if (signInAttempt?.status === 'complete') {
        if (setActive !== undefined) {
          await setActive({ session: signInAttempt.createdSessionId });
        }
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error('Error:', JSON.stringify(err, null, 2));
    }
  };

  const testSentry = () => {
    Sentry.captureException(new Error('Test Sentry Error'));
  };

  return (
    <View className="flex-1 bg-black pt-safe">
      <View className="flex-1 p-6">
        <View className="flex-row justify-end">
          <Link href="/faq" asChild>
            <TouchableOpacity className="bg-gray-700 rounded-xl p-2">
              <Feather name="help-circle" size={30} color="white" />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="items-center mb-8 pt-8">
          <View className="flex-row">
            <Image source={require('@/assets/images/convex.png')} className="w-40 h-40" />
          </View>
          <Text className="text-gray-400 text-md mt-2 font-Poppins_400Regular">
            AI-powered Captions editor
          </Text>
        </View>

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
        </View>

        <View className="items-center pt-6">
          {/* <TouchableOpacity onPress={signInWithPasskey}>
            <Text className="text-gray-400 text-center font-Poppins_600SemiBold text-base">
              Continue with Passkey
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity onPress={testSentry}>
            <Text className="text-gray-400 text-center font-Poppins_600SemiBold text-base">
              Test Sentry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
