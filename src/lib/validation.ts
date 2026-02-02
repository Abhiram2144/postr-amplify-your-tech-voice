import { z } from "zod";

// Valid enum values for onboarding
export const VALID_GOALS = [
  "build_in_public",
  "grow_audience", 
  "repurpose_content",
  "thought_leadership",
] as const;

export const VALID_PLATFORMS = [
  "linkedin",
  "x",
  "threads",
  "reddit",
  "instagram",
  "youtube",
  "tiktok",
] as const;

export const VALID_EXPERIENCE_LEVELS = [
  "student",
  "developer",
  "engineer",
  "founder",
] as const;

// Signup validation schema
export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Full name can only contain letters, spaces, hyphens, apostrophes, and periods"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be less than 72 characters"),
});

// Onboarding validation schema
export const onboardingSchema = z.object({
  primaryGoal: z.enum(VALID_GOALS, {
    errorMap: () => ({ message: "Please select a valid goal" }),
  }),
  platforms: z
    .array(z.enum(VALID_PLATFORMS))
    .min(1, "Please select at least one platform")
    .max(7, "Maximum 7 platforms allowed"),
  experienceLevel: z.enum(VALID_EXPERIENCE_LEVELS, {
    errorMap: () => ({ message: "Please select a valid experience level" }),
  }),
});

export type SignupData = z.infer<typeof signupSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;

// Validation helper functions
export const validateSignup = (data: unknown) => {
  return signupSchema.safeParse(data);
};

export const validateOnboarding = (data: unknown) => {
  return onboardingSchema.safeParse(data);
};
