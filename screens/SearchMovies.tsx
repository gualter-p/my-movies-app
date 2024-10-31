import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useDebounce } from "../hooks/useDebounce";
import { useMovieSearch } from "../hooks/useMovieSearch";
import SearchBar from "../components/SearchBar";
import MovieGrid from "../components/MovieGrid";

export default function SearchMoviesScreen() {
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 500);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useMovieSearch(debouncedQuery);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const movies = data?.pages.flatMap((page) => page.movies) ?? [];

  return (
    <View style={styles.container}>
      <SearchBar query={query} onChangeQuery={setQuery} />
      {isLoading && <ActivityIndicator size="large" />}
      {!isLoading && debouncedQuery === "" && (
        <Text style={styles.infoText}>Enter a movie name to search</Text>
      )}
      {!isLoading && debouncedQuery !== "" && movies.length === 0 && (
        <Text style={styles.infoText}>No movies found</Text>
      )}
      <MovieGrid
        movies={movies}
        isLoading={isLoading}
        error={!!error}
        onEndReached={loadMore}
        isFetchingNextPage={isFetchingNextPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
});
