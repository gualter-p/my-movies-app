import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, StyleSheet } from "react-native";
import Auth from "./screens/Auth";
import Account from "./screens/Account";
import TopMoviesScreen from "./screens/TopMovies";
import SearchMoviesScreen from "./screens/SearchMovies";
import { useSession } from "./hooks/useSession";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import useNetworkDetection from "./hooks/useNetworkDetection";
import AuthGuard from "./screens/AuthGuard";
import NetworkStatusModal from "./components/NetworkStatusModal";
import MyMovies from "./screens/MyMovies";

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

const asyncStoragePersistor = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersistor,
  maxAge: 1000 * 60 * 60 * 24,
});

export default function App() {
  const { session } = useSession();

  useReactQueryDevTools(queryClient);

  const { modalVisible, setModalVisible, message } = useNetworkDetection();

  // Not using Expo Router (opinion: prefer file based to file system based routing)
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
