import { Mutations } from "../constants/mutation";

export type PendingMutation = {
  id: string;
  mutationKey: Mutations;
  data: any;
  timestamp: number;
};
