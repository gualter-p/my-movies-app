export type Movie = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  poster_path: string | undefined;
  poster_url: string | undefined;
};

export type MovieGridProps = {
  movies: Movie[];
  isLoading: boolean;
  error: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isFetchingNextPage?: boolean;
};
