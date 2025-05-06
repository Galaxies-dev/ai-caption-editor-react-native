import FAQ from '@/components/FAQ';
import { View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1">
      <FAQ dom={{ scrollEnabled: false, style: { backgroundColor: 'black' } }} />
    </View>
  );
}
