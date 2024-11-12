import { Movie } from "./Movie";

export type Playlist = {
  id: string;
  name: string;
  description: string;
  items: Array<{
    movie_id: string;
    title: string;
    poster_url: string;
    added_at: string;
  }>;
};

export type PlaylistModalProps = {
  visible: boolean;
  onClose: () => void;
  movie: Movie | null;
};
