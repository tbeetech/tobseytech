/**
 * MongoDB-backed implementation of IStorage — written from scratch.
 *
 * Every public method maps directly to a Mongoose model operation.  Document
 * to plain-object conversion is handled by small, dedicated helper functions
 * so that the model layer and the storage interface remain decoupled.
 */

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
} from "@shared/schema";

import mongoose from "mongoose";
import { randomBytes } from "crypto";

import { UserModel }           from "./models/User.js";
import { ContactModel }        from "./models/Contact.js";
import { ProductModel }        from "./models/Product.js";
import { CourseModel }         from "./models/Course.js";
import { BlogPostModel }       from "./models/BlogPost.js";
import { CommentModel }        from "./models/Comment.js";
import { LikeModel }           from "./models/Like.js";
import { BookmarkModel }       from "./models/Bookmark.js";
import { EditSuggestionModel } from "./models/EditSuggestion.js";
import { FriendshipModel }     from "./models/Friendship.js";
import { MessageModel }        from "./models/Message.js";
import { NotificationModel }   from "./models/Notification.js";
import { ShortUrlModel }       from "./models/ShortUrl.js";

// ─── Document → plain-object converters ──────────────────────────────────────

function toUser(doc: any): User {
  return {
    id:          doc._id.toString(),
    username:    doc.username,
    email:       doc.email,
    password:    doc.password,
    role:        doc.role as "user" | "admin",
    displayName: doc.displayName ?? "",
    bio:         doc.bio         ?? "",
    avatarUrl:   doc.avatarUrl   ?? null,
    createdAt:   doc.createdAt,
  };
}

function toContact(doc: any): Contact {
  return {
    id:          doc._id.toString(),
    name:        doc.name,
    email:       doc.email,
    projectType: doc.projectType,
    budgetRange: doc.budgetRange,
    message:     doc.message,
    status:      doc.status,
    createdAt:   doc.createdAt,
  };
}

function toProduct(doc: any): Product {
  return {
    id:          doc._id.toString(),
    name:        doc.name,
    description: doc.description,
    price:       doc.price,
    status:      doc.status,
    imageUrl:    doc.imageUrl ?? null,
    features:    doc.features ?? [],
    category:    doc.category,
    isActive:    doc.isActive,
    createdAt:   doc.createdAt,
  };
}

function toCourse(doc: any): Course {
  return {
    id:            doc._id.toString(),
    title:         doc.title,
    description:   doc.description,
    price:         doc.price,
    originalPrice: doc.originalPrice ?? null,
    duration:      doc.duration,
    level:         doc.level,
    category:      doc.category,
    imageUrl:      doc.imageUrl ?? null,
    features:      doc.features ?? [],
    isActive:      doc.isActive,
    isFeatured:    doc.isFeatured,
    createdAt:     doc.createdAt,
  };
}

function toBlogPost(doc: any): BlogPost {
  return {
    id:          doc._id.toString(),
    title:       doc.title,
    slug:        doc.slug,
    excerpt:     doc.excerpt,
    content:     doc.content,
    coverImage:  doc.coverImage ?? null,
    tags:        doc.tags       ?? [],
    category:    doc.category,
    published:   doc.published,
    authorId:    doc.authorId,
    authorName:  doc.authorName,
    createdAt:   doc.createdAt,
    updatedAt:   doc.updatedAt,
  };
}

function toComment(doc: any): Comment {
  return {
    id:        doc._id.toString(),
    postId:    doc.postId,
    userId:    doc.userId,
    username:  doc.username,
    content:   doc.content,
    createdAt: doc.createdAt,
  };
}

function toEditSuggestion(doc: any): EditSuggestion {
  return {
    id:               doc._id.toString(),
    postId:           doc.postId,
    userId:           doc.userId,
    username:         doc.username,
    suggestedTitle:   doc.suggestedTitle,
    suggestedContent: doc.suggestedContent,
    reason:           doc.reason,
    status:           doc.status,
    createdAt:        doc.createdAt,
  };
}

function toFriendship(doc: any): Friendship {
  return {
    id:          doc._id.toString(),
    requesterId: doc.requesterId,
    addresseeId: doc.addresseeId,
    status:      doc.status,
    createdAt:   doc.createdAt,
  };
}

function toMessage(doc: any): Message {
  return {
    id:          doc._id.toString(),
    senderId:    doc.senderId,
    recipientId: doc.recipientId,
    content:     doc.content,
    read:        doc.read,
    ...(doc.replyToId ? { replyToId: doc.replyToId } : {}),
    createdAt:   doc.createdAt,
  };
}

function toNotification(doc: any): Notification {
  return {
    id:        doc._id.toString(),
    userId:    doc.userId,
    type:      doc.type,
    title:     doc.title,
    message:   doc.message,
    link:      doc.link      ?? undefined,
    read:      doc.read,
    actorId:   doc.actorId   ?? undefined,
    actorName: doc.actorName ?? undefined,
    entityId:  doc.entityId  ?? undefined,
    createdAt: doc.createdAt,
  };
}

// ─── Maximum notifications kept per user ─────────────────────────────────────
const MAX_NOTIFICATIONS = 50;

// ─── Maximum retry attempts for short URL code generation ────────────────────
const MAX_SHORT_URL_RETRIES = 10;

// ─── MongoStorage ─────────────────────────────────────────────────────────────

export class MongoStorage {

  // ── User methods ────────────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await UserModel.findById(id).lean();
    return doc ? toUser(doc) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ username }).lean();
    return doc ? toUser(doc) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    return doc ? toUser(doc) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const doc = await UserModel.create({
      username:    insertUser.username,
      email:       insertUser.email.toLowerCase(),
      password:    insertUser.password,
      role:        insertUser.role ?? "user",
      displayName: "",
      bio:         "",
      avatarUrl:   null,
    });
    return toUser(doc.toObject());
  }

  async updateUserProfile(id: string, updates: UpdateProfile): Promise<User | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await UserModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    return doc ? toUser(doc) : undefined;
  }

  async searchUsers(query: string): Promise<User[]> {
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const docs = await UserModel
      .find({ $or: [{ username: regex }, { displayName: regex }] })
      .lean();
    return docs.map(toUser);
  }

  async getAllUsers(): Promise<User[]> {
    const docs = await UserModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(toUser);
  }

  async updateUserRole(id: string, role: "user" | "admin"): Promise<User | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await UserModel.findByIdAndUpdate(id, { $set: { role } }, { new: true }).lean();
    return doc ? toUser(doc) : undefined;
  }

  async setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return;
    await UserModel.findByIdAndUpdate(userId, {
      $set: { resetToken: token, resetTokenExpiry: expiry },
    });
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const doc = await UserModel
      .findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } })
      .lean();
    return doc ? toUser(doc) : undefined;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return;
    await UserModel.findByIdAndUpdate(userId, {
      $set: { resetToken: null, resetTokenExpiry: null },
    });
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return;
    await UserModel.findByIdAndUpdate(userId, { $set: { password: hashedPassword } });
  }

  // ── Contact methods ──────────────────────────────────────────────────────────

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const doc = await ContactModel.create({ ...insertContact, status: "new" });
    return toContact(doc.toObject());
  }

  async getContacts(): Promise<Contact[]> {
    const docs = await ContactModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(toContact);
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const doc = await ContactModel.findById(id).lean();
    return doc ? toContact(doc) : undefined;
  }

  async updateContactStatus(id: string, status: string): Promise<Contact | undefined> {
    const doc = await ContactModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .lean();
    return doc ? toContact(doc) : undefined;
  }

  // ── Product methods ──────────────────────────────────────────────────────────

  async getProducts(): Promise<Product[]> {
    const docs = await ProductModel.find({ isActive: true }).lean();
    return docs.map(toProduct);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const doc = await ProductModel.findById(id).lean();
    return doc ? toProduct(doc) : undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const doc = await ProductModel.create(insertProduct);
    return toProduct(doc.toObject());
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const doc = await ProductModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .lean();
    return doc ? toProduct(doc) : undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  // ── Course methods ───────────────────────────────────────────────────────────

  async getCourses(): Promise<Course[]> {
    const docs = await CourseModel.find({ isActive: true }).lean();
    return docs.map(toCourse);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const doc = await CourseModel.findById(id).lean();
    return doc ? toCourse(doc) : undefined;
  }

  async getFeaturedCourses(): Promise<Course[]> {
    const docs = await CourseModel.find({ isActive: true, isFeatured: true }).lean();
    return docs.map(toCourse);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const doc = await CourseModel.create(insertCourse);
    return toCourse(doc.toObject());
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const doc = await CourseModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .lean();
    return doc ? toCourse(doc) : undefined;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await CourseModel.findByIdAndDelete(id);
    return !!result;
  }

  // ── Blog post methods ────────────────────────────────────────────────────────

  async getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
    const filter = publishedOnly ? { published: true } : {};
    const docs = await BlogPostModel.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map(toBlogPost);
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const doc = await BlogPostModel.findById(id).lean();
    return doc ? toBlogPost(doc) : undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const doc = await BlogPostModel.findOne({ slug }).lean();
    return doc ? toBlogPost(doc) : undefined;
  }

  async createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
    const doc = await BlogPostModel.create(data);
    return toBlogPost(doc.toObject());
  }

  async updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost | undefined> {
    const doc = await BlogPostModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .lean();
    return doc ? toBlogPost(doc) : undefined;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await BlogPostModel.findByIdAndDelete(id);
    return !!result;
  }

  // ── Comment methods ──────────────────────────────────────────────────────────

  async getComments(postId: string): Promise<Comment[]> {
    const docs = await CommentModel.find({ postId }).sort({ createdAt: 1 }).lean();
    return docs.map(toComment);
  }

  async createComment(
    data: InsertComment & { userId: string; username: string }
  ): Promise<Comment> {
    const doc = await CommentModel.create(data);
    return toComment(doc.toObject());
  }

  async deleteComment(id: string, userId: string): Promise<boolean> {
    const result = await CommentModel.findOneAndDelete({ _id: id, userId });
    return !!result;
  }

  // ── Like methods ─────────────────────────────────────────────────────────────

  async getLikeCount(postId: string): Promise<number> {
    return LikeModel.countDocuments({ postId });
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    return !!(await LikeModel.findOne({ postId, userId }));
  }

  async addLike(postId: string, userId: string): Promise<void> {
    await LikeModel.findOneAndUpdate(
      { postId, userId },
      { postId, userId },
      { upsert: true }
    );
  }

  async removeLike(postId: string, userId: string): Promise<void> {
    await LikeModel.findOneAndDelete({ postId, userId });
  }

  // ── Bookmark methods ─────────────────────────────────────────────────────────

  async getBookmarks(userId: string): Promise<BlogPost[]> {
    const bms    = await BookmarkModel.find({ userId }).lean();
    const postIds = bms.map((b: any) => b.postId);
    const docs   = await BlogPostModel
      .find({ _id: { $in: postIds }, published: true })
      .lean();
    return docs.map(toBlogPost);
  }

  async hasBookmarked(postId: string, userId: string): Promise<boolean> {
    return !!(await BookmarkModel.findOne({ postId, userId }));
  }

  async addBookmark(postId: string, userId: string): Promise<void> {
    await BookmarkModel.findOneAndUpdate(
      { postId, userId },
      { postId, userId },
      { upsert: true }
    );
  }

  async removeBookmark(postId: string, userId: string): Promise<void> {
    await BookmarkModel.findOneAndDelete({ postId, userId });
  }

  // ── Edit suggestion methods ──────────────────────────────────────────────────

  async createEditSuggestion(
    data: InsertEditSuggestion & { userId: string; username: string }
  ): Promise<EditSuggestion> {
    const doc = await EditSuggestionModel.create(data);
    return toEditSuggestion(doc.toObject());
  }

  async getEditSuggestions(postId: string): Promise<EditSuggestion[]> {
    const docs = await EditSuggestionModel.find({ postId }).sort({ createdAt: -1 }).lean();
    return docs.map(toEditSuggestion);
  }

  async updateEditSuggestionStatus(
    id: string,
    status: "accepted" | "rejected"
  ): Promise<EditSuggestion | undefined> {
    const doc = await EditSuggestionModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .lean();
    return doc ? toEditSuggestion(doc) : undefined;
  }

  // ── Friendship methods ───────────────────────────────────────────────────────

  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    const doc = await FriendshipModel.create({ requesterId, addresseeId, status: "pending" });
    return toFriendship(doc.toObject());
  }

  async respondFriendRequest(
    id: string,
    addresseeId: string,
    status: "accepted" | "declined"
  ): Promise<Friendship | undefined> {
    const doc = await FriendshipModel
      .findOneAndUpdate(
        { _id: id, addresseeId, status: "pending" },
        { $set: { status } },
        { new: true }
      )
      .lean();
    return doc ? toFriendship(doc) : undefined;
  }

  async getFriends(userId: string): Promise<User[]> {
    const fs = await FriendshipModel.find({
      $or: [{ requesterId: userId }, { addresseeId: userId }],
      status: "accepted",
    }).lean();

    const friendIds = fs.map((f: any) =>
      f.requesterId.toString() === userId
        ? f.addresseeId.toString()
        : f.requesterId.toString()
    );

    const docs = await UserModel.find({ _id: { $in: friendIds } }).lean();
    return docs.map(toUser);
  }

  async getFriendRequests(userId: string): Promise<Friendship[]> {
    const docs = await FriendshipModel
      .find({ addresseeId: userId, status: "pending" })
      .lean();
    return docs.map(toFriendship);
  }

  async getFriendshipStatus(
    userId1: string,
    userId2: string
  ): Promise<Friendship | undefined> {
    const doc = await FriendshipModel.findOne({
      $or: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 },
      ],
    }).lean();
    return doc ? toFriendship(doc) : undefined;
  }

  // ── Message methods ──────────────────────────────────────────────────────────

  async sendMessage(
    data: InsertMessage & { senderId: string }
  ): Promise<Message> {
    const doc = await MessageModel.create({ ...data, read: false });
    return toMessage(doc.toObject());
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    const docs = await MessageModel
      .find({
        $or: [
          { senderId: userId1, recipientId: userId2 },
          { senderId: userId2, recipientId: userId1 },
        ],
      })
      .sort({ createdAt: 1 })
      .lean();
    return docs.map(toMessage);
  }

  async getRecentConversations(
    userId: string
  ): Promise<{ user: User; lastMessage: Message }[]> {
    const messages = await MessageModel
      .find({ $or: [{ senderId: userId }, { recipientId: userId }] })
      .sort({ createdAt: -1 })
      .lean();

    const partnerMap = new Map<string, Message>();
    for (const m of messages) {
      const partnerId =
        m.senderId.toString() === userId
          ? m.recipientId.toString()
          : m.senderId.toString();
      if (!partnerMap.has(partnerId)) partnerMap.set(partnerId, toMessage(m));
    }

    const result: { user: User; lastMessage: Message }[] = [];
    for (const [partnerId, lastMessage] of Array.from(partnerMap)) {
      const userDoc = await UserModel.findById(partnerId).lean();
      if (userDoc) result.push({ user: toUser(userDoc), lastMessage });
    }
    return result;
  }

  async markMessagesRead(senderId: string, recipientId: string): Promise<void> {
    await MessageModel.updateMany(
      { senderId, recipientId, read: false },
      { $set: { read: true } }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return MessageModel.countDocuments({ recipientId: userId, read: false });
  }

  // ── Notification methods ─────────────────────────────────────────────────────

  async createNotification(data: InsertNotification): Promise<Notification> {
    const doc = await NotificationModel.create({ ...data, read: false });
    return toNotification(doc.toObject());
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const docs = await NotificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(MAX_NOTIFICATIONS)
      .lean();
    return docs.map(toNotification);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, read: false });
  }

  async markNotificationRead(
    id: string,
    userId: string
  ): Promise<Notification | undefined> {
    const doc = await NotificationModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: { read: true } },
        { new: true }
      )
      .lean();
    return doc ? toNotification(doc) : undefined;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await NotificationModel.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  // ── Short URL methods ────────────────────────────────────────────────────────

  async createShortUrl(
    url: string
  ): Promise<{ code: string; url: string; createdAt: Date }> {
    for (let attempt = 0; attempt < MAX_SHORT_URL_RETRIES; attempt++) {
      const code = randomBytes(4).toString("hex");
      try {
        const doc = await ShortUrlModel.create({ code, url });
        return { code: doc.code, url: doc.url, createdAt: doc.createdAt as Date };
      } catch (err: any) {
        // Retry only on duplicate-key collisions (E11000); otherwise re-throw.
        if (err?.code === 11000) continue;
        throw err;
      }
    }
    throw new Error(`[db] Failed to generate a unique short URL code after ${MAX_SHORT_URL_RETRIES} attempts`);
  }

  async getShortUrl(
    code: string
  ): Promise<{ code: string; url: string; createdAt: Date } | undefined> {
    const doc = await ShortUrlModel.findOne({ code }).lean();
    if (!doc) return undefined;
    return { code: doc.code, url: doc.url, createdAt: doc.createdAt as Date };
  }
}
