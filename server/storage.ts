import { 
  type Post, 
  type InsertPost,
  type ScheduleSettings,
  type InsertScheduleSettings,
  type AutomationSettings,
  type InsertAutomationSettings,
  type ConnectedAccount,
  type InsertConnectedAccount,
  posts,
  scheduleSettings,
  automationSettings,
  connectedAccounts,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getPosts(): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  
  getScheduleSettings(): Promise<ScheduleSettings | undefined>;
  saveScheduleSettings(settings: InsertScheduleSettings): Promise<ScheduleSettings>;
  
  getAutomationSettings(): Promise<AutomationSettings | undefined>;
  saveAutomationSettings(settings: Partial<InsertAutomationSettings>): Promise<AutomationSettings>;
  
  getConnectedAccounts(): Promise<ConnectedAccount[]>;
  getConnectedAccount(id: string): Promise<ConnectedAccount | undefined>;
  createConnectedAccount(account: InsertConnectedAccount): Promise<ConnectedAccount>;
  updateConnectedAccount(id: string, account: Partial<InsertConnectedAccount>): Promise<ConnectedAccount | undefined>;
  deleteConnectedAccount(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private posts: Map<string, Post>;
  private scheduleSettings: ScheduleSettings | undefined;
  private automationSettings: AutomationSettings | undefined;
  private connectedAccounts: Map<string, ConnectedAccount>;

  constructor() {
    this.posts = new Map();
    this.connectedAccounts = new Map();
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort(
      (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      id,
      imageUrl: insertPost.imageUrl,
      caption: insertPost.caption,
      scheduledDate: insertPost.scheduledDate,
      status: insertPost.status || "scheduled",
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;

    const updatedPost: Post = {
      ...post,
      ...updates,
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getScheduleSettings(): Promise<ScheduleSettings | undefined> {
    return this.scheduleSettings;
  }

  async saveScheduleSettings(settings: InsertScheduleSettings): Promise<ScheduleSettings> {
    const saved: ScheduleSettings = {
      id: this.scheduleSettings?.id || randomUUID(),
      selectedDays: settings.selectedDays || [],
      postsPerDay: settings.postsPerDay || 3,
      timeSlots: settings.timeSlots || [],
      updatedAt: new Date(),
    };
    this.scheduleSettings = saved;
    return saved;
  }

  async getAutomationSettings(): Promise<AutomationSettings | undefined> {
    return this.automationSettings;
  }

  async saveAutomationSettings(settings: Partial<InsertAutomationSettings>): Promise<AutomationSettings> {
    const current = this.automationSettings || {
      id: randomUUID(),
      enabled: false,
      profileUrl: null,
      analyzedData: null,
      lastAnalyzedAt: null,
      updatedAt: new Date(),
    };

    const saved: AutomationSettings = {
      ...current,
      ...settings,
      updatedAt: new Date(),
    };
    this.automationSettings = saved;
    return saved;
  }

  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    return Array.from(this.connectedAccounts.values()).sort(
      (a, b) => new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime()
    );
  }

  async getConnectedAccount(id: string): Promise<ConnectedAccount | undefined> {
    return this.connectedAccounts.get(id);
  }

  async createConnectedAccount(insertAccount: InsertConnectedAccount): Promise<ConnectedAccount> {
    const id = randomUUID();
    const account: ConnectedAccount = {
      id,
      platform: insertAccount.platform || "instagram",
      username: insertAccount.username,
      accessToken: insertAccount.accessToken || null,
      refreshToken: insertAccount.refreshToken || null,
      profileUrl: insertAccount.profileUrl || null,
      profileImageUrl: insertAccount.profileImageUrl || null,
      isActive: insertAccount.isActive ?? true,
      connectedAt: new Date(),
      lastSyncedAt: insertAccount.lastSyncedAt || null,
    };
    this.connectedAccounts.set(id, account);
    return account;
  }

  async updateConnectedAccount(id: string, updates: Partial<InsertConnectedAccount>): Promise<ConnectedAccount | undefined> {
    const account = this.connectedAccounts.get(id);
    if (!account) return undefined;

    const updatedAccount: ConnectedAccount = {
      ...account,
      ...updates,
    };
    this.connectedAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteConnectedAccount(id: string): Promise<boolean> {
    return this.connectedAccounts.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    const { db } = require("./db");
    this.db = db;
  }

  async getPosts(): Promise<Post[]> {
    return this.db.select().from(posts).orderBy(posts.scheduledDate);
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await this.db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await this.db.insert(posts).values(insertPost).returning();
    return post;
  }

  async updatePost(id: string, updates: Partial<InsertPost>): Promise<Post | undefined> {
    const [post] = await this.db.update(posts).set(updates).where(eq(posts.id, id)).returning();
    return post || undefined;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await this.db.delete(posts).where(eq(posts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getScheduleSettings(): Promise<ScheduleSettings | undefined> {
    const [settings] = await this.db.select().from(scheduleSettings).limit(1);
    return settings || undefined;
  }

  async saveScheduleSettings(settings: InsertScheduleSettings): Promise<ScheduleSettings> {
    const existing = await this.getScheduleSettings();
    
    if (existing) {
      const [updated] = await this.db
        .update(scheduleSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(scheduleSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await this.db
        .insert(scheduleSettings)
        .values({ ...settings, updatedAt: new Date() })
        .returning();
      return created;
    }
  }

  async getAutomationSettings(): Promise<AutomationSettings | undefined> {
    const [settings] = await this.db.select().from(automationSettings).limit(1);
    return settings || undefined;
  }

  async saveAutomationSettings(settings: Partial<InsertAutomationSettings>): Promise<AutomationSettings> {
    const existing = await this.getAutomationSettings();
    
    if (existing) {
      const [updated] = await this.db
        .update(automationSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(automationSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await this.db
        .insert(automationSettings)
        .values({ ...settings, updatedAt: new Date() })
        .returning();
      return created;
    }
  }

  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    return this.db.select().from(connectedAccounts).orderBy(desc(connectedAccounts.connectedAt));
  }

  async getConnectedAccount(id: string): Promise<ConnectedAccount | undefined> {
    const [account] = await this.db.select().from(connectedAccounts).where(eq(connectedAccounts.id, id));
    return account || undefined;
  }

  async createConnectedAccount(insertAccount: InsertConnectedAccount): Promise<ConnectedAccount> {
    const [account] = await this.db.insert(connectedAccounts).values(insertAccount).returning();
    return account;
  }

  async updateConnectedAccount(id: string, updates: Partial<InsertConnectedAccount>): Promise<ConnectedAccount | undefined> {
    const [account] = await this.db
      .update(connectedAccounts)
      .set(updates)
      .where(eq(connectedAccounts.id, id))
      .returning();
    return account || undefined;
  }

  async deleteConnectedAccount(id: string): Promise<boolean> {
    const result = await this.db.delete(connectedAccounts).where(eq(connectedAccounts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

// Use DatabaseStorage if DATABASE_URL is set, otherwise fallback to MemStorage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
