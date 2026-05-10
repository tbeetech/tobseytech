import type {
  User,
  InsertUser,
  UpdateProfile,
  Contact,
  InsertContact,
  Product,
  InsertProduct,
  Course,
  InsertCourse,
  BlogPost,
  InsertBlogPost,
  UpdateBlogPost,
  Comment,
  InsertComment,
  Like,
  Bookmark,
  EditSuggestion,
  InsertEditSuggestion,
  Friendship,
  Message,
  InsertMessage,
  Notification,
  InsertNotification,
  SportaCampaign,
  InsertSportaCampaign,
  SportaContent,
  InsertSportaContent,
  SportaPreferences,
  InsertSportaPreferences,
  SportaCampaignStatus,
  SportaContentStatus,
  VlogPost,
  InsertVlogPost,
  UpdateVlogPost,
  AuditLog,
  InsertAuditLog,
} from "../shared/schema.js";
import { UserModel } from "./models/User.js";
import { ContactModel } from "./models/Contact.js";
import { ProductModel } from "./models/Product.js";
import { CourseModel } from "./models/Course.js";
import { BlogPostModel } from "./models/BlogPost.js";
import { CommentModel } from "./models/Comment.js";
import { LikeModel } from "./models/Like.js";
import { BookmarkModel } from "./models/Bookmark.js";
import { EditSuggestionModel } from "./models/EditSuggestion.js";
import { FriendshipModel } from "./models/Friendship.js";
import { MessageModel } from "./models/Message.js";
import { NotificationModel } from "./models/Notification.js";
import { ShortUrlModel } from "./models/ShortUrl.js";
import { SportaCampaignModel } from "./models/SportaCampaign.js";
import { SportaContentModel } from "./models/SportaContent.js";
import { SportaPreferencesModel } from "./models/SportaPreferences.js";
import { VlogPostModel } from "./models/VlogPost.js";
import { AuditLogModel } from "./models/AuditLog.js";
import { randomBytes } from "crypto";
import mongoose from "mongoose";

function docToUser(doc: any): User {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    password: doc.password,
    role: doc.role,
    displayName: doc.displayName,
    bio: doc.bio,
    avatarUrl: doc.avatarUrl ?? null,
    createdAt: doc.createdAt,
  };
}

function docToContact(doc: any): Contact {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    projectType: doc.projectType,
    budgetRange: doc.budgetRange,
    message: doc.message,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

function docToProduct(doc: any): Product {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    price: doc.price,
    status: doc.status,
    imageUrl: doc.imageUrl ?? null,
    features: doc.features ?? [],
    category: doc.category,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
  };
}

function docToCourse(doc: any): Course {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    price: doc.price,
    originalPrice: doc.originalPrice ?? null,
    duration: doc.duration,
    level: doc.level,
    category: doc.category,
    imageUrl: doc.imageUrl ?? null,
    features: doc.features ?? [],
    isActive: doc.isActive,
    isFeatured: doc.isFeatured,
    createdAt: doc.createdAt,
  };
}

function docToBlogPost(doc: any): BlogPost {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    content: doc.content,
    coverImage: doc.coverImage ?? null,
    tags: doc.tags ?? [],
    category: doc.category,
    published: doc.published,
    authorId: doc.authorId,
    authorName: doc.authorName,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function docToComment(doc: any): Comment {
  return {
    id: doc._id.toString(),
    postId: doc.postId,
    userId: doc.userId,
    username: doc.username,
    content: doc.content,
    createdAt: doc.createdAt,
  };
}

function docToEditSuggestion(doc: any): EditSuggestion {
  return {
    id: doc._id.toString(),
    postId: doc.postId,
    userId: doc.userId,
    username: doc.username,
    suggestedTitle: doc.suggestedTitle,
    suggestedContent: doc.suggestedContent,
    reason: doc.reason,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

function docToFriendship(doc: any): Friendship {
  return {
    id: doc._id.toString(),
    requesterId: doc.requesterId,
    addresseeId: doc.addresseeId,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

function docToMessage(doc: any): Message {
  return {
    id: doc._id.toString(),
    senderId: doc.senderId,
    recipientId: doc.recipientId,
    content: doc.content,
    read: doc.read,
    ...(doc.replyToId ? { replyToId: doc.replyToId } : {}),
    createdAt: doc.createdAt,
  };
}

function docToNotification(doc: any): Notification {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    link: doc.link ?? undefined,
    read: doc.read,
    actorId: doc.actorId ?? undefined,
    actorName: doc.actorName ?? undefined,
    entityId: doc.entityId ?? undefined,
    createdAt: doc.createdAt,
  };
}

const MAX_NOTIFICATIONS_PER_USER = 50;

function docToSportaCampaign(doc: any): SportaCampaign {
  return {
    id: doc._id.toString(),
    name: doc.name,
    industry: doc.industry,
    contentTypes: doc.contentTypes ?? [],
    sourcePlatforms: doc.sourcePlatforms ?? [],
    publishingDestinations: doc.publishingDestinations ?? [],
    aiMode: doc.aiMode,
    approvalMode: doc.approvalMode,
    timelinePreference: doc.timelinePreference,
    postingFrequency: doc.postingFrequency,
    keywords: doc.keywords ?? [],
    bannedKeywords: doc.bannedKeywords ?? [],
    hashtags: doc.hashtags ?? [],
    languages: doc.languages ?? ["English"],
    tone: doc.tone,
    audience: doc.audience,
    enableSeo: doc.enableSeo,
    enableViral: doc.enableViral,
    enableNsfwFilter: doc.enableNsfwFilter,
    enableDuplicateFilter: doc.enableDuplicateFilter,
    minEngagement: doc.minEngagement ?? 0,
    status: doc.status,
    creatorId: doc.creatorId,
    postsAggregated: doc.postsAggregated ?? 0,
    postsPublished: doc.postsPublished ?? 0,
    postsRejected: doc.postsRejected ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function docToSportaContent(doc: any): SportaContent {
  return {
    id: doc._id.toString(),
    campaignId: doc.campaignId,
    sourceUrl: doc.sourceUrl,
    sourcePlatform: doc.sourcePlatform,
    originalTitle: doc.originalTitle,
    originalContent: doc.originalContent,
    originalAuthor: doc.originalAuthor,
    originalThumbnail: doc.originalThumbnail ?? null,
    mediaType: doc.mediaType,
    embedCode: doc.embedCode,
    aiRewrittenTitle: doc.aiRewrittenTitle,
    aiRewrittenContent: doc.aiRewrittenContent,
    aiGeneratedHashtags: doc.aiGeneratedHashtags ?? [],
    aiQualityScore: doc.aiQualityScore,
    aiViralScore: doc.aiViralScore,
    aiEngagementPrediction: doc.aiEngagementPrediction,
    aiConfidenceScore: doc.aiConfidenceScore,
    status: doc.status,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function docToSportaPreferences(doc: any): SportaPreferences {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    defaultTone: doc.defaultTone,
    defaultAudience: doc.defaultAudience,
    preferShortCaptions: doc.preferShortCaptions,
    preferViralContent: doc.preferViralContent,
    preferEducationalContent: doc.preferEducationalContent,
    avoidPolitics: doc.avoidPolitics,
    preferredLanguages: doc.preferredLanguages ?? ["English"],
    preferredHashtags: doc.preferredHashtags ?? [],
    preferredCta: doc.preferredCta,
    preferredPostingHours: doc.preferredPostingHours ?? [9, 12, 17, 20],
    preserveOriginalMeaning: doc.preserveOriginalMeaning,
    rewritingAggressiveness: doc.rewritingAggressiveness,
    generateEmojis: doc.generateEmojis,
    seoOptimize: doc.seoOptimize,
    humanizeContent: doc.humanizeContent,
    preferredAudienceAge: doc.preferredAudienceAge,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function docToVlogPost(doc: any): VlogPost {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    embedUrl: doc.embedUrl,
    embedPlatform: doc.embedPlatform,
    thumbnail: doc.thumbnail ?? null,
    tags: doc.tags ?? [],
    category: doc.category,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    published: doc.published,
    authorId: doc.authorId,
    authorName: doc.authorName,
    sourceContentId: doc.sourceContentId,
    campaignId: doc.campaignId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function docToAuditLog(doc: any): AuditLog {
  return {
    id: doc._id.toString(),
    adminId: doc.adminId,
    adminName: doc.adminName,
    action: doc.action,
    targetId: doc.targetId,
    targetType: doc.targetType,
    details: doc.details,
    ipAddress: doc.ipAddress,
    createdAt: doc.createdAt,
  };
}

export class MongoStorage {
  // ─── User methods ────────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return undefined;
    }

    const doc = await UserModel.findById(id).lean();
    return doc ? docToUser(doc) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ username }).lean();
    return doc ? docToUser(doc) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    return doc ? docToUser(doc) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const doc = await UserModel.create(insertUser);
    return docToUser(doc.toObject());
  }

  async updateUserProfile(id: string, updates: UpdateProfile): Promise<User | undefined> {
    const doc = await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return doc ? docToUser(doc) : undefined;
  }

  async searchUsers(query: string): Promise<User[]> {
    const regex = new RegExp(query, "i");
    const docs = await UserModel.find({ $or: [{ username: regex }, { displayName: regex }] }).lean();
    return docs.map(docToUser);
  }

  async getAllUsers(): Promise<User[]> {
    const docs = await UserModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(docToUser);
  }

  async updateUserRole(id: string, role: "user" | "admin"): Promise<User | undefined> {
    const doc = await UserModel.findByIdAndUpdate(id, { role }, { new: true }).lean();
    return doc ? docToUser(doc) : undefined;
  }

  async setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { resetToken: token, resetTokenExpiry: expiry });
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).lean();
    return doc ? docToUser(doc) : undefined;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { resetToken: null, resetTokenExpiry: null });
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
  }

  // ─── Contact methods ─────────────────────────────────────────────────────

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const doc = await ContactModel.create({ ...insertContact, status: "new" });
    return docToContact(doc.toObject());
  }

  async getContacts(): Promise<Contact[]> {
    const docs = await ContactModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(docToContact);
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const doc = await ContactModel.findById(id).lean();
    return doc ? docToContact(doc) : undefined;
  }

  async updateContactStatus(id: string, status: string): Promise<Contact | undefined> {
    const doc = await ContactModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    return doc ? docToContact(doc) : undefined;
  }

  // ─── Product methods ──────────────────────────────────────────────────────

  async getProducts(): Promise<Product[]> {
    const docs = await ProductModel.find({ isActive: true }).lean();
    return docs.map(docToProduct);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const doc = await ProductModel.findById(id).lean();
    return doc ? docToProduct(doc) : undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const doc = await ProductModel.create(insertProduct);
    return docToProduct(doc.toObject());
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const doc = await ProductModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return doc ? docToProduct(doc) : undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Course methods ───────────────────────────────────────────────────────

  async getCourses(): Promise<Course[]> {
    const docs = await CourseModel.find({ isActive: true }).lean();
    return docs.map(docToCourse);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const doc = await CourseModel.findById(id).lean();
    return doc ? docToCourse(doc) : undefined;
  }

  async getFeaturedCourses(): Promise<Course[]> {
    const docs = await CourseModel.find({ isActive: true, isFeatured: true }).lean();
    return docs.map(docToCourse);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const doc = await CourseModel.create(insertCourse);
    return docToCourse(doc.toObject());
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const doc = await CourseModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return doc ? docToCourse(doc) : undefined;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await CourseModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Blog post methods ────────────────────────────────────────────────────

  async getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
    const filter = publishedOnly ? { published: true } : {};
    const docs = await BlogPostModel.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map(docToBlogPost);
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const doc = await BlogPostModel.findById(id).lean();
    return doc ? docToBlogPost(doc) : undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const doc = await BlogPostModel.findOne({ slug }).lean();
    return doc ? docToBlogPost(doc) : undefined;
  }

  async createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
    const doc = await BlogPostModel.create(data);
    return docToBlogPost(doc.toObject());
  }

  async updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost | undefined> {
    const doc = await BlogPostModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return doc ? docToBlogPost(doc) : undefined;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await BlogPostModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Comment methods ──────────────────────────────────────────────────────

  async getComments(postId: string): Promise<Comment[]> {
    const docs = await CommentModel.find({ postId }).sort({ createdAt: 1 }).lean();
    return docs.map(docToComment);
  }

  async createComment(data: InsertComment & { userId: string; username: string }): Promise<Comment> {
    const doc = await CommentModel.create(data);
    return docToComment(doc.toObject());
  }

  async deleteComment(id: string, userId: string): Promise<boolean> {
    const result = await CommentModel.findOneAndDelete({ _id: id, userId });
    return !!result;
  }

  // ─── Like methods ─────────────────────────────────────────────────────────

  async getLikeCount(postId: string): Promise<number> {
    return LikeModel.countDocuments({ postId });
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    return !!(await LikeModel.findOne({ postId, userId }));
  }

  async addLike(postId: string, userId: string): Promise<void> {
    await LikeModel.findOneAndUpdate({ postId, userId }, { postId, userId }, { upsert: true });
  }

  async removeLike(postId: string, userId: string): Promise<void> {
    await LikeModel.findOneAndDelete({ postId, userId });
  }

  // ─── Bookmark methods ─────────────────────────────────────────────────────

  async getBookmarks(userId: string): Promise<BlogPost[]> {
    const bms = await BookmarkModel.find({ userId }).lean();
    const postIds = bms.map((b: any) => b.postId);
    const docs = await BlogPostModel.find({ _id: { $in: postIds }, published: true }).lean();
    return docs.map(docToBlogPost);
  }

  async hasBookmarked(postId: string, userId: string): Promise<boolean> {
    return !!(await BookmarkModel.findOne({ postId, userId }));
  }

  async addBookmark(postId: string, userId: string): Promise<void> {
    await BookmarkModel.findOneAndUpdate({ postId, userId }, { postId, userId }, { upsert: true });
  }

  async removeBookmark(postId: string, userId: string): Promise<void> {
    await BookmarkModel.findOneAndDelete({ postId, userId });
  }

  // ─── Edit suggestion methods ──────────────────────────────────────────────

  async createEditSuggestion(data: InsertEditSuggestion & { userId: string; username: string }): Promise<EditSuggestion> {
    const doc = await EditSuggestionModel.create(data);
    return docToEditSuggestion(doc.toObject());
  }

  async getEditSuggestions(postId: string): Promise<EditSuggestion[]> {
    const docs = await EditSuggestionModel.find({ postId }).sort({ createdAt: -1 }).lean();
    return docs.map(docToEditSuggestion);
  }

  async updateEditSuggestionStatus(id: string, status: "accepted" | "rejected"): Promise<EditSuggestion | undefined> {
    const doc = await EditSuggestionModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    return doc ? docToEditSuggestion(doc) : undefined;
  }

  // ─── Friendship methods ───────────────────────────────────────────────────

  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    const doc = await FriendshipModel.create({ requesterId, addresseeId, status: "pending" });
    return docToFriendship(doc.toObject());
  }

  async respondFriendRequest(id: string, addresseeId: string, status: "accepted" | "declined"): Promise<Friendship | undefined> {
    const doc = await FriendshipModel.findOneAndUpdate(
      { _id: id, addresseeId, status: "pending" },
      { status },
      { new: true }
    ).lean();
    return doc ? docToFriendship(doc) : undefined;
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendships = await FriendshipModel.find({
      $or: [{ requesterId: userId }, { addresseeId: userId }],
      status: "accepted",
    }).lean();
    const friendIds = friendships.map((f: any) =>
      f.requesterId.toString() === userId ? f.addresseeId.toString() : f.requesterId.toString()
    );
    const docs = await UserModel.find({ _id: { $in: friendIds } }).lean();
    return docs.map(docToUser);
  }

  async getFriendRequests(userId: string): Promise<Friendship[]> {
    const docs = await FriendshipModel.find({ addresseeId: userId, status: "pending" }).lean();
    return docs.map(docToFriendship);
  }

  async getFriendshipStatus(userId1: string, userId2: string): Promise<Friendship | undefined> {
    const doc = await FriendshipModel.findOne({
      $or: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 },
      ],
    }).lean();
    return doc ? docToFriendship(doc) : undefined;
  }

  // ─── Message methods ──────────────────────────────────────────────────────

  async sendMessage(data: InsertMessage & { senderId: string }): Promise<Message> {
    const doc = await MessageModel.create({ ...data, read: false });
    return docToMessage(doc.toObject());
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    const docs = await MessageModel.find({
      $or: [
        { senderId: userId1, recipientId: userId2 },
        { senderId: userId2, recipientId: userId1 },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();
    return docs.map(docToMessage);
  }

  async getRecentConversations(userId: string): Promise<{ user: User; lastMessage: Message }[]> {
    const messages = await MessageModel.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const partnerMap = new Map<string, Message>();
    for (const m of messages) {
      const partnerId = m.senderId.toString() === userId ? m.recipientId.toString() : m.senderId.toString();
      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, docToMessage(m));
      }
    }

    const result: { user: User; lastMessage: Message }[] = [];
    for (const [partnerId, lastMessage] of Array.from(partnerMap)) {
      const userDoc = await UserModel.findById(partnerId).lean();
      if (userDoc) result.push({ user: docToUser(userDoc), lastMessage });
    }
    return result;
  }

  async markMessagesRead(senderId: string, recipientId: string): Promise<void> {
    await MessageModel.updateMany({ senderId, recipientId, read: false }, { read: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return MessageModel.countDocuments({ recipientId: userId, read: false });
  }

  // ─── Notification methods ─────────────────────────────────────────────────

  async createNotification(data: InsertNotification): Promise<Notification> {
    const doc = await NotificationModel.create({ ...data, read: false });
    return docToNotification(doc.toObject());
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(MAX_NOTIFICATIONS_PER_USER).lean();
    return docs.map(docToNotification);
  }
  async getUnreadNotificationCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, read: false });
  }

  async markNotificationRead(id: string, userId: string): Promise<Notification | undefined> {
    const doc = await NotificationModel.findOneAndUpdate({ _id: id, userId }, { read: true }, { new: true }).lean();
    return doc ? docToNotification(doc) : undefined;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany({ userId, read: false }, { read: true });
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await NotificationModel.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  async createShortUrl(url: string): Promise<{ code: string; url: string; createdAt: Date }> {
    let code: string;
    let attempts = 0;
    while (true) {
      code = randomBytes(4).toString("hex");
      try {
        const doc = await ShortUrlModel.create({ code, url });
        return { code: doc.code, url: doc.url, createdAt: doc.createdAt as Date };
      } catch (err: any) {
        if (err?.code === 11000 && attempts < 5) {
          attempts++;
          continue;
        }
        throw err;
      }
    }
  }

  async getShortUrl(code: string): Promise<{ code: string; url: string; createdAt: Date } | undefined> {
    const doc = await ShortUrlModel.findOne({ code }).lean();
    if (!doc) return undefined;
    return { code: doc.code, url: doc.url, createdAt: doc.createdAt as Date };
  }

  // ─── SPORTA – Campaign methods ───────────────────────────────────────────

  async createSportaCampaign(data: InsertSportaCampaign): Promise<SportaCampaign> {
    const doc = await SportaCampaignModel.create({ ...data, status: "draft", postsAggregated: 0, postsPublished: 0, postsRejected: 0 });
    return docToSportaCampaign(doc.toObject());
  }

  async getSportaCampaigns(creatorId?: string): Promise<SportaCampaign[]> {
    const filter = creatorId ? { creatorId } : {};
    const docs = await SportaCampaignModel.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map(docToSportaCampaign);
  }

  async getSportaCampaign(id: string): Promise<SportaCampaign | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await SportaCampaignModel.findById(id).lean();
    return doc ? docToSportaCampaign(doc) : undefined;
  }

  async updateSportaCampaign(id: string, updates: Partial<InsertSportaCampaign & { status: SportaCampaignStatus; postsAggregated: number; postsPublished: number; postsRejected: number }>): Promise<SportaCampaign | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await SportaCampaignModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return doc ? docToSportaCampaign(doc) : undefined;
  }

  async deleteSportaCampaign(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await SportaCampaignModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── SPORTA – Content queue methods ─────────────────────────────────────

  async createSportaContent(data: InsertSportaContent): Promise<SportaContent> {
    const doc = await SportaContentModel.create({ ...data, status: "pending" });
    return docToSportaContent(doc.toObject());
  }

  async getSportaContentByCampaign(campaignId: string, status?: SportaContentStatus): Promise<SportaContent[]> {
    const filter: any = { campaignId };
    if (status) filter.status = status;
    const docs = await SportaContentModel.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map(docToSportaContent);
  }

  async getAllSportaContentByStatus(status: SportaContentStatus, limit = 200): Promise<SportaContent[]> {
    const docs = await SportaContentModel.find({ status }).sort({ createdAt: -1 }).limit(limit).lean();
    return docs.map(docToSportaContent);
  }

  async getSportaContent(id: string): Promise<SportaContent | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await SportaContentModel.findById(id).lean();
    return doc ? docToSportaContent(doc) : undefined;
  }

  async updateSportaContentStatus(id: string, status: SportaContentStatus, extra?: Partial<SportaContent>): Promise<SportaContent | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const updates: any = { status, ...extra };
    if (status === "published") updates.publishedAt = new Date();
    const doc = await SportaContentModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return doc ? docToSportaContent(doc) : undefined;
  }

  async deleteSportaContent(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await SportaContentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getSportaStats(): Promise<{ totalCampaigns: number; activeCampaigns: number; pendingContent: number; publishedContent: number; rejectedContent: number }> {
    const [totalCampaigns, activeCampaigns, pendingContent, publishedContent, rejectedContent] = await Promise.all([
      SportaCampaignModel.countDocuments(),
      SportaCampaignModel.countDocuments({ status: "active" }),
      SportaContentModel.countDocuments({ status: "pending" }),
      SportaContentModel.countDocuments({ status: "published" }),
      SportaContentModel.countDocuments({ status: "rejected" }),
    ]);
    return { totalCampaigns, activeCampaigns, pendingContent, publishedContent, rejectedContent };
  }

  // ─── SPORTA – User preferences methods ──────────────────────────────────

  async getSportaPreferences(userId: string): Promise<SportaPreferences | undefined> {
    const doc = await SportaPreferencesModel.findOne({ userId }).lean();
    return doc ? docToSportaPreferences(doc) : undefined;
  }

  async upsertSportaPreferences(data: InsertSportaPreferences): Promise<SportaPreferences> {
    const doc = await SportaPreferencesModel.findOneAndUpdate(
      { userId: data.userId },
      data,
      { new: true, upsert: true }
    ).lean();
    return docToSportaPreferences(doc!);
  }

  // ─── VlogPost methods ────────────────────────────────────────────────────

  async getVlogPosts(publishedOnly?: boolean): Promise<VlogPost[]> {
    const filter = publishedOnly ? { published: true } : {};
    const docs = await VlogPostModel.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map(docToVlogPost);
  }

  async getVlogPost(id: string): Promise<VlogPost | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await VlogPostModel.findById(id).lean();
    return doc ? docToVlogPost(doc) : undefined;
  }

  async getVlogPostBySlug(slug: string): Promise<VlogPost | undefined> {
    const doc = await VlogPostModel.findOne({ slug }).lean();
    return doc ? docToVlogPost(doc) : undefined;
  }

  async createVlogPost(data: InsertVlogPost): Promise<VlogPost> {
    const doc = await VlogPostModel.create(data);
    return docToVlogPost(doc.toObject());
  }

  async updateVlogPost(id: string, updates: UpdateVlogPost): Promise<VlogPost | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await VlogPostModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return doc ? docToVlogPost(doc) : undefined;
  }

  async deleteVlogPost(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await VlogPostModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Audit Log methods ───────────────────────────────────────────────────

  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const doc = await AuditLogModel.create(data);
    return docToAuditLog(doc.toObject());
  }

  async getAuditLogs(opts?: { adminId?: string; limit?: number }): Promise<AuditLog[]> {
    const filter: any = {};
    if (opts?.adminId) filter.adminId = opts.adminId;
    const docs = await AuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(opts?.limit ?? 200)
      .lean();
    return docs.map(docToAuditLog);
  }
}
