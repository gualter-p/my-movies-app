import { QueryClient } from "@tanstack/react-query";
import { MutationStorage } from "../lib/mutationStorage";
import {
  addMovieToPlaylist,
  createPlaylist,
} from "../server/playlists/playlists";
import { Mutations } from "../constants/mutation";
import { Queries } from "../constants/query";

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
