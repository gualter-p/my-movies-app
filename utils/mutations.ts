import { QueryClient } from "@tanstack/react-query";
import { MutationStorage } from "../lib/mutationStorage";
import {
  addMovieToPlaylist,
  createPlaylist,
} from "../server/playlists/playlists";
import { Mutations } from "../constants/mutation";
import { Queries } from "../constants/query";
import { AddToPlaylistMutationPayload, Playlist } from "../types/Playlist";
import { PendingMutation } from "../types/Mutation";

const PendingMutations = {
  [Mutations.ADD_MOVIE_TO_PLAYLIST]: async (mutation: PendingMutation) => {
    await addMovieToPlaylist(mutation.data.playlistId, mutation.data.movie);
    await MutationStorage.remove(mutation.id);
  },
  [Mutations.CREATE_PLAYLIST]: async (mutation: PendingMutation) => {
    await createPlaylist(mutation.data.name, mutation.data.description);
    await MutationStorage.remove(mutation.id);
  },
};

export async function processPendingMutations(queryClient: QueryClient) {
  const mutations = await MutationStorage.get();

  // Process mutations concurrently
  await Promise.all(
    mutations.map(async (mutation) => {
      try {
        const mutationHandler = PendingMutations[mutation.mutationKey];
        await mutationHandler?.(mutation);
      } catch (error) {
        console.error("Failed to process mutation:", mutation.id, error);
      }
    })
  );

  // Clear the queue and invalidate the query to see the mutation results
  await MutationStorage.clear();
  queryClient.invalidateQueries({ queryKey: [Queries.USER_PLAYLISTS] });
}

export async function clearConflictingMutations(queryClient: QueryClient) {
  // Fetch the latest playlist data
  const playlists = queryClient.getQueryData<Playlist[]>([
    Queries.USER_PLAYLISTS,
  ]);

  // We get the list of pending mutations
  const mutationCache = queryClient.getMutationCache();
  const pendingMutations = mutationCache.getAll();

  // Now we can remove the conflicting ones
  // In this case, if the movie is already in the playlist, we can ignore the pending mutation
  pendingMutations.forEach((mutation) => {
    const mutationKeyMatches = mutation.options.mutationKey?.includes(
      Mutations.ADD_MOVIE_TO_PLAYLIST
    );
    if (mutationKeyMatches) {
      const { playlistId, movie } = mutation.state
        .variables as AddToPlaylistMutationPayload;

      const hasConflict = playlists?.some(
        (playlist) =>
          playlist.id === playlistId &&
          playlist.items.some((item) => item.movie_id === String(movie.id))
      );

      if (hasConflict) {
        mutationCache.remove(mutation);
        console.log(
          `Skipped mutation: Movie "${movie.title}" is already in playlist "${playlistId}"`
        );
      }
    }
  });
}
