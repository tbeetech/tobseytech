import {
  type User,
  type InsertUser,
  type UpdateProfile,
  type Contact,
  type InsertContact,
  type Product,
  type InsertProduct,
  type Course,
  type InsertCourse,
  type BlogPost,
  type InsertBlogPost,
  type UpdateBlogPost,
  type Comment,
  type InsertComment,
  type Like,
  type Bookmark,
  type EditSuggestion,
  type InsertEditSuggestion,
  type Friendship,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
  type VlogPost,
} from "../shared/schema.js";
import { randomUUID, randomBytes } from "crypto";

export interface ShortUrl {
  code: string;
  url: string;
  createdAt: Date;
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, updates: UpdateProfile): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: "user" | "admin"): Promise<User | undefined>;
  setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearPasswordResetToken(userId: string): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;

  // Contact methods
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  updateContactStatus(id: string, status: string): Promise<Contact | undefined>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getFeaturedCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  // Blog post methods
  getBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(data: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;

  // Vlog post methods
  getVlogPosts(publishedOnly?: boolean): Promise<VlogPost[]>;

  // Comment methods
  getComments(postId: string): Promise<Comment[]>;
  createComment(data: InsertComment & { userId: string; username: string }): Promise<Comment>;
  deleteComment(id: string, userId: string): Promise<boolean>;

  // Like methods
  getLikeCount(postId: string): Promise<number>;
  hasLiked(postId: string, userId: string): Promise<boolean>;
  addLike(postId: string, userId: string): Promise<void>;
  removeLike(postId: string, userId: string): Promise<void>;

  // Bookmark methods
  getBookmarks(userId: string): Promise<BlogPost[]>;
  hasBookmarked(postId: string, userId: string): Promise<boolean>;
  addBookmark(postId: string, userId: string): Promise<void>;
  removeBookmark(postId: string, userId: string): Promise<void>;

  // Edit suggestion methods
  createEditSuggestion(data: InsertEditSuggestion & { userId: string; username: string }): Promise<EditSuggestion>;
  getEditSuggestions(postId: string): Promise<EditSuggestion[]>;
  updateEditSuggestionStatus(id: string, status: "accepted" | "rejected"): Promise<EditSuggestion | undefined>;

  // Friendship methods
  sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship>;
  respondFriendRequest(id: string, addresseeId: string, status: "accepted" | "declined"): Promise<Friendship | undefined>;
  getFriends(userId: string): Promise<User[]>;
  getFriendRequests(userId: string): Promise<Friendship[]>;
  getFriendshipStatus(userId1: string, userId2: string): Promise<Friendship | undefined>;

  // Message methods
  sendMessage(data: InsertMessage & { senderId: string }): Promise<Message>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  getRecentConversations(userId: string): Promise<{ user: User; lastMessage: Message }[]>;
  markMessagesRead(senderId: string, recipientId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;

  // Notification methods
  createNotification(data: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  markNotificationRead(id: string, userId: string): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<boolean>;

  // Short URL methods
  createShortUrl(url: string): Promise<ShortUrl>;
  getShortUrl(code: string): Promise<ShortUrl | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contacts: Map<string, Contact>;
  private products: Map<string, Product>;
  private courses: Map<string, Course>;
  private blogPosts: Map<string, BlogPost>;
  private comments: Map<string, Comment>;
  private likes: Map<string, Like>;
  private bookmarks: Map<string, Bookmark>;
  private editSuggestions: Map<string, EditSuggestion>;
  private friendships: Map<string, Friendship>;
  private messages: Map<string, Message>;
  private notifications: Map<string, Notification>;
  private resetTokens: Map<string, { userId: string; expiry: Date }>;
  private shortUrls: Map<string, ShortUrl>;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.products = new Map();
    this.courses = new Map();
    this.blogPosts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.bookmarks = new Map();
    this.editSuggestions = new Map();
    this.friendships = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    this.resetTokens = new Map();
    this.shortUrls = new Map();

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample products
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "AI Dashboard Pro",
        description: "Advanced analytics dashboard with AI-powered insights for business intelligence",
        price: 29900,
        status: "Live",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        features: ["Real-time Analytics", "AI Insights", "Custom Reports", "Multi-platform Support"],
        category: "Business Intelligence",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "CloudOps Manager",
        description: "Comprehensive cloud infrastructure management with automated scaling",
        price: 19900,
        status: "Beta",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        features: ["Auto-scaling", "Cost Optimization", "Security Monitoring", "Multi-cloud Support"],
        category: "DevOps",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "AR/VR Toolkit",
        description: "Next-generation AR/VR development framework for immersive experiences",
        price: 49900,
        status: "Coming Soon",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        features: ["Cross-platform SDK", "3D Asset Library", "Spatial Audio", "Gesture Recognition"],
        category: "AR/VR",
        isActive: true,
        createdAt: new Date(),
      },
    ];

    // Sample courses
    const sampleCourses: Course[] = [
      {
        id: randomUUID(),
        title: "AI-Powered Business Automation",
        description: "Learn to build intelligent automation systems that transform business operations using cutting-edge AI technologies.",
        price: 39900,
        originalPrice: 59900,
        duration: "40 hours",
        level: "Intermediate",
        category: "AI & Machine Learning",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        features: ["40 hours of content", "Real-world projects", "Industry certification", "Lifetime access"],
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Full-Stack Development Masterclass",
        description: "Complete web development from frontend to backend and deployment",
        price: 49900,
        originalPrice: null,
        duration: "120 hours",
        level: "Beginner to Advanced",
        category: "Full-Stack Development",
        imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        features: ["React & Node.js", "Database Design", "DevOps & Deployment", "Portfolio Projects"],
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Cybersecurity Fundamentals",
        description: "Advanced security protocols, ethical hacking, and threat analysis",
        price: 34900,
        originalPrice: null,
        duration: "60 hours",
        level: "Intermediate",
        category: "Cybersecurity",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        features: ["Ethical Hacking", "Network Security", "Incident Response", "Security Auditing"],
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
      },
    ];

    sampleProducts.forEach(product => this.products.set(product.id, product));
    sampleCourses.forEach(course => this.courses.set(course.id, course));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(id: string, updates: UpdateProfile): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updated: User = { ...user, ...updates };
      this.users.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async searchUsers(query: string): Promise<User[]> {
    const q = query.toLowerCase();
    return Array.from(this.users.values()).filter(
      (u) => u.username.toLowerCase().includes(q) || (u.displayName || "").toLowerCase().includes(q)
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserRole(id: string, role: "user" | "admin"): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, role };
    this.users.set(id, updated);
    return updated;
  }

  async setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    this.resetTokens.set(token, { userId, expiry });
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const entry = this.resetTokens.get(token);
    if (!entry) return undefined;
    if (entry.expiry < new Date()) {
      this.resetTokens.delete(token);
      return undefined;
    }
    return this.users.get(entry.userId);
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    for (const [token, entry] of Array.from(this.resetTokens.entries())) {
      if (entry.userId === userId) {
        this.resetTokens.delete(token);
      }
    }
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, password: hashedPassword });
    }
  }

  // Contact methods
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      status: "new",
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async updateContactStatus(id: string, status: string): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (contact) {
      contact.status = status;
      this.contacts.set(id, contact);
      return contact;
    }
    return undefined;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      imageUrl: insertProduct.imageUrl || null,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      const updatedProduct = { ...product, ...updates };
      this.products.set(id, updatedProduct);
      return updatedProduct;
    }
    return undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Course methods
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(c => c.isActive);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getFeaturedCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(c => c.isActive && c.isFeatured);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = {
      ...insertCourse,
      id,
      imageUrl: insertCourse.imageUrl ?? null,
      originalPrice: insertCourse.originalPrice ?? null,
      createdAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (course) {
      const updatedCourse = { ...course, ...updates };
      this.courses.set(id, updatedCourse);
      return updatedCourse;
    }
    return undefined;
  }

  async deleteCourse(id: string): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Blog post methods
  async getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
    const posts = Array.from(this.blogPosts.values())
      .filter(p => !publishedOnly || p.published)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return posts;
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(p => p.slug === slug);
  }

  async createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const now = new Date();
    const post: BlogPost = {
      ...data,
      id,
      coverImage: data.coverImage ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (post) {
      const updated: BlogPost = { ...post, ...updates, updatedAt: new Date() };
      this.blogPosts.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  // Vlog post methods
  async getVlogPosts(_publishedOnly = true): Promise<VlogPost[]> {
    // MemStorage has no vlog data; return empty array as a safe dev fallback
    return [];
  }

  // Comment methods
  async getComments(postId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(data: InsertComment & { userId: string; username: string }): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { ...data, id, createdAt: new Date() };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string, userId: string): Promise<boolean> {
    const comment = this.comments.get(id);
    if (comment && comment.userId === userId) {
      this.comments.delete(id);
      return true;
    }
    return false;
  }

  // Like methods
  async getLikeCount(postId: string): Promise<number> {
    return Array.from(this.likes.values()).filter((l) => l.postId === postId).length;
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    return Array.from(this.likes.values()).some((l) => l.postId === postId && l.userId === userId);
  }

  async addLike(postId: string, userId: string): Promise<void> {
    const exists = await this.hasLiked(postId, userId);
    if (!exists) {
      const id = randomUUID();
      this.likes.set(id, { id, postId, userId, createdAt: new Date() });
    }
  }

  async removeLike(postId: string, userId: string): Promise<void> {
    for (const [id, like] of Array.from(this.likes.entries())) {
      if (like.postId === postId && like.userId === userId) {
        this.likes.delete(id);
        return;
      }
    }
  }

  // Bookmark methods
  async getBookmarks(userId: string): Promise<BlogPost[]> {
    const bms = Array.from(this.bookmarks.values()).filter((b) => b.userId === userId);
    const posts: BlogPost[] = [];
    for (const bm of bms) {
      const post = this.blogPosts.get(bm.postId);
      if (post && post.published) posts.push(post);
    }
    return posts;
  }

  async hasBookmarked(postId: string, userId: string): Promise<boolean> {
    return Array.from(this.bookmarks.values()).some((b) => b.postId === postId && b.userId === userId);
  }

  async addBookmark(postId: string, userId: string): Promise<void> {
    const exists = await this.hasBookmarked(postId, userId);
    if (!exists) {
      const id = randomUUID();
      this.bookmarks.set(id, { id, postId, userId, createdAt: new Date() });
    }
  }

  async removeBookmark(postId: string, userId: string): Promise<void> {
    for (const [id, bm] of Array.from(this.bookmarks.entries())) {
      if (bm.postId === postId && bm.userId === userId) {
        this.bookmarks.delete(id);
        return;
      }
    }
  }

  // Edit suggestion methods
  async createEditSuggestion(data: InsertEditSuggestion & { userId: string; username: string }): Promise<EditSuggestion> {
    const id = randomUUID();
    const suggestion: EditSuggestion = { ...data, id, status: "pending", createdAt: new Date() };
    this.editSuggestions.set(id, suggestion);
    return suggestion;
  }

  async getEditSuggestions(postId: string): Promise<EditSuggestion[]> {
    return Array.from(this.editSuggestions.values()).filter((s) => s.postId === postId);
  }

  async updateEditSuggestionStatus(id: string, status: "accepted" | "rejected"): Promise<EditSuggestion | undefined> {
    const suggestion = this.editSuggestions.get(id);
    if (suggestion) {
      const updated = { ...suggestion, status };
      this.editSuggestions.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Friendship methods
  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    const id = randomUUID();
    const friendship: Friendship = { id, requesterId, addresseeId, status: "pending", createdAt: new Date() };
    this.friendships.set(id, friendship);
    return friendship;
  }

  async respondFriendRequest(id: string, addresseeId: string, status: "accepted" | "declined"): Promise<Friendship | undefined> {
    const friendship = this.friendships.get(id);
    if (friendship && friendship.addresseeId === addresseeId) {
      const updated = { ...friendship, status };
      this.friendships.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendIds = Array.from(this.friendships.values())
      .filter((f) => f.status === "accepted" && (f.requesterId === userId || f.addresseeId === userId))
      .map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));
    return friendIds.map((id) => this.users.get(id)!).filter(Boolean);
  }

  async getFriendRequests(userId: string): Promise<Friendship[]> {
    return Array.from(this.friendships.values()).filter(
      (f) => f.addresseeId === userId && f.status === "pending"
    );
  }

  async getFriendshipStatus(userId1: string, userId2: string): Promise<Friendship | undefined> {
    return Array.from(this.friendships.values()).find(
      (f) =>
        (f.requesterId === userId1 && f.addresseeId === userId2) ||
        (f.requesterId === userId2 && f.addresseeId === userId1)
    );
  }

  // Message methods
  async sendMessage(data: InsertMessage & { senderId: string }): Promise<Message> {
    const id = randomUUID();
    const message: Message = { ...data, id, read: false, createdAt: new Date() };
    this.messages.set(id, message);
    return message;
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (m) =>
          (m.senderId === userId1 && m.recipientId === userId2) ||
          (m.senderId === userId2 && m.recipientId === userId1)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getRecentConversations(userId: string): Promise<{ user: User; lastMessage: Message }[]> {
    const userMessages = Array.from(this.messages.values()).filter(
      (m) => m.senderId === userId || m.recipientId === userId
    );
    const partnerIds = new Set<string>();
    for (const m of userMessages) {
      partnerIds.add(m.senderId === userId ? m.recipientId : m.senderId);
    }
    const result: { user: User; lastMessage: Message }[] = [];
    for (const partnerId of Array.from(partnerIds)) {
      const partner = this.users.get(partnerId);
      if (!partner) continue;
      const conversation = userMessages
        .filter((m) => m.senderId === partnerId || m.recipientId === partnerId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      if (conversation.length) {
        result.push({ user: partner, lastMessage: conversation[0] });
      }
    }
    return result.sort((a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime());
  }

  async markMessagesRead(senderId: string, recipientId: string): Promise<void> {
    for (const [id, msg] of Array.from(this.messages.entries())) {
      if (msg.senderId === senderId && msg.recipientId === recipientId && !msg.read) {
        this.messages.set(id, { ...msg, read: true });
      }
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Array.from(this.messages.values()).filter((m) => m.recipientId === userId && !m.read).length;
  }

  // ─── Notification methods ──────────────────────────────────────────────────

  async createNotification(data: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      read: false,
      actorId: data.actorId,
      actorName: data.actorName,
      entityId: data.entityId,
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values()).filter((n) => n.userId === userId && !n.read).length;
  }

  async markNotificationRead(id: string, userId: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) return undefined;
    const updated = { ...notification, read: true };
    this.notifications.set(id, updated);
    return updated;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    for (const [id, notification] of Array.from(this.notifications.entries())) {
      if (notification.userId === userId && !notification.read) {
        this.notifications.set(id, { ...notification, read: true });
      }
    }
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) return false;
    this.notifications.delete(id);
    return true;
  }

  async createShortUrl(url: string): Promise<ShortUrl> {
    let code: string;
    do {
      code = randomBytes(4).toString("hex");
    } while (this.shortUrls.has(code));
    const entry: ShortUrl = { code, url, createdAt: new Date() };
    this.shortUrls.set(code, entry);
    return entry;
  }

  async getShortUrl(code: string): Promise<ShortUrl | undefined> {
    return this.shortUrls.get(code);
  }
}

import { MongoStorage } from "./mongoStorage.js";
import { connectToDatabase } from "./mongodb.js";
import { isProduction, MONGODB_URI } from "./env.js";

async function createStorage(): Promise<IStorage> {
  if (!MONGODB_URI) {
    if (isProduction) {
      throw new Error("MONGODB_URI is required in production");
    }
    return new MemStorage();
  }

  try {
    await connectToDatabase();
    return new MongoStorage();
  } catch (err) {
    if (isProduction) {
      throw err;
    }
    console.error(
      "[storage] MongoDB connection failed — falling back to in-memory storage. " +
        "Data will not persist across restarts.",
      (err as Error).message
    );
    return new MemStorage();
  }
}

// Export a proxy that defers to the resolved storage instance
let _storage: IStorage | null = null;

const storageProxy = new Proxy({} as IStorage, {
  get(_target, prop: string) {
    if (!_storage) throw new Error("Storage not initialized — await initStorage() first");
    return (_storage as any)[prop].bind(_storage);
  },
});

export async function initStorage(): Promise<void> {
  _storage = await createStorage();
}

export const storage: IStorage = storageProxy;
