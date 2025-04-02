import { Text, View, Pressable, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useSSO } from '@clerk/clerk-expo';
import { randomUUID } from 'expo-crypto';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export default function Index() {
  const [loading, setLoading] = useState(false);
  const { startSSOFlow } = useSSO();
  const tasks = useQuery(api.tasks.get);
  console.log('🚀 ~ Index ~ tasks:', tasks);

  const handleSignInWithSSO = async (
    strategy: 'oauth_google' | 'oauth_apple' | 'oauth_microsoft'
  ) => {
    try {
      const { createdSessionId, setActive, signUp } = await startSSOFlow({
        strategy,
      });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });

        const email = signUp?.emailAddress;
        const username = signUp?.emailAddress;
        const password = randomUUID();
        const id = signUp?.createdUserId;

        if (!email || !username || !password || !id) {
          throw new Error('Missing required fields');
        }

        const strapiUser = {
          email,
          username,
          password,
          clerkId: id,
        };
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.log(err);
    }
  };

  return (
    <View className="flex-1 bg-[#132134] justify-center">
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View className="w-full items-center gap-8 max-w-md mx-auto">
          {/* <Image
            source={require('@/assets/images/intro.png')}
            style={{
              width: '100%',
              height: 400,
              aspectRatio: 1,
            }}
            resizeMode="contain"
          /> */}
          <Text className="text-3xl font-bold text-white mb-2">Your journey starts here</Text>

          <View className="w-full gap-4 px-4">
            <Pressable
              className="w-full flex-row justify-center items-center bg-white py-3 rounded-lg hover:cursor-pointer hover:bg-gray-800 duration-300"
              onPress={() => handleSignInWithSSO('oauth_apple')}>
              <Ionicons name="logo-apple" size={24} color="black" className="mr-2" />
              <Text className="text-black text-center font-semibold ml-2">Continue with Apple</Text>
            </Pressable>

            <Pressable
              className="w-full flex-row justify-center items-center bg-white py-3 rounded-lg hover:cursor-pointer hover:bg-gray-800 duration-300"
              onPress={() => handleSignInWithSSO('oauth_google')}>
              <Ionicons name="logo-google" size={24} color="black" className="mr-2" />
              <Text className="text-black text-center font-semibold ml-2">
                Continue with Google
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
