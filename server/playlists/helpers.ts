import { QueryClient } from "@tanstack/react-query";
import { Playlist } from "../../types/Playlist";
import { Movie } from "../../types/Movie";
import { PendingMutation } from "../../types/Mutation";
import { Mutations } from "../../constants/mutation";
import { MutationStorage } from "../../lib/mutationStorage";

// Handles mutation
export async function handleOnMutate<T>(
  queryClient: QueryClient,
  queryKey: string[],
  optimisticUpdateCallback?: (oldData: T[]) => T[]
): Promise<{ previousData: T[] }> {
  // Cancel any outgoing query for the queryKey
  await queryClient.cancelQueries({ queryKey });
  // Get the previous data for the queryKey
  const previousData = queryClient.getQueryData<T[]>(queryKey) || [];
  // Perform the optimistic update with the provided callback
  if (optimisticUpdateCallback) {
    queryClient.setQueryData(queryKey, (oldData: T[]) =>
      optimisticUpdateCallback(oldData)
    );
  }
  // Return the previous data for potential rollback
  return { previousData };
}

// Handles optimistic update
export function optimisticUpdateAddMovieToPlaylist(
  playlistId: string,
  movie: Movie,
  oldData: Playlist[]
) {
  const updatedPlaylists = [...oldData];
  const targetPlaylist = updatedPlaylists.find((pl) => pl.id === playlistId);
  if (targetPlaylist) {
    targetPlaylist.items.push({
      movie_id: String(movie.id),
      title: movie.title,
      poster_url: movie.poster_url ?? "",
      added_at: String(Date.now()),
    });
  }
  return updatedPlaylists;
}

// Creates and adds a pending mutation to AsyncStorage
export async function addPendingMutation<T>(mutationKey: string, data: T) {
  const pendingMutation: PendingMutation = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    mutationKey,
    data,
    timestamp: Date.now(),
  };
  await MutationStorage.add(pendingMutation);
}
