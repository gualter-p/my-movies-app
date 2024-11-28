import AsyncStorage from "@react-native-async-storage/async-storage";
import { PendingMutation } from "../types/Mutation";
import { PENDING_MUTATIONS_KEY } from "../constants/mutation";

export const MutationStorage = {
  async add(mutation: PendingMutation) {
    try {
      const existing = await AsyncStorage.getItem(PENDING_MUTATIONS_KEY);
      const mutations = existing ? JSON.parse(existing) : [];
      mutations.push(mutation);
      await AsyncStorage.setItem(
        PENDING_MUTATIONS_KEY,
        JSON.stringify(mutations)
      );
    } catch (error) {
      console.error("Failed to store pending mutation:", error);
    }
  },

  async get(): Promise<PendingMutation[]> {
    try {
      const mutations = await AsyncStorage.getItem(PENDING_MUTATIONS_KEY);
      return mutations ? JSON.parse(mutations) : [];
    } catch (error) {
      console.error("Failed to get pending mutations:", error);
      return [];
    }
  },

  async remove(mutationId: string) {
    try {
      const mutations = await this.get();
      const filtered = mutations.filter((m) => m.id !== mutationId);
      await AsyncStorage.setItem(
        PENDING_MUTATIONS_KEY,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Failed to remove mutation:", error);
    }
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(PENDING_MUTATIONS_KEY);
    } catch (error) {
      console.error("Failed to clear mutations:", error);
    }
  },
};
