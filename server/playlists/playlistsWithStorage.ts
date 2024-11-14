import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMovieToPlaylist, createPlaylist } from "./playlists";
import { Movie } from "../../types/Movie";
import { MutationStorage, PendingMutation } from "../../lib/mutationStorage";
import { Mutations } from "../../constants/mutation";
import { Queries } from "../../constants/query";
import { Playlist } from "../../types/Playlist";
import { handleOnMutate, optimisticUpdateAddMovieToPlaylist } from "./helpers";

export function useMutateCreatePlaylistUsingStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [Mutations.CREATE_PLAYLIST],
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => createPlaylist(name, description),
    onMutate: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      // If we're offline we need to add the mutation to the queue
      if (!navigator.onLine) {
        const pendingMutation: PendingMutation = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          mutationKey: Mutations.CREATE_PLAYLIST,
          data: { name, description },
          timestamp: Date.now(),
        };
        await MutationStorage.add(pendingMutation);

        const { previousData: previousPlaylists } = await handleOnMutate(
          queryClient,
          [Queries.USER_PLAYLISTS]
        );

        return { previousPlaylists };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Queries.USER_PLAYLISTS] });
    },
  });
}

export function useMutateAddMovieToPlaylistUsingStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, movie }: { playlistId: string; movie: Movie }) =>
      addMovieToPlaylist(playlistId, movie),
    retry: 0,
    onMutate: async ({
      playlistId,
      movie,
    }: {
      playlistId: string;
      movie: Movie;
    }) => {
      // If we're offline we need to add the mutation to the queue
      if (!navigator.onLine) {
        const pendingMutation: PendingMutation = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          mutationKey: Mutations.ADD_MOVIE_TO_PLAYLIST,
          data: { playlistId, movie },
          timestamp: Date.now(),
        };
        await MutationStorage.add(pendingMutation);

        const { previousData: previousPlaylists } = await handleOnMutate(
          queryClient,
          [Queries.USER_PLAYLISTS],
          (oldData: Playlist[]) =>
            optimisticUpdateAddMovieToPlaylist(playlistId, movie, oldData)
        );

        return { previousPlaylists };
      }
    },
    onSuccess: () => {
      MutationStorage.clear();
      queryClient.invalidateQueries({ queryKey: [Queries.USER_PLAYLISTS] });
    },
  });
}
