import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import passport from "passport";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import {
  insertContactSchema,
  insertProductSchema,
  insertCourseSchema,
  insertUserSchema,
  loginSchema,
  insertBlogPostSchema,
  updateBlogPostSchema,
  updateProfileSchema,
  insertCommentSchema,
  insertEditSuggestionSchema,
  insertMessageSchema,
} from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user as any;
  if (!req.isAuthenticated() || user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

// WebSocket client registry: userId -> Set of active WebSocket connections
const wsClients = new Map<string, Set<WebSocket>>();

function broadcastToUser(userId: string, data: any) {
  const clients = wsClients.get(userId);
  if (clients) {
    const payload = JSON.stringify(data);
    Array.from(clients).forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ─── Auth routes ────────────────────────────────────────────────────────

  app.post("/api/auth/register", authRateLimiter, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const hashed = await bcrypt.hash(data.password, 12);
      const user = await storage.createUser({ ...data, password: hashed });
      const { password: _pw, ...safeUser } = user;
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login after register failed" });
        res.status(201).json(safeUser);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", authRateLimiter, (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: err.errors });
      }
    }
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const { password: _pw, ...safeUser } = user;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", authRateLimiter, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", authRateLimiter, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const { password: _pw, ...safeUser } = req.user as any;
    res.json(safeUser);
  });

  // ─── User / Profile routes ───────────────────────────────────────────────

  app.patch("/api/user/profile", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const updates = updateProfileSchema.parse(req.body);
      const updated = await storage.updateUserProfile(user.id, updates);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _pw, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/users/search", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const q = String(req.query.q || "").trim();
      if (q.length < 2) return res.json([]);
      const users = await storage.searchUsers(q);
      const safe = users.map(({ password: _pw, email: _em, ...u }) => u);
      res.json(safe);
    } catch {
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.get("/api/users/:id", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _pw, email: _em, ...safeUser } = user;
      res.json(safeUser);
    } catch {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ─── Blog routes ─────────────────────────────────────────────────────────

  // List published posts (public)
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // List all posts including drafts (admin only)
  app.get("/api/blog/all", authRateLimiter, requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(false);
      res.json(posts);
    } catch {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Get single post by slug (public)
  app.get("/api/blog/slug/:slug", authRateLimiter, async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) return res.status(404).json({ message: "Post not found" });
      if (!post.published) {
        const user = req.user as any;
        if (!req.isAuthenticated() || (user?.role !== "admin" && user?.id !== post.authorId)) {
          return res.status(404).json({ message: "Post not found" });
        }
      }
      res.json(post);
    } catch {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Get single post by id (admin or author)
  app.get("/api/blog/:id", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });
      const user = req.user as any;
      if (user?.role !== "admin" && user?.id !== post.authorId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(post);
    } catch {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Create post (any authenticated user)
  app.post("/api/blog", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertBlogPostSchema.parse({ ...req.body, authorId: user.id, authorName: user.displayName || user.username });
      const existing = await storage.getBlogPostBySlug(data.slug);
      if (existing) return res.status(409).json({ message: "Slug already exists" });
      // Non-admins always create as draft
      if (user.role !== "admin") {
        data.published = false;
      }
      const post = await storage.createBlogPost(data);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Update post (admin or author; non-admin cannot publish)
  app.patch("/api/blog/:id", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const post = await storage.getBlogPost(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });
      if (user.role !== "admin" && user.id !== post.authorId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updates = updateBlogPostSchema.parse(req.body);
      if (user.role !== "admin") {
        delete (updates as any).published;
      }
      if (updates.slug) {
        const existing = await storage.getBlogPostBySlug(updates.slug);
        if (existing && existing.id !== req.params.id) {
          return res.status(409).json({ message: "Slug already exists" });
        }
      }
      const updated = await storage.updateBlogPost(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  // Delete post (admin or author)
  app.delete("/api/blog/:id", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const post = await storage.getBlogPost(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });
      if (user.role !== "admin" && user.id !== post.authorId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteBlogPost(req.params.id);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // ─── Comment routes ───────────────────────────────────────────────────────

  app.get("/api/blog/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    } catch {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/blog/:id/comments", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertCommentSchema.parse({ ...req.body, postId: req.params.id });
      const comment = await storage.createComment({ ...data, userId: user.id, username: user.displayName || user.username });
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete("/api/comments/:id", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const deleted = await storage.deleteComment(req.params.id, user.id);
      if (!deleted) return res.status(404).json({ message: "Comment not found or not yours" });
      res.json({ ok: true });
    } catch {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // ─── Like routes ──────────────────────────────────────────────────────────

  app.get("/api/blog/:id/likes", async (req, res) => {
    try {
      const user = req.user as any;
      const count = await storage.getLikeCount(req.params.id);
      const liked = user ? await storage.hasLiked(req.params.id, user.id) : false;
      res.json({ count, liked });
    } catch {
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  app.post("/api/blog/:id/likes", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.addLike(req.params.id, user.id);
      const count = await storage.getLikeCount(req.params.id);
      res.json({ count, liked: true });
    } catch {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/blog/:id/likes", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.removeLike(req.params.id, user.id);
      const count = await storage.getLikeCount(req.params.id);
      res.json({ count, liked: false });
    } catch {
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // ─── Bookmark routes ──────────────────────────────────────────────────────

  app.get("/api/user/bookmarks", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const posts = await storage.getBookmarks(user.id);
      res.json(posts);
    } catch {
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.get("/api/blog/:id/bookmark", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const bookmarked = await storage.hasBookmarked(req.params.id, user.id);
      res.json({ bookmarked });
    } catch {
      res.status(500).json({ message: "Failed to check bookmark" });
    }
  });

  app.post("/api/blog/:id/bookmark", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.addBookmark(req.params.id, user.id);
      res.json({ bookmarked: true });
    } catch {
      res.status(500).json({ message: "Failed to bookmark post" });
    }
  });

  app.delete("/api/blog/:id/bookmark", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.removeBookmark(req.params.id, user.id);
      res.json({ bookmarked: false });
    } catch {
      res.status(500).json({ message: "Failed to remove bookmark" });
    }
  });

  // ─── Edit suggestion routes ───────────────────────────────────────────────

  app.post("/api/blog/:id/suggest", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertEditSuggestionSchema.parse({ ...req.body, postId: req.params.id });
      const suggestion = await storage.createEditSuggestion({ ...data, userId: user.id, username: user.displayName || user.username });
      res.status(201).json(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid suggestion", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit suggestion" });
    }
  });

  app.get("/api/blog/:id/suggestions", authRateLimiter, requireAdmin, async (req, res) => {
    try {
      const suggestions = await storage.getEditSuggestions(req.params.id);
      res.json(suggestions);
    } catch {
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  app.patch("/api/suggestions/:id", authRateLimiter, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await storage.updateEditSuggestionStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ message: "Suggestion not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Failed to update suggestion" });
    }
  });

  // ─── Friendship routes ────────────────────────────────────────────────────

  app.post("/api/friends/request", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { addresseeId } = req.body;
      if (!addresseeId) return res.status(400).json({ message: "addresseeId required" });
      if (addresseeId === user.id) return res.status(400).json({ message: "Cannot friend yourself" });
      const existing = await storage.getFriendshipStatus(user.id, addresseeId);
      if (existing) return res.status(409).json({ message: "Friendship already exists" });
      const friendship = await storage.sendFriendRequest(user.id, addresseeId);
      res.status(201).json(friendship);
    } catch {
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.patch("/api/friends/request/:id", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { status } = req.body;
      if (!["accepted", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await storage.respondFriendRequest(req.params.id, user.id, status);
      if (!updated) return res.status(404).json({ message: "Request not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Failed to respond to friend request" });
    }
  });

  app.get("/api/friends", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const friends = await storage.getFriends(user.id);
      const safe = friends.map(({ password: _pw, email: _em, ...u }) => u);
      res.json(safe);
    } catch {
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get("/api/friends/requests", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const requests = await storage.getFriendRequests(user.id);
      res.json(requests);
    } catch {
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.get("/api/friends/status/:userId", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const friendship = await storage.getFriendshipStatus(user.id, req.params.userId);
      res.json(friendship || null);
    } catch {
      res.status(500).json({ message: "Failed to fetch friendship status" });
    }
  });

  // ─── Message routes ───────────────────────────────────────────────────────

  app.get("/api/messages/conversations", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const conversations = await storage.getRecentConversations(user.id);
      const safe = conversations.map(({ user: u, lastMessage }) => ({
        user: (({ password: _pw, email: _em, ...rest }) => rest)(u),
        lastMessage,
      }));
      res.json(safe);
    } catch {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages/:userId", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.markMessagesRead(req.params.userId, user.id);
      const messages = await storage.getConversation(user.id, req.params.userId);
      res.json(messages);
    } catch {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.sendMessage({ ...data, senderId: user.id });
      // Broadcast to recipient via WebSocket if connected
      broadcastToUser(data.recipientId, { type: "new_message", message });
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages/unread/count", authRateLimiter, requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const count = await storage.getUnreadCount(user.id);
      res.json({ count });
    } catch {
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  // ─── Contact routes ───────────────────────────────────────────────────────

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        res.status(404).json({ message: "Contact not found" });
        return;
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.patch("/api/contacts/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ message: "Status is required" });
        return;
      }
      const contact = await storage.updateContactStatus(req.params.id, status);
      if (!contact) {
        res.status(404).json({ message: "Contact not found" });
        return;
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contact status" });
    }
  });

  // Simple contact endpoint that sends an email
  app.post("/api/contact", async (req, res) => {
    const { name, company, email, service, message } = req.body || {};
    if (!name || !email) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_FROM,
        subject: "New TOBSEYTECH Contact",
        text: `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nService: ${service}\nMessage: ${message}`,
      });
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: "Email failed" });
    }
  });

  // Subscribe endpoint
  app.post("/api/subscribe", async (req, res) => {
    const { email } = req.body || {};
    if (!email) {
      res.status(400).json({ error: "Email required" });
      return;
    }
    // TODO: integrate with database or Mailchimp
    res.status(200).json({ ok: true });
  });

  // ─── Product routes ───────────────────────────────────────────────────────

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  // ─── Course routes ────────────────────────────────────────────────────────

  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/featured", async (req, res) => {
    try {
      const courses = await storage.getFeaturedCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        res.status(404).json({ message: "Course not found" });
        return;
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid course data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create course" });
      }
    }
  });

  const httpServer = createServer(app);

  // ─── WebSocket server for real-time chat ─────────────────────────────────

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    let userId: string | null = null;

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "auth" && msg.userId) {
          userId = String(msg.userId);
          if (!wsClients.has(userId)) wsClients.set(userId, new Set());
          wsClients.get(userId)!.add(ws);
          ws.send(JSON.stringify({ type: "auth_ok" }));
        }
      } catch {
        // ignore parse errors
      }
    });

    ws.on("close", () => {
      if (userId) {
        const clients = wsClients.get(userId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) wsClients.delete(userId);
        }
      }
    });
  });

  return httpServer;
}

