import FAQ from '@/components/FAQ';
import { View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1">
      {/* This is a DOM component. It re-exports a wrapped `react-native-webview` behind the scenes. */}
      <FAQ dom={{ scrollEnabled: false, style: { backgroundColor: 'black' } }} />
    </View>
  );
}
