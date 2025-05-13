import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CaptionSettings } from './CaptionsOverlay';

interface CaptionControlsProps {
  captionSettings: CaptionSettings;
  isUpdatingSettings: boolean;
  onCaptionSettingsChange: (settings: CaptionSettings) => void;
}

export const CaptionControls = ({
  captionSettings,
  isUpdatingSettings,
  onCaptionSettingsChange,
}: CaptionControlsProps) => {
  return (
    <View className="absolute bottom-24 left-0 right-0 bg-[#2A2A2A] p-4 rounded-t-xl mx-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white">Size</Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() =>
              onCaptionSettingsChange({
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
              onCaptionSettingsChange({
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
                onCaptionSettingsChange({
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
                onCaptionSettingsChange({
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
  );
};
