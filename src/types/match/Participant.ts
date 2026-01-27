import { z } from "zod";
import {
  ParticipantSchema,
  PerksSchema,
  PerkStyleSchema,
  StatPerksSchema,
} from "../../schemas/matchSchemas";

// Inferencja typów z Zod
export type ParticipantType = z.infer<typeof ParticipantSchema>;
export type PerksType = z.infer<typeof PerksSchema>;
export type StyleType = z.infer<typeof PerkStyleSchema>;
export type StatPerksType = z.infer<typeof StatPerksSchema>;
