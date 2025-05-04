import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Doc } from '@/convex/_generated/dataModel';

const Page = () => {
  const projects = useQuery(api.projects.list);

  if (projects === undefined) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <Text className="text-white text-lg font-Poppins_500Medium">Loading projects...</Text>
      </View>
    );
  }

  if (!projects.length) {
    return (
      <View className="flex-1 bg-dark items-center justify-center p-4">
        <View className="items-center">
          <Ionicons name="film-outline" size={48} color="#6c6c6c" />
          <Text className="text-white text-xl font-Poppins_600SemiBold mt-4 text-center">
            No project yet
          </Text>
          <Text className="text-gray-400 text-base font-Poppins_400Regular mt-2 text-center">
            Hit the button below to add your first projects and see some magic
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <FlatList
        data={projects}
        className="px-4"
        contentContainerStyle={{ paddingVertical: 20 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item: project }: { item: Doc<'projects'> }) => (
          <Link href={`/project/${project._id}`} asChild>
            <TouchableOpacity className="bg-[#1c1c1e] rounded-2xl p-4 flex-row items-center">
              <View className="flex-1">
                <Text className="text-white text-lg font-Poppins_600SemiBold">{project.name}</Text>
                <Text className="text-gray-400 text-sm font-Poppins_400Regular mt-1">
                  Last update {formatDistanceToNow(project.lastUpdate)} ago •{' '}
                  {(project.videoSize / 1024 / 1024).toFixed(1)} MB
                </Text>
              </View>
              <View className="bg-[#2c2c2e] w-10 h-10 rounded-xl items-center justify-center">
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
};

export default Page;
