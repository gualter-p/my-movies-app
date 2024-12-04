import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { MovieGridProps, Movie } from "../types/Movie";
import PlaylistSelector from "./PlaylistSelector";

export default function MovieGrid({
  movies,
  isLoading,
  error,
  onEndReached,
  onEndReachedThreshold = 0.5,
}: MovieGridProps) {
  const { width } = useWindowDimensions();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);
  const [selectedMovieForPlaylist, setSelectedMovieForPlaylist] =
    useState<Movie | null>(null);

  const numColumns = Math.min(5, Math.floor(width / (180 + 10)));

  const handleCardPress = (movieId: number) => {
    setSelectedMovieId(movieId === selectedMovieId ? null : movieId);
  };

  const handleAddToPlaylistPress = (movie: Movie) => {
    setSelectedMovieForPlaylist(movie);
    setIsPlaylistModalVisible(true);
  };

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text style={styles.errorText}>Error fetching movies</Text>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={movies}
        key={`grid-${numColumns}`}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <View
            style={[
              styles.movieCardContainer,
              { width: width / numColumns - 10 },
              selectedMovieId === item.id && styles.selectedCard,
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCardPress(item.id)}
              style={styles.movieCard}
            >
              <Image source={{ uri: item.poster_url }} style={styles.poster} />
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
                {item.title}
              </Text>
              <Text style={styles.rating}>
                ⭐ {item.vote_average.toFixed(1)}
              </Text>
            </TouchableOpacity>
            {selectedMovieId === item.id && (
              <TouchableOpacity
                style={styles.addToPlaylistButton}
                onPress={() => handleAddToPlaylistPress(item)}
              >
                <Text style={styles.buttonText}>Add to Playlist</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />

      {selectedMovieForPlaylist && (
        <PlaylistSelector
          visible={isPlaylistModalVisible}
          onClose={() => {
            setIsPlaylistModalVisible(false);
            setSelectedMovieId(null);
          }}
          movie={selectedMovieForPlaylist}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  movieCardContainer: {
    alignItems: "center",
    padding: 5,
  },
  movieCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  poster: {
    width: "100%",
    height: 205,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 4,
    color: "#333",
  },
  rating: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginVertical: 20,
  },
  selectedCard: {
    opacity: 0.7,
  },
  addToPlaylistButton: {
    position: "absolute",
    top: 5,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
