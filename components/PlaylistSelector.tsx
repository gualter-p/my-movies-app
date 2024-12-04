import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import NetInfo from "@react-native-community/netinfo";
import {
  getUserPlaylists,
  useMutateAddMovieToPlaylist,
  useMutateCreatePlaylist,
} from "../server/playlists/playlists";
// import {
//   useMutateAddMovieToPlaylistUsingStorage,
//   useMutateCreatePlaylistUsingStorage,
// } from "../server/playlists/playlistsWithStorage";
import { Playlist, PlaylistModalProps } from "../types/Playlist";
import { useQuery } from "@tanstack/react-query";
import { Queries } from "../constants/query";
import { getFollowers } from "../server/followings/followings";
import { useSession } from "../hooks/useSession";
import { sendPushNotification } from "../utils/pushnotification";

export default function PlaylistSelector({
  visible,
  onClose,
  movie,
}: PlaylistModalProps) {
  const { session } = useSession();
  const [newPlaylistName, setNewPlaylistName] = useState<string | null>(null);
  const [newPlaylistDescription, setNewPlaylistDescription] = useState<
    string | null
  >(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const { mutate: addToPlaylist } = useMutateAddMovieToPlaylist();
  const { mutate: createAndAddToPlaylist } = useMutateCreatePlaylist();

  const { data: playlists = [], isLoading } = useQuery<Playlist[]>({
    queryKey: [Queries.USER_PLAYLISTS],
    queryFn: getUserPlaylists,
    enabled: visible,
  });

  const cleanUp = () => {
    onClose();
    setNewPlaylistName(null);
    setNewPlaylistDescription(null);
    setSelectedPlaylist(null);
  };

  const handleAddButtonPress = async () => {
    if (!movie) return;

    const connection = await NetInfo.fetch();
    if (!connection.isConnected) {
      // toast.error(
      //   "The device is offline! Adding the movie to the playlist will be attempted when connection is reestablished."
      // );
      cleanUp();
    }

    if (selectedPlaylist) {
      addToPlaylist(
        { playlistId: selectedPlaylist, movie },
        {
          onSuccess: async () => {
            const followers = await getFollowers(session?.user.id || "");

            if (followers.length > 0) {
              followers.forEach((follower) => {
                const message = `${session?.user.id} just added "${movie.title}" to their playlist!`;
                sendPushNotification(follower.profiles.push_token, message);
              });
            }

            cleanUp();
          },
        }
      );
    } else {
      createAndAddToPlaylist(
        {
          name: newPlaylistName ?? "New Playlist",
          description:
            newPlaylistDescription ??
            "This is a new playlist created automatically.",
        },
        {
          onSuccess: (newPlaylist) => {
            if (newPlaylist && newPlaylist[0]?.id) {
              addToPlaylist({ playlistId: newPlaylist[0].id, movie });
            }
            cleanUp();
          },
        }
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Playlist</Text>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <DropDownPicker
              open={open}
              value={selectedPlaylist}
              items={playlists.map((playlist) => ({
                label: playlist.name,
                value: playlist.id,
              }))}
              setValue={setSelectedPlaylist}
              placeholder="Select a playlist"
              containerStyle={styles.dropdownContainer}
              style={styles.dropdown}
              multiple={false}
              setOpen={setOpen}
            />
          )}
          <Text style={styles.sectionTitle}>Create New Playlist</Text>
          <TextInput
            style={styles.input}
            placeholder="Playlist Name"
            value={newPlaylistName ?? ""}
            onChangeText={setNewPlaylistName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newPlaylistDescription ?? ""}
            onChangeText={setNewPlaylistDescription}
          />
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleAddButtonPress}
          >
            <Text style={styles.createButtonText}>Add to Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        {/* <Toaster /> */}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    width: "80%",
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  createButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  createButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    textAlign: "center",
  },
  dropdownContainer: {
    marginBottom: 10,
    height: 40,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  playlistItem: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  playlistName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  playlistDescription: {
    fontSize: 12,
    color: "#666",
  },
});
