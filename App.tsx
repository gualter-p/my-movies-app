import { NavigationContainer } from "@react-navigation/native";
import { QueryClient } from "@tanstack/react-query";
import { SessionProvider } from "./hooks/useSession";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  persistQueryClient,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AuthGuard from "./screens/AuthGuard";
import {
  addMovieToPlaylist,
  createPlaylist,
} from "./server/playlists/playlists";
import { Mutations } from "./constants/mutation";
import { Movie } from "./types/Movie";
import { Tabs } from "./components/Tabs";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const queryClient = new QueryClient();

// If using tanstack-query to handle persisting offline mutations, we need to setMutationDefaults
// More on this here: https://tanstack.com/query/latest/docs/framework/react/guides/mutations#persisting-offline-mutations
queryClient.setMutationDefaults([Mutations.ADD_MOVIE_TO_PLAYLIST], {
  mutationFn: ({ playlistId, movie }: { playlistId: string; movie: Movie }) =>
    addMovieToPlaylist(playlistId, movie),
});
queryClient.setMutationDefaults([Mutations.CREATE_PLAYLIST], {
  mutationFn: ({ name, description }: { name: string; description: string }) =>
    createPlaylist(name, description),
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24,
});

export default function App() {
  useReactQueryDevTools(queryClient);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24,
      }}
    >
      <SessionProvider>
        <NavigationContainer>
          <AuthGuard>
            <Tabs />
          </AuthGuard>
        </NavigationContainer>
      </SessionProvider>
    </PersistQueryClientProvider>
  );
}
