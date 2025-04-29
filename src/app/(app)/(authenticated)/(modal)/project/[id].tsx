import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import {
  CaptionsOverlay,
  CaptionSettings,
  DEFAULT_CAPTION_SETTINGS,
} from '@/components/CaptionsOverlay';
import { formatTime } from '@/utils/formatDuration';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCaptionControls, setShowCaptionControls] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [script, setScript] = useState('');
  const [isSavingScript, setIsSavingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>(DEFAULT_CAPTION_SETTINGS);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const project = useQuery(api.projects.get, { id: id as Id<'projects'> });
  const updateProject = useMutation(api.projects.update);
  const updateCaptions = useMutation(api.projects.updateCaptions);
  const updateCaptionSettings = useMutation(api.projects.updateCaptionSettings);
  const updateProjectScript = useMutation(api.projects.updateScript);
  const processVideo = useAction(api.elevenlabs.processVideo);
  const generateSpeech = useAction(api.elevenlabs.generateSpeech);
  const exportVideo = useAction(api.exportvideo.generateCaptionedVideo);

  // Get the file URL from Convex storage
  const fileUrl = useQuery(
    api.projects.getFileUrl,
    project?.videoFileId ? { id: project.videoFileId as Id<'_storage'> } : 'skip'
  );

  const player = useVideoPlayer(fileUrl || null, (player) => {
    player.loop = true;
    player.timeUpdateEventInterval = 1;
    // player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  // Update currentTime state when player's currentTime changes
  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        setCurrentTime(player.currentTime);
      }, 10); // Update every 100ms for better accuracy
      return () => clearInterval(interval);
    }
  }, [player]);

  // Load caption settings from project
  useEffect(() => {
    if (project?.captionSettings) {
      setCaptionSettings(project.captionSettings);
    }
  }, [project?.captionSettings]);

  // Load script from project when it changes
  useEffect(() => {
    if (project?.script) {
      setScript(project.script);
    }
  }, [project?.script]);

  // Update caption settings in Convex
  const handleCaptionSettingsChange = async (newSettings: typeof captionSettings) => {
    if (isUpdatingSettings) return; // Prevent multiple simultaneous updates

    try {
      setIsUpdatingSettings(true);
      console.log('Updating caption settings:', newSettings);

      // Update local state immediately for better UX
      setCaptionSettings(newSettings);

      // Call the mutation and wait for the result
      const result = await updateCaptionSettings({
        id: id as Id<'projects'>,
        settings: newSettings,
      });

      console.log('Caption settings updated successfully:', result);
    } catch (error) {
      console.error('Failed to update caption settings:', error);
      // Revert the local state if the update fails
      if (project?.captionSettings) {
        setCaptionSettings(project.captionSettings);
      }
    } finally {
      setIsUpdatingSettings(false);
    }
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

  const onExportVideo = async () => {
    if (!project) return;

    try {
      setIsExporting(true);
      console.log('Exporting video');

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }

      const result = await exportVideo({ id: project._id });
      console.log('🚀 ~ onExportVideo ~ result:', result);

      if (result) {
        // Download the video to local filesystem first
        const fileUri = FileSystem.documentDirectory + `exported_video_${new Date().getTime()}.mp4`;
        const downloadResult = await FileSystem.downloadAsync(result, fileUri);
        console.log('🚀 ~ onExportVideo ~ fileUri:', fileUri);

        if (downloadResult.status === 200) {
          // Save the video to media library
          const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
          console.log('Video saved to media library:', asset);

          // Clean up the temporary file
          await FileSystem.deleteAsync(fileUri);

          Alert.alert('Video Saved!', 'Would you like to view it?', [
            {
              text: 'View in Library',
              onPress: async () => {
                try {
                  // Create an album if it doesn't exist
                  const album = await MediaLibrary.getAlbumAsync('Captions App');
                  if (!album) {
                    await MediaLibrary.createAlbumAsync('Captions App', asset, false);
                  } else {
                    console.log('🚀 ~ onPress: ~ album:', album);
                    console.log('🚀 ~ onPress: ~ asset:', asset);
                    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                  }
                  // Open the Photos app
                  await Linking.openURL('photos-redirect://');
                } catch (error) {
                  console.error('Error opening video:', error);
                }
              },
            },
            {
              text: 'Close',
              style: 'cancel',
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const onGenerateSpeech = async () => {
    try {
      setIsGeneratingAudio(true);
      const audioUrl = await generateSpeech({ projectId: id as Id<'projects'> });
      if (audioUrl) {
        console.log('🚀 ~ onGenerateSpeech ~ audioUrl:', audioUrl);
        // Play the generated audio using Expo's Audio API
        // const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        // await sound.playAsync();
      }
    } catch (error) {
      console.error('Failed to generate speech:', error);
      Alert.alert('Error', 'Failed to generate speech. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
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
            <TouchableOpacity
              onPress={onExportVideo}
              className={`bg-primary rounded-xl p-2 px-4 ${isExporting ? 'opacity-50' : ''}`}
              disabled={isExporting}>
              <Text className="text-white font-Poppins_600SemiBold text-lg">
                {isExporting ? 'Exporting...' : 'Export'}
              </Text>
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
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-[#1A1A1A]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ paddingHorizontal: 4 }}>
          <TouchableOpacity
            onPress={handleGenerateCaptions}
            disabled={isGenerating || project.status === 'processing'}
            className={`items-center mr-8 rounded-full p-4 ${isGenerating || project.status === 'processing' ? 'bg-gray-400' : 'bg-white'}`}>
            <MaterialIcons name="auto-awesome" size={28} color="#1A1A1A" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowCaptionControls(!showCaptionControls)}
            disabled={isGenerating || project.status === 'processing'}
            className="items-center mr-8">
            <MaterialIcons
              name="closed-caption"
              size={28}
              color={isGenerating || project.status === 'processing' ? '#9CA3AF' : 'white'}
            />
            <Text
              className={`text-sm mt-1 ${isGenerating || project.status === 'processing' ? 'text-gray-400' : 'text-white'}`}>
              Captions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowScriptModal(true)} className="items-center mr-8">
            <MaterialIcons name="description" size={28} color="white" />
            <Text className="text-white text-sm mt-1">Script</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mr-8">
            <MaterialIcons name="style" size={28} color="white" />
            <Text className="text-white text-sm mt-1">Style</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mr-8">
            <MaterialIcons name="aspect-ratio" size={28} color="white" />
            <Text className="text-white text-sm mt-1">Scale</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mr-8">
            <MaterialIcons name="zoom-in" size={28} color="white" />
            <Text className="text-white text-sm mt-1">Zoom</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <FontAwesome name="microphone" size={28} color="white" />
            <Text className="text-white text-sm mt-1">AI Dub</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Caption Controls */}
        {showCaptionControls && (
          <View className="absolute bottom-24 left-0 right-0 bg-[#2A2A2A] p-4 rounded-t-xl mx-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white">Size</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() =>
                    handleCaptionSettingsChange({
                      ...captionSettings,
                      fontSize: Math.max(16, captionSettings.fontSize - 2),
                    })
                  }
                  disabled={isUpdatingSettings}
                  className={`bg-[#3A3A3A] p-2 rounded-full mr-2 ${isUpdatingSettings ? 'opacity-50' : ''}`}>
                  <Ionicons name="remove" size={16} color="white" />
                </TouchableOpacity>
                <Text className="text-white mx-2">{captionSettings.fontSize}</Text>
                <TouchableOpacity
                  onPress={() =>
                    handleCaptionSettingsChange({
                      ...captionSettings,
                      fontSize: Math.min(48, captionSettings.fontSize + 2),
                    })
                  }
                  disabled={isUpdatingSettings}
                  className={`bg-[#3A3A3A] p-2 rounded-full ${isUpdatingSettings ? 'opacity-50' : ''}`}>
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
                    onPress={() =>
                      handleCaptionSettingsChange({
                        ...captionSettings,
                        position: pos,
                      })
                    }
                    disabled={isUpdatingSettings}
                    className={`p-2 rounded-full mx-1 ${captionSettings.position === pos ? 'bg-primary' : 'bg-[#3A3A3A]'} ${isUpdatingSettings ? 'opacity-50' : ''}`}>
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
                    onPress={() =>
                      handleCaptionSettingsChange({
                        ...captionSettings,
                        color,
                      })
                    }
                    disabled={isUpdatingSettings}
                    className={`w-8 h-8 rounded-full mx-1 ${captionSettings.color === color ? 'border-2 border-white' : ''} ${isUpdatingSettings ? 'opacity-50' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Script Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showScriptModal}
        onRequestClose={() => setShowScriptModal(false)}>
        <View className="flex-1 justify-end">
          <View className="bg-[#1A1A1A] rounded-t-3xl p-6 h-3/4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-Poppins_600SemiBold">Add Script</Text>
              <TouchableOpacity onPress={() => setShowScriptModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <TextInput
              className="bg-[#2A2A2A] text-white p-4 rounded-xl h-[60%] mb-4"
              multiline
              placeholder="Paste or write your script here..."
              placeholderTextColor="#666"
              value={script}
              onChangeText={setScript}
              textAlignVertical="top"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={async () => {
                  try {
                    setIsSavingScript(true);
                    await updateProjectScript({ id: id as Id<'projects'>, script });
                    setShowScriptModal(false);
                  } catch (error) {
                    console.error('Failed to save script:', error);
                    Alert.alert('Error', 'Failed to save script. Please try again.');
                  } finally {
                    setIsSavingScript(false);
                  }
                }}
                disabled={isSavingScript}
                className={`flex-1 bg-primary p-4 rounded-xl ${isSavingScript ? 'opacity-50' : ''}`}>
                <Text className="text-white text-center font-Poppins_600SemiBold">
                  {isSavingScript ? 'Saving...' : 'Save Script'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onGenerateSpeech}
                disabled={isGeneratingAudio || !script}
                className={`flex-1 bg-[#2A2A2A] p-4 rounded-xl ${isGeneratingAudio || !script ? 'opacity-50' : ''}`}>
                <Text className="text-white text-center font-Poppins_600SemiBold">
                  {isGeneratingAudio ? 'Generating...' : 'Generate Speech'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isExporting && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-4 font-Poppins_600SemiBold">Exporting video...</Text>
        </View>
      )}
    </View>
  );
};

export default Page;
