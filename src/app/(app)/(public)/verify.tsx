import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { emailAtom } from '@/store/login';
import { useAtomValue } from 'jotai';
import { isClerkAPIResponseError, useSignUp, useSignIn } from '@clerk/clerk-expo';
import { Alert } from 'react-native';

const Verify = () => {
  const router = useRouter();
  const { isLogin } = useLocalSearchParams<{ isLogin?: string }>();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);
  const email = useAtomValue(emailAtom);
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [countdown, isTimerRunning]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move to next input if value entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (!code[index] && index > 0) {
      // If current input is empty and not first input, move to previous
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  useEffect(() => {
    if (isCodeComplete) {
      Keyboard.dismiss();
    }
  }, [isCodeComplete]);

  const handleCreateAccount = async () => {
    try {
      const result = await signUp!.attemptEmailAddressVerification({
        code: code.join(''),
      });
      console.log('result', JSON.stringify(result, null, 2));
      await setActive!({ session: result.createdSessionId });
      router.replace('/(app)/(authenticated)/(tabs)/projects');
    } catch (err) {
      console.log('error', JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) {
        Alert.alert('Error', err.errors[0].message);
      }
    }
  };

  const handleSignIn = async () => {
    // await verifyCode();
    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: 'email_code',
        code: code.join(''),
      });
      console.log('result', JSON.stringify(result, null, 2));
      await setActive!({ session: result.createdSessionId });
      router.replace('/(app)/(authenticated)/(tabs)/projects');
    } catch (err) {
      console.log('error', JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) {
        Alert.alert('Error', err.errors[0].message);
      }
    }
  };
  44;

  const handleResendCode = async () => {
    if (countdown === 0) {
      setCountdown(60);
      setIsTimerRunning(true);
    }

    try {
      await signUp!.prepareVerification({ strategy: 'email_code' });
    } catch (err) {
      console.log('error', JSON.stringify(err, null, 2));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <View className="flex-1 bg-black px-6 pt-safe">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 justify-center bg-gray-800 rounded-xl">
          <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-white text-xl font-Poppins_600SemiBold mt-20">Enter code</Text>

        {/* Subtitle */}
        <Text className="text-gray-400 mt-2 font-Poppins_400Regular">
          Check your email and enter the code sent to{'\n'}
          <Text className="text-white">{email}</Text>
        </Text>

        {/* Code Input */}
        <View className="flex-row justify-between mt-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className={`w-[52px] h-[52px] bg-gray-800 rounded-lg text-white text-center text-xl
                ${!code[index] && index === code.findIndex((c) => !c) ? 'border-2 border-primary' : ''}`}
              maxLength={1}
              keyboardType="number-pad"
              value={code[index]}
              caretHidden={true}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  const newCode = [...code];
                  newCode[index] = '';
                  setCode(newCode);
                  handleBackspace(index);
                }
              }}
            />
          ))}
        </View>

        {/* Resend Code */}
        <TouchableOpacity className={`mt-6`} onPress={handleResendCode}>
          <Text
            className={`font-Poppins_500Medium ${countdown > 0 ? 'text-gray-400' : 'text-primary'}`}>
            Resend code {countdown > 0 ? `(${countdown})` : ''}
          </Text>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity
          className={`rounded-lg py-4 mt-auto mb-8 ${isCodeComplete ? 'bg-primary' : 'bg-gray-900'}`}
          disabled={!isCodeComplete}
          onPress={isLogin ? handleSignIn : handleCreateAccount}>
          <Text
            className={`text-center text-lg font-Poppins_600SemiBold ${
              !isCodeComplete ? 'text-gray-400' : 'text-white'
            }`}>
            {isLogin ? 'Sign in' : 'Create account'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Verify;
