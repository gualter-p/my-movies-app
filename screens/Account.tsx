import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Text, FlatList } from "react-native";
import { Button, Input } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { useFollowUsers } from "../hooks/useFollowUsers";

export default function Account({ session }: { session: Session }) {
  const [username, setUsername] = useState<string>("");
  const [website, setWebsite] = useState<string>("");

  const { users, followedUsers, handleFollow, handleUnfollow, loading, error } =
    useFollowUsers();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error fetching users: {error.message}</Text>;
  }

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  async function updateProfile({
    username,
    website,
  }: {
    username: string;
    website: string;
  }) {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        website,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          value={username ?? ""}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Website"
          value={website ?? ""}
          onChangeText={(text) => setWebsite(text)}
        />
      </View>

      {/* Available Users to Follow Section */}
      <Text style={styles.sectionHeader}>Available Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isFollowed = followedUsers.some(
            (followedUser) => followedUser.followed_id === item.id
          );

          return (
            <View style={styles.userItem}>
              <Text style={styles.username}>{item.username}</Text>
              <Button
                title={isFollowed ? "Unfollow" : "Follow"}
                onPress={() =>
                  isFollowed
                    ? handleUnfollow(item.id).catch((err) =>
                        Alert.alert("Error", err.message)
                      )
                    : handleFollow(item.id).catch((err) =>
                        Alert.alert("Error", err.message)
                      )
                }
              />
            </View>
          );
        }}
      />

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  username: {
    fontSize: 16,
  },
});
