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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
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
  "sporta_campaign_created",
  "sporta_content_aggregated",
  "emailos_campaign_created",
  "emailos_campaign_scheduled",
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

// ─── SPORTA – AI Agentic Social Media Aggregator ─────────────────────────────

export const SPORTA_INDUSTRIES = [
  "Fashion", "Cars", "Agriculture", "Technology", "Crypto", "Sports",
  "Politics", "Entertainment", "Church", "Business", "Ecommerce",
  "Real Estate", "Motivation", "Luxury", "Education", "Gaming", "AI",
  "Finance", "Health", "Travel", "Food", "Beauty", "Podcasts", "News", "Custom",
] as const;
export type SportaIndustry = (typeof SPORTA_INDUSTRIES)[number];

export const SPORTA_CONTENT_TYPES = [
  "Videos", "Shorts", "Reels", "Articles", "Threads", "Podcasts",
  "Memes", "Images", "Quotes", "Tutorials", "Reviews",
] as const;
export type SportaContentType = (typeof SPORTA_CONTENT_TYPES)[number];

export const SPORTA_PLATFORMS = [
  "Facebook", "Instagram", "X/Twitter", "TikTok", "YouTube", "Reddit",
  "LinkedIn", "Pinterest", "Threads", "Telegram", "RSS", "Medium",
  "Dev.to", "Vimeo", "Dailymotion",
] as const;
export type SportaPlatform = (typeof SPORTA_PLATFORMS)[number];

export const SPORTA_PUBLISHING_DESTINATIONS = [
  "Facebook", "Instagram", "TikTok", "X", "LinkedIn", "Pinterest",
  "YouTube Community", "Telegram", "Website Blog", "Website Vlog",
] as const;
export type SportaPublishingDestination = (typeof SPORTA_PUBLISHING_DESTINATIONS)[number];

export const SPORTA_AI_MODES = [
  "Light Rewrite", "Full Rewrite", "Summary", "Expand", "Social Caption",
  "Blog Article", "Newsletter", "Thread", "SEO Optimized", "Viral Optimized",
] as const;
export type SportaAiMode = (typeof SPORTA_AI_MODES)[number];

export const SPORTA_APPROVAL_MODES = [
  "fully_automatic", "semi_automatic", "manual",
] as const;
export type SportaApprovalMode = (typeof SPORTA_APPROVAL_MODES)[number];

export const SPORTA_CAMPAIGN_STATUSES = [
  "draft", "active", "paused", "completed", "stopped",
] as const;
export type SportaCampaignStatus = (typeof SPORTA_CAMPAIGN_STATUSES)[number];

export const SPORTA_CONTENT_STATUSES = [
  "pending", "approved", "rejected", "published", "failed",
] as const;
export type SportaContentStatus = (typeof SPORTA_CONTENT_STATUSES)[number];

export const insertSportaCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  industry: z.enum(SPORTA_INDUSTRIES),
  contentTypes: z.array(z.enum(SPORTA_CONTENT_TYPES)).min(1),
  sourcePlatforms: z.array(z.enum(SPORTA_PLATFORMS)).min(1),
  publishingDestinations: z.array(z.enum(SPORTA_PUBLISHING_DESTINATIONS)).min(1),
  aiMode: z.enum(SPORTA_AI_MODES),
  approvalMode: z.enum(SPORTA_APPROVAL_MODES),
  timelinePreference: z.string().min(1),
  postingFrequency: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  bannedKeywords: z.array(z.string()).default([]),
  hashtags: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(["English"]),
  tone: z.string().default("professional"),
  audience: z.string().default("general"),
  enableSeo: z.boolean().default(true),
  enableViral: z.boolean().default(false),
  enableNsfwFilter: z.boolean().default(true),
  enableDuplicateFilter: z.boolean().default(true),
  minEngagement: z.number().int().default(0),
  creatorId: z.string().min(1),
});

export type InsertSportaCampaign = z.infer<typeof insertSportaCampaignSchema>;

export interface SportaCampaign {
  id: string;
  name: string;
  industry: SportaIndustry;
  contentTypes: SportaContentType[];
  sourcePlatforms: SportaPlatform[];
  publishingDestinations: SportaPublishingDestination[];
  aiMode: SportaAiMode;
  approvalMode: SportaApprovalMode;
  timelinePreference: string;
  postingFrequency: string;
  keywords: string[];
  bannedKeywords: string[];
  hashtags: string[];
  languages: string[];
  tone: string;
  audience: string;
  enableSeo: boolean;
  enableViral: boolean;
  enableNsfwFilter: boolean;
  enableDuplicateFilter: boolean;
  minEngagement: number;
  status: SportaCampaignStatus;
  creatorId: string;
  postsAggregated: number;
  postsPublished: number;
  postsRejected: number;
  createdAt: Date;
  updatedAt: Date;
}

export const insertSportaContentSchema = z.object({
  campaignId: z.string().min(1),
  sourceUrl: z.string().url(),
  sourcePlatform: z.enum(SPORTA_PLATFORMS),
  originalTitle: z.string().max(500).optional(),
  originalContent: z.string().optional(),
  originalAuthor: z.string().max(200).optional(),
  originalThumbnail: z.string().url().optional().nullable(),
  mediaType: z.enum(SPORTA_CONTENT_TYPES),
  embedCode: z.string().optional(),
  aiRewrittenTitle: z.string().max(500).optional(),
  aiRewrittenContent: z.string().optional(),
  aiGeneratedHashtags: z.array(z.string()).default([]),
  aiQualityScore: z.number().min(0).max(100).optional(),
  aiViralScore: z.number().min(0).max(100).optional(),
  aiEngagementPrediction: z.number().min(0).max(100).optional(),
  aiConfidenceScore: z.number().min(0).max(100).optional(),
});

export type InsertSportaContent = z.infer<typeof insertSportaContentSchema>;

export interface SportaContent {
  id: string;
  campaignId: string;
  sourceUrl: string;
  sourcePlatform: SportaPlatform;
  originalTitle?: string;
  originalContent?: string;
  originalAuthor?: string;
  originalThumbnail?: string | null;
  mediaType: SportaContentType;
  embedCode?: string;
  aiRewrittenTitle?: string;
  aiRewrittenContent?: string;
  aiGeneratedHashtags: string[];
  aiQualityScore?: number;
  aiViralScore?: number;
  aiEngagementPrediction?: number;
  aiConfidenceScore?: number;
  status: SportaContentStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Vlog Posts ───────────────────────────────────────────────────────────────

export const VLOG_EMBED_PLATFORMS = [
  "YouTube", "TikTok", "Vimeo", "Instagram", "Facebook", "Dailymotion",
] as const;
export type VlogEmbedPlatform = (typeof VLOG_EMBED_PLATFORMS)[number];

export const insertVlogPostSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  description: z.string().min(1),
  embedUrl: z.string().url(),
  embedPlatform: z.enum(VLOG_EMBED_PLATFORMS),
  thumbnail: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  category: z.string().min(1),
  seoTitle: z.string().max(160).optional(),
  seoDescription: z.string().max(320).optional(),
  published: z.boolean().default(false),
  authorId: z.string().min(1),
  authorName: z.string().min(1),
  sourceContentId: z.string().optional(), // ref to SportaContent._id
  campaignId: z.string().optional(),       // ref to SportaCampaign._id
});

export const updateVlogPostSchema = insertVlogPostSchema.partial();

export type InsertVlogPost = z.infer<typeof insertVlogPostSchema>;
export type UpdateVlogPost = z.infer<typeof updateVlogPostSchema>;

export interface VlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  embedUrl: string;
  embedPlatform: VlogEmbedPlatform;
  thumbnail: string | null;
  tags: string[];
  category: string;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  authorId: string;
  authorName: string;
  sourceContentId?: string;
  campaignId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const AUDIT_ACTIONS = [
  "speed_cracker.campaign.create",
  "speed_cracker.campaign.update",
  "speed_cracker.campaign.delete",
  "speed_cracker.campaign.launch",
  "speed_cracker.campaign.pause",
  "speed_cracker.content.approve",
  "speed_cracker.content.reject",
  "speed_cracker.content.publish",
  "speed_cracker.content.bulk_approve",
  "speed_cracker.content.bulk_reject",
  "speed_cracker.vlog.create",
  "speed_cracker.vlog.update",
  "speed_cracker.vlog.delete",
  "speed_cracker.vlog.publish",
  "speed_cracker.blog.publish",
  "speed_cracker.settings.update",
  "admin.user.role_change",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: AuditAction;
  targetId?: string;
  targetType?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

export const insertAuditLogSchema = z.object({
  adminId: z.string().min(1),
  adminName: z.string().min(1),
  action: z.enum(AUDIT_ACTIONS),
  targetId: z.string().optional(),
  targetType: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export const insertSportaPreferencesSchema = z.object({
  userId: z.string().min(1),
  defaultTone: z.string().default("professional"),
  defaultAudience: z.string().default("general"),
  preferShortCaptions: z.boolean().default(false),
  preferViralContent: z.boolean().default(false),
  preferEducationalContent: z.boolean().default(false),
  avoidPolitics: z.boolean().default(false),
  preferredLanguages: z.array(z.string()).default(["English"]),
  preferredHashtags: z.array(z.string()).default([]),
  preferredCta: z.string().default("Learn More"),
  preferredPostingHours: z.array(z.number()).default([9, 12, 17, 20]),
  preserveOriginalMeaning: z.boolean().default(true),
  rewritingAggressiveness: z.number().min(1).max(10).default(5),
  generateEmojis: z.boolean().default(true),
  seoOptimize: z.boolean().default(true),
  humanizeContent: z.boolean().default(true),
  preferredAudienceAge: z.string().default("18-35"),
});

export type InsertSportaPreferences = z.infer<typeof insertSportaPreferencesSchema>;

export interface SportaPreferences {
  id: string;
  userId: string;
  defaultTone: string;
  defaultAudience: string;
  preferShortCaptions: boolean;
  preferViralContent: boolean;
  preferEducationalContent: boolean;
  avoidPolitics: boolean;
  preferredLanguages: string[];
  preferredHashtags: string[];
  preferredCta: string;
  preferredPostingHours: number[];
  preserveOriginalMeaning: boolean;
  rewritingAggressiveness: number;
  generateEmojis: boolean;
  seoOptimize: boolean;
  humanizeContent: boolean;
  preferredAudienceAge: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Daily Dev Tips Bot ───────────────────────────────────────────────────────

export const DEV_TIPS_PILLARS = [
  "code-snippet",
  "architecture",
  "devops",
  "performance",
  "security",
  "tool-discovery",
  "career-mindset",
  "frontend",
  "api-design",
] as const;
export type DevTipsPillar = (typeof DEV_TIPS_PILLARS)[number];

export const DEV_TIPS_PILLAR_LABELS: Record<DevTipsPillar, string> = {
  "code-snippet":   "Code Snippet of the Day",
  "architecture":   "Architecture Insight",
  "devops":         "DevOps & CI/CD",
  "performance":    "Performance Hack",
  "security":       "Security Spotlight",
  "tool-discovery": "Tool Discovery",
  "career-mindset": "Career & Mindset",
  "frontend":       "Frontend & CSS Mastery",
  "api-design":     "API Design",
};

export const DEV_TIPS_FORMATS = [
  "plain-text",
  "code-card",
  "infographic",
  "thread",
] as const;
export type DevTipsFormat = (typeof DEV_TIPS_FORMATS)[number];

export const DEV_TIPS_PLATFORMS = [
  "twitter",
  "linkedin",
  "instagram",
  "threads",
] as const;
export type DevTipsPlatform = (typeof DEV_TIPS_PLATFORMS)[number];

export const DEV_TIPS_POST_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "published",
  "failed",
] as const;
export type DevTipsPostStatus = (typeof DEV_TIPS_POST_STATUSES)[number];

export interface DevTipsPost {
  id: string;
  pillar: DevTipsPillar;
  format: DevTipsFormat;
  title: string;
  caption: string;
  thread: string[];
  hashtags: string[];
  svgCard?: string;
  htmlCard?: string;
  status: DevTipsPostStatus;
  platforms: DevTipsPlatform[];
  publishedPlatforms: DevTipsPlatform[];
  scheduledAt?: Date;
  publishedAt?: Date;
  errorLog?: string;
  generatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevTipsSocialAccount {
  platform: DevTipsPlatform;
  enabled: boolean;
  /** OAuth access token or API key — stored in DB (admin-controlled) */
  accessToken?: string;
  /** OAuth refresh token */
  refreshToken?: string;
  /** Extra: LinkedIn org URN, Instagram business account ID, etc. */
  accountId?: string;
  /** Human-readable label shown in UI */
  displayName?: string;
  connectedAt?: Date;
}

export interface DevTipsBotConfig {
  id: string;
  /** Whether the bot scheduler is active */
  running: boolean;
  /** Whether the scheduler is paused (running but not firing cycles) */
  paused: boolean;
  /** Interval in milliseconds between posting cycles */
  postIntervalMs: number;
  /** Formats allowed for generation */
  allowedFormats: DevTipsFormat[];
  /** Platforms to post to by default */
  defaultPlatforms: DevTipsPlatform[];
  /** Pillar weights — determines how often each pillar is picked */
  pillarWeights: Record<DevTipsPillar, number>;
  /** Social account credentials */
  socialAccounts: DevTipsSocialAccount[];
  /** Auto-publish without approval */
  autoPublish: boolean;
  /** Gemini AI tone for generation */
  tone: string;
  /** Target developer seniority/audience */
  audience: string;
  /** Index of the last used pillar for round-robin rotation */
  lastPillarIndex: number;
  /** Total posts generated */
  totalGenerated: number;
  /** Total posts published */
  totalPublished: number;
  createdAt: Date;
  updatedAt: Date;
}
