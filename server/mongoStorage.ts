import { randomUUID } from "crypto";
import type {
  User,
  InsertUser,
  Contact,
  InsertContact,
  Product,
  InsertProduct,
  Course,
  InsertCourse,
  BlogPost,
  InsertBlogPost,
  UpdateBlogPost,
} from "@shared/schema";
import { UserModel } from "./models/User";
import { ContactModel } from "./models/Contact";
import { ProductModel } from "./models/Product";
import { CourseModel } from "./models/Course";
import { BlogPostModel } from "./models/BlogPost";

function docToUser(doc: any): User {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    password: doc.password,
    role: doc.role,
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

export class MongoStorage {
  // ─── User methods ────────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
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
}
