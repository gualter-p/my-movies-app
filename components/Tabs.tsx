import { View, StyleSheet } from "react-native";
import useNetworkDetection from "../hooks/useNetworkDetection";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../hooks/useSession";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Account from "../screens/Account";
import Auth from "../screens/Auth";
import NetworkStatusModal from "./NetworkStatusModal";
import { useNotificationPermissions } from "../hooks/useNotificationPermissions";
import MyMovies from "../screens/MyMovies";
import TopMoviesScreen from "../screens/TopMovies";
import SearchMoviesScreen from "../screens/SearchMovies";
import { useNotificationListener } from "../hooks/useNotificationListener";

export function Tabs() {
  const queryClient = useQueryClient();
  const { session } = useSession();
  useNotificationPermissions(session?.user.id);
  useNotificationListener();
  const { modalVisible, setModalVisible, message } =
    useNetworkDetection(queryClient);
  const Tab = createBottomTabNavigator();
  return (
    <View style={styles.container}>
      {session && session.user ? (
        <Tab.Navigator>
          <Tab.Screen name="Top Movies" component={TopMoviesScreen} />
          <Tab.Screen name="Search Movies" component={SearchMoviesScreen} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
