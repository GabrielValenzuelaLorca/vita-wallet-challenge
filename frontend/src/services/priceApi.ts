import { httpClient } from "@/services/httpClient";
import {
  pricesResponseSchema,
  type PricesResponseSchema,
} from "@/schemas/price";

export const priceApi = {
  async getPrices(): Promise<PricesResponseSchema> {
    const raw = await httpClient.get<PricesResponseSchema>("/prices");
    return pricesResponseSchema.parse(raw);
  },
};
