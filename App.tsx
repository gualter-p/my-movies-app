import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QueryClient } from "@tanstack/react-query";
import { View, StyleSheet } from "react-native";
import Auth from "./screens/Auth";
import Account from "./screens/Account";
import TopMoviesScreen from "./screens/TopMovies";
import SearchMoviesScreen from "./screens/SearchMovies";
import { useSession } from "./hooks/useSession";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  persistQueryClient,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import useNetworkDetection from "./hooks/useNetworkDetection";
import AuthGuard from "./screens/AuthGuard";
import NetworkStatusModal from "./components/NetworkStatusModal";
import MyMovies from "./screens/MyMovies";
import { Toaster, toast } from "react-hot-toast";
import {
  addMovieToPlaylist,
  createPlaylist,
} from "./server/playlists/playlists";
import { Mutations } from "./constants/mutation";
import { Movie } from "./types/Movie";

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// If using tanstack-query to handle persisting offline mutations, we need to setMutationDefaults
// More on this here: https://tanstack.com/query/latest/docs/framework/react/guides/mutations#persisting-offline-mutations
queryClient.setMutationDefaults([Mutations.ADD_MOVIE_TO_PLAYLIST], {
  mutationFn: ({ playlistId, movie }: { playlistId: string; movie: Movie }) => {
    console.log("HERE", playlistId, movie.id);
    return addMovieToPlaylist(playlistId, movie);
  },
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
  const { session } = useSession();

  useReactQueryDevTools(queryClient);

  const { modalVisible, setModalVisible, message } =
    useNetworkDetection(queryClient);

  // Not using Expo Router (opinion: prefer file based to file system based routing)
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24,
      }}
      onSuccess={() => {
        console.log("PersistQueryClientProvider.onSuccess");
        queryClient
          .resumePausedMutations()
          .then(() => queryClient.invalidateQueries());
      }}
    >
      <NavigationContainer>
        <AuthGuard>
          <View style={styles.container}>
            {session && session.user ? (
              <Tab.Navigator>
                <Tab.Screen name="Top Movies" component={TopMoviesScreen} />
                <Tab.Screen
                  name="Search Movies"
                  component={SearchMoviesScreen}
                />
                <Tab.Screen name="My Movies" component={MyMovies} />
                <Tab.Screen name="Account">
                  {() => <Account session={session} />}
                </Tab.Screen>
              </Tab.Navigator>
            ) : (
              <Auth />
            )}
            <NetworkStatusModal
              isVisible={modalVisible}
              message={message}
              onClose={() => setModalVisible(false)}
            />
          </View>
        </AuthGuard>
      </NavigationContainer>
      <Toaster />
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
