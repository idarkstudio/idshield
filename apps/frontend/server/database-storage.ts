import { users, vaultItems, accessRequests, auditLogs, zkProofs } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import type { 
  User, 
  InsertUser, 
  VaultItem, 
  InsertVaultItem,
  AccessRequest,
  InsertAccessRequest,
  AuditLog,
  InsertAuditLog,
  ZKProof,
  InsertZKProof
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  // Vault Items
  async getVaultItems(userId: string): Promise<VaultItem[]> {
    return await db.select().from(vaultItems).where(eq(vaultItems.userId, userId));
  }

  async getVaultItemsByCategory(userId: string, category: string): Promise<VaultItem[]> {
    return await db
      .select()
      .from(vaultItems)
      .where(eq(vaultItems.userId, userId))
      .where(eq(vaultItems.category, category));
  }

  async createVaultItem(insertItem: InsertVaultItem): Promise<VaultItem> {
    const [item] = await db
      .insert(vaultItems)
      .values(insertItem)
      .returning();
    return item;
  }

  // Access Requests
  async getAccessRequests(userId: string): Promise<AccessRequest[]> {
    return await db
      .select()
      .from(accessRequests)
      .where(eq(accessRequests.userId, userId))
      .orderBy(accessRequests.requestDate);
  }

  async createAccessRequest(insertRequest: InsertAccessRequest): Promise<AccessRequest> {
    const [request] = await db
      .insert(accessRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateAccessRequestStatus(id: string, status: string, responseDate?: Date): Promise<AccessRequest> {
    const [request] = await db
      .update(accessRequests)
      .set({ 
        status, 
        responseDate: responseDate || new Date() 
      })
      .where(eq(accessRequests.id, id))
      .returning();
    
    if (!request) {
      throw new Error("Access request not found");
    }
    return request;
  }

  // Audit Logs
  async getAuditLogs(userId: string, limit: number = 10): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(auditLogs.timestamp)
      .limit(limit);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db
      .insert(auditLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  // ZK Proofs
  async getZKProofs(userId: string): Promise<ZKProof[]> {
    return await db
      .select()
      .from(zkProofs)
      .where(eq(zkProofs.userId, userId))
      .orderBy(zkProofs.createdAt);
  }

  async createZKProof(insertProof: InsertZKProof): Promise<ZKProof> {
    const [proof] = await db
      .insert(zkProofs)
      .values(insertProof)
      .returning();
    return proof;
  }
}