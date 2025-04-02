import { Text, View, Image } from 'react-native';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Image
        source={require('@/assets/images/react-logo.png')}
        style={{ width: 200, height: 300 }}
      />
    </View>
  );
}
