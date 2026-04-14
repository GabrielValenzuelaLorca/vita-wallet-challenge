import { z } from "zod";
import { apiEnvelopeSchema } from "./common";

export const priceEntrySchema = z.record(z.string(), z.string());

export const pricesDataSchema = z.record(z.string(), priceEntrySchema);

export const pricesResponseSchema = apiEnvelopeSchema(pricesDataSchema);

export type PriceEntry = z.infer<typeof priceEntrySchema>;
export type PricesData = z.infer<typeof pricesDataSchema>;
export type PricesResponseSchema = z.infer<typeof pricesResponseSchema>;
