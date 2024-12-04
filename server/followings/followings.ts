import { supabase } from "../../lib/supabase";

export async function followUser(followedId: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase
    .from("followings")
    .insert([
      {
        follower_id: user.data.user.id,
        followed_id: followedId,
      },
    ])
    .select("*");

  if (error) {
    console.error("Error following user:", error);
    return null;
  }

  return data;
}

export async function unfollowUser(followedId: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase
    .from("followings")
    .delete()
    .eq("follower_id", user.data.user.id)
    .eq("followed_id", followedId);

  if (error) {
    console.error("Error unfollowing user:", error);
    return null;
  }

  return data;
}

export async function getFollowers(userId: string) {
  const { data, error } = await supabase
    .from("followings")
    .select(
      `
      follower_id,
      profiles:profiles!followings_follower_id_fkey (username, avatar_url, push_token)
    `
    )
    .eq("followed_id", userId);

  if (error) {
    console.error("Error fetching followers:", error);
    return [];
  }

  return data;
}

export async function getFollowedUsers() {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    console.error("No authenticated user found");
    return [];
  }

  const { data, error } = await supabase
    .from("followings")
    .select(
      `
      followed_id,
      profiles:profiles!followings_followed_id_fkey (username, avatar_url)
    `
    )
    .eq("follower_id", user.data.user.id);

  if (error) {
    console.error("Error fetching followed users:", error);
    return [];
  }

  return data;
}

export async function getAvailableUsers() {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    console.error("No authenticated user found");
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`id, username, avatar_url`)
    .neq("id", user.data.user.id);

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data;
}
