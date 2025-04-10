import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

// CaptionsOverlay component
const CaptionsOverlay = ({
  captions,
  currentTime,
  fontSize,
  position,
  color,
}: {
  captions: any[];
  currentTime: number;
  fontSize: number;
  position: 'top' | 'middle' | 'bottom';
  color: string;
}) => {
  const currentCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime <= caption.end
  );

  if (!currentCaption) return null;

  const positionStyles = {
    top: { top: 50 },
    middle: { top: 250, transform: [{ translateY: -50 }] },
    bottom: { bottom: 200 },
  };

  return (
    <View style={[styles.captionsContainer, positionStyles[position]]}>
      <Text style={[styles.captionText, { fontSize, color }]}>{currentCaption.text}</Text>
    </View>
  );
};

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCaptionControls, setShowCaptionControls] = useState(false);
  const [captionSettings, setCaptionSettings] = useState({
    fontSize: 24,
    position: 'bottom' as 'top' | 'middle' | 'bottom',
    color: '#ff00ff',
  });

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
        {project.captions && (
          <CaptionsOverlay
            captions={project.captions}
            currentTime={currentTime}
            fontSize={captionSettings.fontSize}
            position={captionSettings.position}
            color={captionSettings.color}
          />
        )}
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
          onPress={() => setShowCaptionControls(!showCaptionControls)}
          disabled={isGenerating || project.status === 'processing'}
          className="items-center">
          <MaterialIcons name="closed-caption" size={24} color="white" />
          <Text className="text-white text-sm mt-1">Captions</Text>
          {isGenerating && <ActivityIndicator size="small" className="absolute -top-2 -right-2" />}
        </TouchableOpacity>

        {/* Caption Controls */}
        {showCaptionControls && (
          <View className="absolute bottom-20 left-0 right-0 bg-[#2A2A2A] p-4 rounded-t-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white">Size</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() =>
                    setCaptionSettings((prev) => ({
                      ...prev,
                      fontSize: Math.max(16, prev.fontSize - 2),
                    }))
                  }
                  className="bg-[#3A3A3A] p-2 rounded-full mr-2">
                  <Ionicons name="remove" size={16} color="white" />
                </TouchableOpacity>
                <Text className="text-white mx-2">{captionSettings.fontSize}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setCaptionSettings((prev) => ({
                      ...prev,
                      fontSize: Math.min(48, prev.fontSize + 2),
                    }))
                  }
                  className="bg-[#3A3A3A] p-2 rounded-full">
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white">Position</Text>
              <View className="flex-row">
                {(['top', 'middle', 'bottom'] as const).map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    onPress={() => setCaptionSettings((prev) => ({ ...prev, position: pos }))}
                    className={`p-2 rounded-full mx-1 ${captionSettings.position === pos ? 'bg-primary' : 'bg-[#3A3A3A]'}`}>
                    <Ionicons
                      name={pos === 'top' ? 'arrow-up' : pos === 'middle' ? 'remove' : 'arrow-down'}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white">Color</Text>
              <View className="flex-row">
                {['#ffffff', '#ff0000', '#00ff00', '#0000ff'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setCaptionSettings((prev) => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full mx-1 ${captionSettings.color === color ? 'border-2 border-white' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

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

const styles = StyleSheet.create({
  captionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    // backgroundColor: 'green',
  },
  captionText: {
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 4,
  },
});

export default Page;
