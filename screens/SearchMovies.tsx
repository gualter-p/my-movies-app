import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useDebounce } from "../hooks/useDebounce";
import { useMovieSearch } from "../hooks/useMovieSearch";
import SearchBar from "../components/SearchBar";
import MovieGrid from "../components/MovieGrid";
import { usePersistentSearch } from "../hooks/usePersistentSearch";

export default function SearchMoviesScreen() {
  const { query, setQuery, currentPage, setCurrentPage } =
    usePersistentSearch();
  const debouncedQuery = useDebounce(query, 500);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useMovieSearch(debouncedQuery, currentPage);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const movies = data?.pages.flatMap((page) => page.movies) ?? [];

  return (
    <View style={styles.container}>
      <SearchBar query={query} onChangeQuery={setQuery} />
      {isLoading ? <ActivityIndicator /> : null}
      {!isLoading && debouncedQuery === "" ? (
        <Text style={styles.infoText}>Enter a movie name to search</Text>
      ) : null}
      {!isLoading && debouncedQuery !== "" && movies.length === 0 ? (
        <Text style={styles.infoText}>No movies found</Text>
      ) : null}
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
