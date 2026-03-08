import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
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
        if (!req.isAuthenticated() || user?.role !== "admin") {
          return res.status(404).json({ message: "Post not found" });
        }
      }
      res.json(post);
    } catch {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Get single post by id (admin only)
  app.get("/api/blog/:id", authRateLimiter, requireAdmin, async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Create post (admin only)
  app.post("/api/blog", authRateLimiter, requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const data = insertBlogPostSchema.parse({ ...req.body, authorId: user.id, authorName: user.username });
      const existing = await storage.getBlogPostBySlug(data.slug);
      if (existing) return res.status(409).json({ message: "Slug already exists" });
      const post = await storage.createBlogPost(data);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Update post (admin only)
  app.patch("/api/blog/:id", authRateLimiter, requireAdmin, async (req, res) => {
    try {
      const updates = updateBlogPostSchema.parse(req.body);
      if (updates.slug) {
        const existing = await storage.getBlogPostBySlug(updates.slug);
        if (existing && existing.id !== req.params.id) {
          return res.status(409).json({ message: "Slug already exists" });
        }
      }
      const post = await storage.updateBlogPost(req.params.id, updates);
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  // Delete post (admin only)
  app.delete("/api/blog/:id", authRateLimiter, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteBlogPost(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Post not found" });
      res.json({ ok: true });
    } catch {
      res.status(500).json({ message: "Failed to delete blog post" });
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
  return httpServer;
}

