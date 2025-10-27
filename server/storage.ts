import { 
  type Post, 
  type InsertPost,
  type ScheduleSettings,
  type InsertScheduleSettings,
  type AutomationSettings,
  type InsertAutomationSettings,
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private posts: Map<string, Post>;
  private scheduleSettings: ScheduleSettings | undefined;
  private automationSettings: AutomationSettings | undefined;

  constructor() {
    this.posts = new Map();
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
}

export const storage = new MemStorage();
