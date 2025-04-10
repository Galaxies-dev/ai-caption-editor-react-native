import { useAuth, useUser } from '@clerk/clerk-expo';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
// First saw this example on Beto's app https://github.com/betomoedano/modern-chat-app

const Page = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const passkeys = user?.passkeys ?? [];

  const createClerkPasskey = async () => {
    if (!user) return;

    try {
      await user?.createPasskey();
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error('Error:', JSON.stringify(err, null, 2));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-dark items-center justify-center">
      <Text className="text-white text-2xl font-Poppins_600SemiBold">Profile</Text>
      <Button title="Create Passkey" onPress={createClerkPasskey} />
      <Button title="Sign Out" onPress={handleSignOut} />

      <View className="gap-4 mt-8">
        <Text className="text-2xl font-Poppins_600SemiBold text-white">Passkeys</Text>
        {passkeys.length === 0 && (
          <Text className="text-base text-gray-400">No passkeys found</Text>
        )}
        {passkeys.map((passkey) => (
          <View key={passkey.id} className="bg-gray-800 p-4 rounded-lg">
            <Text className="text-white">
              ID: <Text className="text-gray-400">{passkey.id}</Text>
            </Text>
            <Text className="text-white">
              Name: <Text className="text-gray-400">{passkey.name}</Text>
            </Text>
            <Text className="text-white">
              Created: <Text className="text-gray-400">{passkey.createdAt.toDateString()}</Text>
            </Text>
            <Text className="text-white">
              Last Used: <Text className="text-gray-400">{passkey.lastUsedAt?.toDateString()}</Text>
            </Text>
            <TouchableOpacity onPress={() => passkey.delete()} className="mt-2">
              <Text className="text-red-500">Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};
export default Page;
