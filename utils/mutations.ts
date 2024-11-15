import { QueryClient } from "@tanstack/react-query";
import { MutationStorage } from "../lib/mutationStorage";
import {
  addMovieToPlaylist,
  createPlaylist,
  getUserPlaylists,
} from "../server/playlists/playlists";
import { Mutations } from "../constants/mutation";
import { Queries } from "../constants/query";
import { AddToPlaylistMutationPayload } from "../types/Playlist";

export async function processPendingMutations(queryClient: QueryClient) {
  const mutations = await MutationStorage.get();
  console.log("Mutations to process:", mutations);

  // Process mutations concurrently
  await Promise.all(
    mutations.map(async (mutation) => {
      try {
        switch (mutation.mutationKey) {
          case Mutations.ADD_MOVIE_TO_PLAYLIST:
            await addMovieToPlaylist(
              mutation.data.playlistId,
              mutation.data.movie
            );
            await MutationStorage.remove(mutation.id);
            break;
          case Mutations.CREATE_PLAYLIST:
            await createPlaylist(mutation.data.name, mutation.data.description);
            await MutationStorage.remove(mutation.id);
            break;
          default:
            console.log("Unhandled mutation key:", mutation.mutationKey);
        }
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
  const playlists = await getUserPlaylists();

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

      const hasConflict = playlists.some(
        (playlist) =>
          playlist.id === playlistId &&
          playlist.items.some((item) => item.movie_id === movie.id)
      );

      if (hasConflict) {
        mutationCache.remove(mutation);
        console.log(
          `Skipped mutation: Movie "${movie.title}" is already in playlist "${playlistId}"`
        );
      }
    }
  });

  return pendingMutations;
}
