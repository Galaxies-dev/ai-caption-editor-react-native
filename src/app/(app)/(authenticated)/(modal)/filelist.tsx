import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '@/utils/formatDuration';

export default function FileList() {
  const [videos, setVideos] = useState<MediaLibrary.Asset[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) return;

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'video',
        sortBy: ['creationTime'],
      });
      console.log(media.assets);
      setVideos(media.assets);
    })();
  }, []);

  const selectVideo = (video: MediaLibrary.Asset) => {
    console.log(video);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {videos.map((video) => (
            <Pressable key={video.id} style={styles.videoItem} onPress={() => selectVideo(video)}>
              <Image source={{ uri: video.uri }} style={styles.thumbnail} resizeMode="cover" />
              <View style={styles.durationContainer}>
                <Text style={styles.duration}>{formatDuration(video.duration)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#1c1c1e',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  videoItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
    position: 'relative',
  },
  thumbnail: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#2c2c2e',
  },
  durationContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 4,
  },
  duration: {
    color: 'white',
    fontSize: 12,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderRadius: 8,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
