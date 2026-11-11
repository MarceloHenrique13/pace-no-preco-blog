import { z } from "zod";

export const shoeSchema = z.object({
  rank: z.number().int().positive(),
  name: z.string().min(1),
  brand: z.string().min(1),
  affiliateUrl: z.string().url(),
  image: z.string().min(1),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  bestFor: z.string().min(1),
});

export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug deve ser kebab-case"),
  description: z.string().min(1),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().min(1),
  shoes: z.array(shoeSchema).default([]),
  faq: z.array(faqItemSchema).default([]),
  affiliateDisclosure: z.boolean().default(true),
  draft: z.boolean().default(false),
});

export const weeklyHighlightShoeSchema = z.object({
  rank: z.number().int().min(1).max(5),
  name: z.string().min(1),
  brand: z.string().min(1),
  affiliateUrl: z.string().url(),
  image: z.string().min(1),
  bestFor: z.string().min(1),
});

export const weeklyHighlightsSchema = z.object({
  weekLabel: z.string().min(1),
  updatedAt: z.coerce.date(),
  shoes: z
    .array(weeklyHighlightShoeSchema)
    .length(5, "destaques da semana devem ter exatamente 5 tênis"),
});

export type Shoe = z.infer<typeof shoeSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type WeeklyHighlightShoe = z.infer<typeof weeklyHighlightShoeSchema>;
export type WeeklyHighlights = z.infer<typeof weeklyHighlightsSchema>;
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export type Post = PostFrontmatter & {
  content: string;
  readingTime: string;
};
