import { z } from "zod"

export const ServiceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  price: z.string().min(1, "Price is required").max(50),
  category: z.enum(["womens", "mens", "treatments", "bridal"]),
  is_visible: z.boolean().default(true),
  display_order: z.number().int().default(0),
})

export const TeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  position: z.string().min(1, "Position is required").max(100),
  bio: z.string().max(1000).default(""),
  display_order: z.number().int().default(0),
})

export const TestimonialSchema = z.object({
  customer_name: z.string().min(1, "Name is required").max(100),
  review: z.string().min(1, "Review is required").max(2000),
  rating: z.number().int().min(1).max(5),
  source: z.enum(["google", "fresha"]),
  is_visible: z.boolean(),
})

export const BeforeAfterSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
})

export const FAQSchema = z.object({
  question: z.string().min(1, "Question is required").max(500),
  answer: z.string().min(1, "Answer is required").max(2000),
  is_visible: z.boolean(),
})

export const OpeningHoursSchema = z.object({
  open_time: z.string().nullable().optional(),
  close_time: z.string().nullable().optional(),
  is_closed: z.boolean().default(false),
})

export const HolidaySchema = z.object({
  name: z.string().min(1, "Holiday name is required").max(100),
  date: z.string().min(1, "Date is required"),
  is_closed: z.boolean().default(true),
  custom_open_time: z.string().nullable().optional(),
  custom_close_time: z.string().nullable().optional(),
})

export const ContactSchema = z.object({
  business_name: z.string().min(1, "Business name is required").max(200),
  phone: z.string().max(30).default(""),
  email: z.string().email("Invalid email").or(z.literal("")).default(""),
  address_line_1: z.string().max(200).default(""),
  city_state_zip: z.string().max(200).default(""),
  google_maps_url: z.string().url("Invalid URL").or(z.literal("")).default(""),
  booking_url: z.string().url("Invalid URL").or(z.literal("")).default(""),
})

export const SocialMediaSchema = z.object({
  url: z.string().url("Invalid URL").or(z.literal("")).default(""),
  is_enabled: z.boolean().default(true),
})

export const PortfolioImageSchema = z.object({
  alt: z.string().max(200).default(""),
  title: z.string().max(200).default(""),
  category: z.enum(["women", "men", "both"]),
  featured: z.boolean().default(false),
})

export const LoginSchema = z.object({
  // Accepts a bare username too — normalised to an email by toLoginEmail().
  email: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const AdminUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(64)
    .regex(
      /^[a-zA-Z0-9._+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?$/,
      "Use letters, numbers, dots, dashes or a full email address"
    ),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
})

export type ServiceFormData = z.infer<typeof ServiceSchema>
export type TeamMemberFormData = z.infer<typeof TeamMemberSchema>
export type TestimonialFormData = z.infer<typeof TestimonialSchema>
export type BeforeAfterFormData = z.infer<typeof BeforeAfterSchema>
export type FAQFormData = z.infer<typeof FAQSchema>
export type OpeningHoursFormData = z.infer<typeof OpeningHoursSchema>
export type HolidayFormData = z.infer<typeof HolidaySchema>
export type ContactFormData = z.infer<typeof ContactSchema>
export type SocialMediaFormData = z.infer<typeof SocialMediaSchema>
export type PortfolioImageFormData = z.infer<typeof PortfolioImageSchema>
export type LoginFormData = z.infer<typeof LoginSchema>
export type AdminUserFormData = z.infer<typeof AdminUserSchema>
