import { type User, type InsertUser, type Contact, type InsertContact, type Product, type InsertProduct, type Course, type InsertCourse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contacts: Map<string, Contact>;
  private products: Map<string, Product>;
  private courses: Map<string, Course>;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.products = new Map();
    this.courses = new Map();
    
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
      imageUrl: insertCourse.imageUrl || null,
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
}

export const storage = new MemStorage();
