import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Image, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomDrawerContent = (props: any) => {
  const insets = useSafeAreaInsets();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        paddingTop: insets.top,
      }}
      scrollEnabled={false}>
      <View style={styles.drawerHeader}>
        <Image
          source={require('@/assets/images/wordmark.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const Layout = () => {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: '#ffffff',
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#1a1a1a',
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontFamily: 'Poppins_500Medium',
          paddingVertical: 2,
        },
        drawerActiveBackgroundColor: '#2a2a2a',
        drawerItemStyle: {
          borderRadius: 10,
        },
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTitleStyle: {
          fontFamily: 'Poppins_600SemiBold',
          fontSize: 22,
        },
        headerTintColor: '#ffffff',
      }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Projects',
          headerShown: false,
          drawerIcon: ({ color }) => <Ionicons name="film-outline" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="social-studio"
        options={{
          title: 'Social Studio',
          headerShown: true,
          drawerIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="ad-studio"
        options={{
          title: 'Ad Studio',
          headerShown: true,
          drawerIcon: ({ color }) => <Ionicons name="megaphone-outline" size={24} color={color} />,
        }}
      />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  logo: {
    width: 120,
    height: 40,
  },
});

export default Layout;
