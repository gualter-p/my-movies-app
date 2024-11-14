import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getUserPlaylists } from "../server/playlists/playlists";
import { Queries } from "../constants/query";

const { width: windowWidth } = Dimensions.get("window");

export default function MyMovies() {
  const {
    data: playlists = [],
    isLoading,
    isFetched,
    error,
  } = useQuery({
    queryKey: [Queries.USER_PLAYLISTS],
    queryFn: getUserPlaylists,
  });

  if (isLoading && !isFetched)
    return <ActivityIndicator size="large" color="#0000ff" />;

  if (error)
    return <Text style={styles.errorText}>Error loading playlists</Text>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={playlists}
        keyExtractor={(playlist) => playlist.id.toString()}
        renderItem={({ item: playlist }) => (
          <View style={styles.playlistContainer}>
            <Text style={styles.playlistTitle}>{playlist.name}</Text>
            <Text style={styles.playlistDescription}>
              {playlist.description}
            </Text>
            <FlatList
              data={playlist.items}
              keyExtractor={(movie) => movie.movie_id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: movie }) => (
                <View style={styles.movieCard}>
                  <Image
                    source={{ uri: movie.poster_url }}
                    style={styles.poster}
                  />
                  <Text style={styles.movieTitle} numberOfLines={1}>
                    {movie.title}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginVertical: 20,
  },
  playlistContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  movieCard: {
    width: windowWidth * 0.4,
    marginRight: 10,
    alignItems: "center",
  },
  poster: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  movieTitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    color: "#333",
  },
});
