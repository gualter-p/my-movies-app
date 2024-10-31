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

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

export default function App() {
  const { session } = useSession();

  useReactQueryDevTools(queryClient);

  // Not using Expo Router (opinion: prefer file based to file system based routing)
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <View style={styles.container}>
          {session && session.user ? (
            <Tab.Navigator>
              <Tab.Screen name="Top Movies" component={TopMoviesScreen} />
              <Tab.Screen name="Search Movies" component={SearchMoviesScreen} />
              <Tab.Screen name="Account">
                {() => <Account session={session} />}
              </Tab.Screen>
            </Tab.Navigator>
          ) : (
            <Auth />
          )}
        </View>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
