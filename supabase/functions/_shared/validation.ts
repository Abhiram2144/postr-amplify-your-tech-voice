import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Valid platforms for content generation
export const VALID_PLATFORMS = [
  "linkedin",
  "instagram", 
  "twitter",
  "youtube",
  "threads",
  "reddit",
] as const;

// Schema for create-checkout
export const checkoutSchema = z.object({
  priceId: z.string()
    .min(1, "Price ID is required")
    .max(100, "Price ID too long")
    .regex(/^price_[a-zA-Z0-9_]+$/, "Invalid price ID format"),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
});

// Schema for generate-content
export const generateContentSchema = z.object({
  mode: z.enum(["brief_topic", "script"]),
  topic: z.string().max(500, "Topic too long").optional(),
  audience: z.string().max(200, "Audience description too long").optional(),
  intent: z.string().max(200, "Intent too long").optional(),
  tone: z.string().max(200, "Tone too long").optional(),
  script_text: z.string().max(10000, "Script too long").optional(),
  platforms: z.array(
    z.string().max(50)
  ).min(1, "At least one platform must be selected").max(6, "Maximum 6 platforms allowed"),
}).refine(
  (data) => {
    if (data.mode === "brief_topic") {
      return !!data.topic && data.topic.trim().length > 0;
    }
    if (data.mode === "script") {
      return !!data.script_text && data.script_text.length >= 50;
    }
    return false;
  },
  { message: "Topic required for brief_topic mode, script_text (min 50 chars) required for script mode" }
);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
