import { z } from "zod";
import { MatchDetailsSchema, MetadataSchema, InfoSchema } from "../../schemas/matchSchemas";

// Inferencja typów z Zod
export type Match = z.infer<typeof MatchDetailsSchema>;
export type MatchDTO = Match; // Alias
export type MetadataType = z.infer<typeof MetadataSchema>;
export type Info = z.infer<typeof InfoSchema>;
