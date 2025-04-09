import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { HapticTab } from '@/components/HapticTab';
import * as Haptics from 'expo-haptics';
import { twFullConfig } from '@/utils/twconfig';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { PlatformPressable } from '@react-navigation/elements';

cssInterop(LinearGradient, {
  className: {
    target: 'style',
  },
});

cssInterop(Ionicons, {
  className: {
    target: 'style',
    nativeStyleToProp: { color: true },
  },
});

const CreateButton = () => {
  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(app)/(authenticated)/(modal)/create');
  };

  return (
    <Pressable onPress={handleCreate} className="rounded-xl flex-1 items-center justify-center">
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-xl items-center justify-center px-6 py-1">
        <Text className="text-white text-lg font-Poppins_600SemiBold p-2">Create</Text>
      </LinearGradient>
    </Pressable>
  );
};

// https://github.com/EvanBacon/expo-router-forms-components/blob/main/components/ui/Tabs.tsx
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: (twFullConfig.theme.colors as any).dark,
          elevation: 0,
          height: 100,
          borderBottomColor: '#ff0000',
        },
        headerStyle: {
          backgroundColor: (twFullConfig.theme.colors as any).dark,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Poppins_600SemiBold',
          fontSize: 22,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Poppins_500Medium',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#6c6c6c',
        headerTintColor: '#fff',
        tabBarButton: HapticTab,
        headerTitleAlign: 'left',
      }}>
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" size={size} color={color} />
          ),
          headerLeft: () => <DrawerToggleButton tintColor="#ffffff" />,
          headerRight: () => (
            <TouchableOpacity className="flex-row items-center gap-2 border border-primary rounded-xl px-2 py-1 mr-2">
              <Ionicons name="gift-outline" size={18} className="text-primary" />
              <Text className="text-white text-xs font-Poppins_600SemiBold">Get PRO</Text>
            </TouchableOpacity>
          ),
          tabBarButton: (props) => (
            <PlatformPressable {...props} style={{ gap: 6, alignItems: 'center', marginTop: 10 }} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          tabBarButton: () => <CreateButton />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
          tabBarButton: (props) => (
            <PlatformPressable {...props} style={{ gap: 6, alignItems: 'center', marginTop: 10 }} />
          ),
        }}
      />
    </Tabs>
  );
}
