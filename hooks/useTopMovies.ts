import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Movie } from "../types/Movie";
import { Queries } from "../constants/query";

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const fetchTopMovies = async () => {
  const response = await axios.get(
    `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
  );
  return response.data.results.slice(0, 10).map((movie: Movie) => ({
    ...movie,
    poster_url: `${BASE_IMAGE_URL}${movie.poster_path}`,
  }));
};

export const useTopMovies = () => {
  return useQuery({
    queryKey: [Queries.TOP_MOVIES],
    queryFn: fetchTopMovies,
    staleTime: 1000 * 60 * 5,
  });
};
