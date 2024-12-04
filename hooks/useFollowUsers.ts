import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAvailableUsers,
  getFollowedUsers,
  followUser,
  unfollowUser,
} from "../server/followings/followings";
import { useCallback } from "react";

export function useFollowUsers() {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["availableUsers"],
    queryFn: getAvailableUsers,
  });

  const {
    data: followedUsers = [],
    isLoading: followedLoading,
    error: followedError,
  } = useQuery({ queryKey: ["followedUsers"], queryFn: getFollowedUsers });

  const followMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followedUsers"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followedUsers"] });
    },
  });

  const handleFollow = useCallback(
    async (userId: string) => {
      await followMutation.mutateAsync(userId);
    },
    [followMutation]
  );

  const handleUnfollow = useCallback(
    async (userId: string) => {
      await unfollowMutation.mutateAsync(userId);
    },
    [unfollowMutation]
  );

  return {
    users,
    followedUsers,
    handleFollow,
    handleUnfollow,
    loading: usersLoading || followedLoading,
    error: usersError || followedError,
  };
}
