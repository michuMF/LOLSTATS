import { z } from "zod";
import { TeamSchema, BanSchema, ObjectivesSchema } from "../../schemas/matchSchemas";

// Inferencja typów z Zod
export type Team = z.infer<typeof TeamSchema>;
export type Ban = z.infer<typeof BanSchema>;
export type Objectives = z.infer<typeof ObjectivesSchema>;
