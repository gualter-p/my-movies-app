import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Movie } from "../../types/Movie";
import { Queries } from "../../constants/query";
import { Playlist } from "../../types/Playlist";
import {
  addPendingMutation,
  handleOnMutate,
  optimisticUpdateAddMovieToPlaylist,
} from "./helpers";
import { Mutations } from "../../constants/mutation";
import { addMovieToPlaylist, createPlaylist } from "./playlists";

export function useMutateCreatePlaylistUsingStorage() {
  const queryClient = useQueryClient();

  return useMutation({
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
        await addPendingMutation(Mutations.CREATE_PLAYLIST, {
          name,
          description,
        });
        const { previousData: previousPlaylists } = await handleOnMutate(
          queryClient,
          [Queries.USER_PLAYLISTS]
        );
        return { previousPlaylists };
      }
    },
    onError: (_, __, context) => {
      // Roll back on error
      if (context?.previousPlaylists) {
        queryClient.setQueryData(
          [Queries.USER_PLAYLISTS],
          context.previousPlaylists
        );
      }
    },
  });
}

export function useMutateAddMovieToPlaylistUsingStorage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, movie }: { playlistId: string; movie: Movie }) =>
      addMovieToPlaylist(playlistId, movie),
    onMutate: async ({
      playlistId,
      movie,
    }: {
      playlistId: string;
      movie: Movie;
    }) => {
      // If we're offline we need to add the mutation to the queue
      if (!navigator.onLine) {
        await addPendingMutation(Mutations.ADD_MOVIE_TO_PLAYLIST, {
          playlistId,
          movie,
        });
        const { previousData: previousPlaylists } = await handleOnMutate(
          queryClient,
          [Queries.USER_PLAYLISTS],
          (oldData: Playlist[]) =>
            optimisticUpdateAddMovieToPlaylist(playlistId, movie, oldData)
        );
        return { previousPlaylists };
      }
    },
    onError: (_, __, context) => {
      // Roll back on error
      if (context?.previousPlaylists) {
        queryClient.setQueryData(
          [Queries.USER_PLAYLISTS],
          context.previousPlaylists
        );
      }
    },
  });
}
