import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const project = useQuery(api.projects.get, { id: id as Id<'projects'> });
  const updateProject = useMutation(api.projects.update);
  const updateCaptions = useMutation(api.projects.updateCaptions);
  const processVideo = useAction(api.elevenlabs.processVideo);

  // Get the file URL from Convex storage
  const fileUrl = useQuery(api.projects.getFileUrl, {
    id: project?.videoFileId as Id<'_storage'>,
  });

  const player = useVideoPlayer(fileUrl || null, (player) => {
    player.loop = true;
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  // Update currentTime state when player's currentTime changes
  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        setCurrentTime(player.currentTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [player]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleGenerateCaptions = async () => {
    if (!project) return;

    try {
      setIsGenerating(true);

      // Update project status to processing
      await updateProject({
        id: project._id,
        status: 'processing',
      });

      // Get the video URL from storage
      const videoId = await project.videoFileId;
      console.log('🚀 ~ handleGenerateCaptions ~ videoUrl:', videoId);

      // Call ElevenLabs API
      const result = await processVideo({
        videoId,
      });

      console.log('🚀 ~ handleGenerateCaptions ~ result:', result);

      await updateCaptions({
        id: project._id,
        language: result.language_code,
        captions: result.words,
      });
    } catch (error) {
      // Update project status to failed
      await updateProject({
        id: project._id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onExportVideo = () => {
    console.log('Exporting video');
  };

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-dark">
      <Stack.Screen
        options={{
          title: project.name,
          headerRight: () => (
            <TouchableOpacity onPress={onExportVideo} className="bg-primary rounded-xl p-2 px-4">
              <Text className="text-white font-Poppins_600SemiBold text-lg">Export</Text>
            </TouchableOpacity>
          ),
        }}
      />
      {/* <Text className="text-2xl font-bold mb-4">Project: {project.name}</Text> */}

      {/* Video Player */}
      <View className="mt-28 items-center">
        <VideoView player={player} style={{ width: '75%', height: '75%', borderRadius: 10 }} />
        <View className="w-3/4 flex-row items-center justify-between mt-4 bg-[#1A1A1A] p-3 rounded-full">
          <TouchableOpacity
            onPress={() => {
              if (isPlaying) {
                player.pause();
              } else {
                player.play();
              }
            }}
            className="w-10 h-10 items-center justify-center">
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-medium">
            {formatTime(currentTime)} / {formatTime(player?.duration || 0)}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 flex-row justify-around items-center p-4 bg-[#1A1A1A]">
        <TouchableOpacity
          onPress={handleGenerateCaptions}
          disabled={isGenerating || project.status === 'processing'}
          className="items-center">
          <MaterialIcons name="closed-caption" size={24} color="white" />
          <Text className="text-white text-sm mt-1">Captions</Text>
          {isGenerating && <ActivityIndicator size="small" className="absolute -top-2 -right-2" />}
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <MaterialIcons name="style" size={24} color="white" />
          <Text className="text-white text-sm mt-1">Style</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <MaterialIcons name="aspect-ratio" size={24} color="white" />
          <Text className="text-white text-sm mt-1">Scale</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <MaterialIcons name="zoom-in" size={24} color="white" />
          <Text className="text-white text-sm mt-1">Zoom</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <FontAwesome name="microphone" size={24} color="white" />
          <Text className="text-white text-sm mt-1">AI Dub</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;
