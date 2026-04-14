import { httpClient } from "@/services/httpClient";
import {
  walletsResponseSchema,
  type WalletsResponseSchema,
} from "@/schemas/wallet";

export const walletApi = {
  async getBalances(): Promise<WalletsResponseSchema> {
    const raw = await httpClient.get<WalletsResponseSchema>("/balances");
    return walletsResponseSchema.parse(raw);
  },
};
