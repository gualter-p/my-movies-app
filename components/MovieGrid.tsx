import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { MovieGridProps } from "../types/Movie";

const MAX_COLUMNS = 5;
const CARD_WIDTH = 180;
const SPACING = 10;

export default function MovieGrid({
  movies,
  isLoading,
  error,
  onEndReached,
  onEndReachedThreshold = 0.5,
}: MovieGridProps) {
  const { width } = useWindowDimensions();
  const numColumns = Math.min(
    MAX_COLUMNS,
    Math.floor(width / (CARD_WIDTH + SPACING))
  );

  if (isLoading) return <ActivityIndicator size="large" />;
  if (error) return <Text style={styles.errorText}>Error fetching movies</Text>;

  return (
    <FlatList
      data={movies}
      key={`grid-${numColumns}`}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      renderItem={({ item }) => (
        <View
          style={[
            styles.movieCardContainer,
            { width: width / numColumns - SPACING },
          ]}
        >
          <View style={styles.movieCard}>
            <Image source={{ uri: item.poster_url }} style={styles.poster} />
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
              {item.title}
            </Text>
            <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
          </View>
        </View>
      )}
      contentContainerStyle={styles.listContainer}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
    />
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
});
