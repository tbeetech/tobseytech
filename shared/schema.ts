import { z } from "zod";

// ─── Users ──────────────────────────────────────────────────────────────────

export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const loginSchema = z.object({
  username: z.string().min(1), // accepts username or email
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  displayName: z.string().max(80).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
  createdAt: Date;
}

// ─── Contacts ───────────────────────────────────────────────────────────────

export const insertContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  projectType: z.string().min(1),
  budgetRange: z.string().min(1),
  message: z.string().min(1),
});

export type InsertContact = z.infer<typeof insertContactSchema>;

export interface Contact {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budgetRange: string;
  message: string;
  status: string;
  createdAt: Date;
}

// ─── Products ───────────────────────────────────────────────────────────────

export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int(),
  status: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  features: z.array(z.string()).default([]),
  category: z.string().min(1),
  isActive: z.boolean().default(true),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  imageUrl: string | null;
  features: string[];
  category: string;
  isActive: boolean;
  createdAt: Date;
}

// ─── Courses ────────────────────────────────────────────────────────────────

export const insertCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int(),
  originalPrice: z.number().int().optional().nullable(),
  duration: z.string().min(1),
  level: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  duration: string;
  level: string;
  category: string;
  imageUrl: string | null;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

// ─── Blog Posts ─────────────────────────────────────────────────────────────

export const insertBlogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImage: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  category: z.string().min(1),
  published: z.boolean().default(false),
  authorId: z.string().min(1),
  authorName: z.string().min(1),
});

export const updateBlogPostSchema = insertBlogPostSchema.partial();

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof updateBlogPostSchema>;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  category: string;
  published: boolean;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export const insertCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
}

// ─── Likes ───────────────────────────────────────────────────────────────────

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

// ─── Edit Suggestions ────────────────────────────────────────────────────────

export const insertEditSuggestionSchema = z.object({
  postId: z.string().min(1),
  suggestedTitle: z.string().max(200).optional(),
  suggestedContent: z.string().max(50000).optional(),
  reason: z.string().min(1).max(1000),
});

export type InsertEditSuggestion = z.infer<typeof insertEditSuggestionSchema>;

export interface EditSuggestion {
  id: string;
  postId: string;
  userId: string;
  username: string;
  suggestedTitle?: string;
  suggestedContent?: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

// ─── Friendships ─────────────────────────────────────────────────────────────

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

// ─── Messages ────────────────────────────────────────────────────────────────

export const insertMessageSchema = z.object({
  recipientId: z.string().min(1),
  content: z.string().min(1).max(5000),
  replyToId: z.string().optional(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  replyToId?: string;
  createdAt: Date;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const NOTIFICATION_TYPES = [
  "friend_request_received",
  "friend_request_accepted",
  "friend_request_declined",
  "post_saved_draft",
  "post_published",
  "post_updated",
  "post_new",
  "chat_message",
  "chat_reply",
  "post_comment",
  "edit_suggestion_received",
  "edit_suggestion_reviewed",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  actorId?: string;
  actorName?: string;
  entityId?: string;
  createdAt: Date;
}

export const insertNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(NOTIFICATION_TYPES),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
  actorId: z.string().optional(),
  actorName: z.string().optional(),
  entityId: z.string().optional(),
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
