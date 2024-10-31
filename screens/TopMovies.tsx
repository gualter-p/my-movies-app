import React from "react";
import { useTopMovies } from "../hooks/useTopMovies";
import MovieGrid from "../components/MovieGrid";

export default function MoviesScreen() {
  const { data: movies, isLoading, error } = useTopMovies();

  return (
    <MovieGrid movies={movies ?? []} isLoading={isLoading} error={!!error} />
  );
}
