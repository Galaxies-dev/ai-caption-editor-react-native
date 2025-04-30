import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface Voice {
  id: string;
  name: string;
  previewUrl: string;
  description: string;
  category: string;
}

interface VoiceSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVoice: (voiceId: string) => void;
}

const useAudioPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async (voice: Voice) => {
    try {
      // If the voice is already playing, pause it
      if (isPlaying === voice.id && sound) {
        await sound.pauseAsync();
        setIsPlaying(null);
        return;
      }

      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Load and play the new preview
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: voice.previewUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(voice.id);

      // Reset playing state when finished
      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setIsPlaying(null);
        }
      });
    } catch (error) {
      console.error('Failed to play preview:', error);
      setIsPlaying(null);
    }
  };

  return {
    playAudio,
    isPlaying,
  };
};

export const VoiceSelectionModal = ({
  visible,
  onClose,
  onSelectVoice,
}: VoiceSelectionModalProps) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playAudio, isPlaying } = useAudioPlayer();

  const getVoices = useAction(api.elevenlabs.getVoices);

  useEffect(() => {
    if (visible) {
      loadVoices();
    }
  }, [visible]);

  const loadVoices = async () => {
    try {
      const voiceList = await getVoices();

      // Filter out any voices with missing required fields
      const validVoices = voiceList.filter(
        (voice): voice is Voice =>
          typeof voice.id === 'string' &&
          typeof voice.name === 'string' &&
          typeof voice.previewUrl === 'string' &&
          typeof voice.description === 'string'
      );
      setVoices(validVoices);
    } catch (error) {
      console.error('Failed to load voices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="absolute inset-0 bg-black/50">
        <View className="flex-1 justify-end">
          <View className="bg-[#1A1A1A] rounded-t-3xl p-6 h-3/4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-Poppins_600SemiBold">Select Voice</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <ScrollView className="flex-1">
                {voices.length === 0 ? (
                  <View className="flex-1 items-center justify-center p-4">
                    <Text className="text-white text-center">
                      No voices available. Please try again later.
                    </Text>
                  </View>
                ) : (
                  voices.map((voice) => (
                    <TouchableOpacity
                      key={voice.id}
                      onPress={() => onSelectVoice(voice.id)}
                      className="bg-[#2A2A2A] p-4 rounded-xl mb-3">
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className="text-white font-Poppins_600SemiBold text-lg">
                            {voice.name}
                          </Text>
                          <Text className="text-gray-400 text-sm mt-1">{voice.description}</Text>
                          <Text className="text-primary text-sm mt-1">{voice.category}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => playAudio(voice)}
                          className="bg-[#3A3A3A] p-3 rounded-full">
                          <Ionicons
                            name={isPlaying === voice.id ? 'pause' : 'play'}
                            size={20}
                            color="white"
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
