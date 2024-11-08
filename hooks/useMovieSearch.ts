import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Movie } from "../types/Movie";
import { Queries } from "../constants/query";

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const fetchMovies = async ({
  queryKey,
  pageParam = 1,
}: {
  queryKey: string[];
  pageParam?: number;
}) => {
  const [, query] = queryKey;
  const response = await axios.get(
    `https://api.themoviedb.org/3/search/movie`,
    {
      params: {
        api_key: API_KEY,
        query,
        page: pageParam,
      },
    }
  );

  const movies = response.data.results.map((movie: Movie) => ({
    ...movie,
    poster_url: movie.poster_path
      ? `${BASE_IMAGE_URL}${movie.poster_path}`
      : null,
  }));

  return {
    movies,
    nextPage: pageParam + 1,
    totalPages: response.data.total_pages,
  };
};

export const useMovieSearch = (query: string, currentPage: number) => {
  const trimmedQuery = query.trim();

  return useInfiniteQuery({
    queryKey: [Queries.SEARCH_MOVIES, trimmedQuery],
    queryFn: fetchMovies,
    enabled: !!trimmedQuery,
    initialPageParam: currentPage,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage <= lastPage.totalPages
        ? lastPage.nextPage
        : undefined;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5, // Does regular (5mins) refetching online
    gcTime: Infinity, // No garbage collection to keep stale cache
  });
};
