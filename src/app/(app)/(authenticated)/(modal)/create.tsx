import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const TopCreateOption = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 items-center p-4 bg-neutral-800 rounded-2xl">
    <View className="mb-3">{icon}</View>
    <View className="items-center">
      <Text className="text-white text-lg font-Poppins_600SemiBold text-center">{title}</Text>
      <Text className="text-gray-400 font-Poppins_400Regular text-center">{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const Page = () => {
  const onImportVideo = () => {
    router.push('/filelist');
  };

  const onRecordVideo = () => {
    console.log('Record video');
  };

  return (
    <View className="flex-1 bg-dark px-4 pt-4">
      <View className="flex-1 p-4 rounded-2xl">
        <View className="flex-row gap-3 mb-3">
          <TopCreateOption
            icon={<Ionicons name="download-outline" size={24} color="white" />}
            title="Caption Video"
            subtitle="Import footage"
            onPress={onImportVideo}
          />
          <TopCreateOption
            icon={<Ionicons name="videocam-outline" size={24} color="white" />}
            title="Record Video"
            subtitle="Use your camera"
            onPress={onRecordVideo}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="w-full py-4 mb-8 bg-zinc-800 rounded-2xl">
          <Text className="text-center text-lg text-gray-400 font-Poppins_600SemiBold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;
