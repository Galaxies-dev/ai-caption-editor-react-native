import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

interface VideoControlsProps {
  isGenerating: boolean;
  projectStatus: string;
  onGenerateCaptions: () => void;
  onShowCaptionControls: () => void;
  onShowScriptModal: () => void;
}

export const VideoControls = ({
  isGenerating,
  projectStatus,
  onGenerateCaptions,
  onShowCaptionControls,
  onShowScriptModal,
}: VideoControlsProps) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 p-6 bg-[#1A1A1A]">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingHorizontal: 4 }}>
        <TouchableOpacity
          onPress={onGenerateCaptions}
          disabled={isGenerating || projectStatus === 'processing'}
          className="items-center mr-8">
          <MaterialIcons
            name="auto-awesome"
            size={28}
            color={isGenerating || projectStatus === 'processing' ? '#9CA3AF' : 'white'}
          />
          <Text
            className={`text-sm mt-1 ${isGenerating || projectStatus === 'processing' ? 'text-gray-400' : 'text-white'}`}>
            Generate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onShowCaptionControls}
          disabled={isGenerating || projectStatus === 'processing'}
          className="items-center mr-8">
          <MaterialIcons
            name="closed-caption"
            size={28}
            color={isGenerating || projectStatus === 'processing' ? '#9CA3AF' : 'white'}
          />
          <Text
            className={`text-sm mt-1 ${isGenerating || projectStatus === 'processing' ? 'text-gray-400' : 'text-white'}`}>
            Captions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShowScriptModal} className="items-center mr-8">
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
    </View>
  );
};
