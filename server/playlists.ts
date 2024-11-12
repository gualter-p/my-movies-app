import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Movie } from "../types/Movie";
import { Queries } from "../constants/query";

async function createPlaylist(name: string, description: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase
    .from("playlists")
    .insert([
      {
        name,
        description,
        user_id: user.data.user.id,
      },
    ])
    .select("*");

  if (error) {
    console.error("Error creating playlist:", error);
    return null;
  }

  return data;
}

async function addMovieToPlaylist(playlistId: string, movie: Movie) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase.from("playlist_items").insert([
    {
      playlist_id: playlistId,
      movie_id: movie.id,
      title: movie.title,
      poster_url: movie.poster_url,
    },
  ]);

  if (error) {
    console.error("Error adding movie to playlist:", error);
    return null;
  }

  return data;
}

export async function getUserPlaylists() {
  const { data, error } = await supabase
    .from("playlists")
    .select(
      `
      id,
      name,
      description,
      items:playlist_items (
        movie_id,
        title,
        poster_url,
        added_at
      )
    `
    )
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

  if (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
  return data;
}

export function useMutateCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => createPlaylist(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] });
    },
  });
}

export function useMutateAddMovieToPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, movie }: { playlistId: string; movie: Movie }) =>
      addMovieToPlaylist(playlistId, movie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Queries.USER_PLAYLISTS] });
    },
  });
}
