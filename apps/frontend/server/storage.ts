import { 
  type User, 
  type InsertUser, 
  type VaultItem, 
  type InsertVaultItem,
  type AccessRequest,
  type InsertAccessRequest,
  type AuditLog,
  type InsertAuditLog,
  type ZKProof,
  type InsertZKProof,
  type MedicalFormToken,
  type InsertMedicalFormToken
} from "@shared/schema";
import { randomUUID } from "crypto";
import { DatabaseStorage } from "./database-storage";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Vault Items
  getVaultItems(userId: string): Promise<VaultItem[]>;
  getVaultItemsByCategory(userId: string, category: string): Promise<VaultItem[]>;
  createVaultItem(item: InsertVaultItem): Promise<VaultItem>;

  // Access Requests
  getAccessRequests(userId: string): Promise<AccessRequest[]>;
  createAccessRequest(request: InsertAccessRequest): Promise<AccessRequest>;
  updateAccessRequestStatus(id: string, status: string, responseDate?: Date): Promise<AccessRequest>;

  // Audit Logs
  getAuditLogs(userId: string, limit?: number): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  // ZK Proofs
  getZKProofs(userId: string): Promise<ZKProof[]>;
  createZKProof(proof: InsertZKProof): Promise<ZKProof>;
  getZKProof(id: string): Promise<ZKProof | undefined>;

  // Medical Form Tokens
  getMedicalFormTokens(userId: string): Promise<MedicalFormToken[]>;
  getMedicalFormTokenByToken(token: string): Promise<MedicalFormToken | undefined>;
  createMedicalFormToken(token: InsertMedicalFormToken): Promise<MedicalFormToken>;
  updateMedicalFormToken(id: string, updates: Partial<MedicalFormToken>): Promise<MedicalFormToken>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vaultItems: Map<string, VaultItem>;
  private accessRequests: Map<string, AccessRequest>;
  private auditLogs: Map<string, AuditLog>;
  private zkProofs: Map<string, ZKProof>;
  private medicalFormTokens: Map<string, MedicalFormToken>;

  constructor() {
    this.users = new Map();
    this.vaultItems = new Map();
    this.accessRequests = new Map();
    this.auditLogs = new Map();
    this.zkProofs = new Map();
    this.medicalFormTokens = new Map();

    // Initialize with demo user and data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const userId = "demo-user-123";
    const now = new Date();

    // Demo user
    const demoUser: User = {
      id: userId,
      username: "johndoe",
      email: "john.doe@example.com",
      fullName: "John Doe",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      bio: "Privacy advocate and tech enthusiast. Building secure digital identities.",
      profilePicture: null,
      didAddress: "did:cardano:addr1qx2f...8k9p",
      walletConnected: true,
      userType: "police" as string | null, // Set demo user as police to test police features
      privacyLevel: 4,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(userId, demoUser);

    // Demo vault items
    const vaultItems: VaultItem[] = [
      {
        id: randomUUID(),
        userId,
        category: "health",
        name: "Medical History",
        privacyLevel: 6,
        data: { type: "medical_records", allergies: ["peanuts"], conditions: [] },
        createdAt: now,
      },
      {
        id: randomUUID(),
        userId,
        category: "ids",
        name: "Driver's License",
        privacyLevel: 4,
        data: { type: "drivers_license", state: "CA" },
        createdAt: now,
      },
      {
        id: randomUUID(),
        userId,
        category: "insurance",
        name: "Health Insurance",
        privacyLevel: 5,
        data: { type: "health_insurance", provider: "HealthCorp" },
        createdAt: now,
      },
    ];

    vaultItems.forEach(item => this.vaultItems.set(item.id, item));

    // Demo access requests
    const accessRequests: AccessRequest[] = [
      {
        id: randomUUID(),
        userId,
        requesterName: "HealthCorp",
        requesterEmail: "health.corp@example.com",
        dataRequested: "Medical History",
        purpose: "Treatment Planning",
        status: "pending",
        privacyLevel: 5,
        requestDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        responseDate: null,
      },
      {
        id: randomUUID(),
        userId,
        requesterName: "BankCorp",
        requesterEmail: "verify@bankcorp.com",
        dataRequested: "Identity Verification",
        purpose: "Account Opening",
        status: "approved",
        privacyLevel: 2,
        requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        responseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours after request
      },
      {
        id: randomUUID(),
        userId,
        requesterName: "InsureSafe",
        requesterEmail: "claims@insuresafe.com",
        dataRequested: "Medical Records",
        purpose: "Claims Processing",
        status: "denied",
        privacyLevel: 6,
        requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        responseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 1 hour after request
      },
    ];

    accessRequests.forEach(request => this.accessRequests.set(request.id, request));

    // Demo audit logs
    const auditLogs: AuditLog[] = [
      {
        id: randomUUID(),
        userId,
        action: "access_granted",
        description: "Access granted to BankCorp",
        entityName: "BankCorp",
        privacyLevel: 2,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: randomUUID(),
        userId,
        action: "access_request_received",
        description: "New access request from HealthCorp",
        entityName: "HealthCorp",
        privacyLevel: 5,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: randomUUID(),
        userId,
        action: "zk_proof_generated",
        description: "ZK Proof generated for identity verification",
        entityName: null,
        privacyLevel: 2,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: randomUUID(),
        userId,
        action: "access_denied",
        description: "Access denied to InsureSafe",
        entityName: "InsureSafe",
        privacyLevel: 6,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ];

    auditLogs.forEach(log => this.auditLogs.set(log.id, log));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      phone: insertUser.phone || null,
      location: insertUser.location || null,
      bio: insertUser.bio || null,
      profilePicture: insertUser.profilePicture || null,
      walletConnected: insertUser.walletConnected || null,
      privacyLevel: insertUser.privacyLevel || null,
      updatedAt: insertUser.updatedAt || null,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const updatedUser = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getVaultItems(userId: string): Promise<VaultItem[]> {
    return Array.from(this.vaultItems.values()).filter(item => item.userId === userId);
  }

  async getVaultItemsByCategory(userId: string, category: string): Promise<VaultItem[]> {
    return Array.from(this.vaultItems.values()).filter(
      item => item.userId === userId && item.category === category
    );
  }

  async createVaultItem(insertItem: InsertVaultItem): Promise<VaultItem> {
    const id = randomUUID();
    const item: VaultItem = {
      ...insertItem,
      data: insertItem.data || {},
      id,
      createdAt: new Date(),
    };
    this.vaultItems.set(id, item);
    return item;
  }

  async getAccessRequests(userId: string): Promise<AccessRequest[]> {
    return Array.from(this.accessRequests.values())
      .filter(request => request.userId === userId)
      .sort((a, b) => (b.requestDate?.getTime() || 0) - (a.requestDate?.getTime() || 0));
  }

  async createAccessRequest(insertRequest: InsertAccessRequest): Promise<AccessRequest> {
    const id = randomUUID();
    const request: AccessRequest = {
      ...insertRequest,
      status: insertRequest.status || null,
      id,
      requestDate: new Date(),
      responseDate: null,
    };
    this.accessRequests.set(id, request);
    return request;
  }

  async updateAccessRequestStatus(id: string, status: string, responseDate?: Date): Promise<AccessRequest> {
    const existingRequest = this.accessRequests.get(id);
    if (!existingRequest) {
      throw new Error("Access request not found");
    }
    const updatedRequest = { 
      ...existingRequest, 
      status, 
      responseDate: responseDate || new Date() 
    };
    this.accessRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getAuditLogs(userId: string, limit: number = 10): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      ...insertLog,
      privacyLevel: insertLog.privacyLevel || null,
      entityName: insertLog.entityName || null,
      id,
      timestamp: new Date(),
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getZKProofs(userId: string): Promise<ZKProof[]> {
    return Array.from(this.zkProofs.values())
      .filter(proof => proof.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createZKProof(insertProof: InsertZKProof): Promise<ZKProof> {
    const id = randomUUID();
    const proof: ZKProof = {
      ...insertProof,
      attributes: insertProof.attributes || {},
      id,
      createdAt: new Date(),
    };
    this.zkProofs.set(id, proof);
    return proof;
  }

  async getZKProof(id: string): Promise<ZKProof | undefined> {
    return this.zkProofs.get(id);
  }

  // Medical Form Token methods
  async getMedicalFormTokens(userId: string): Promise<MedicalFormToken[]> {
    return Array.from(this.medicalFormTokens.values()).filter(token => token.userId === userId);
  }

  async getMedicalFormTokenByToken(token: string): Promise<MedicalFormToken | undefined> {
    return Array.from(this.medicalFormTokens.values()).find(t => t.token === token);
  }

  async createMedicalFormToken(tokenData: InsertMedicalFormToken): Promise<MedicalFormToken> {
    const id = randomUUID();
    const newToken: MedicalFormToken = {
      ...tokenData,
      id,
      createdAt: new Date(),
      isUsed: null,
      doctorWalletAddress: null,
      doctorName: null,
      completedAt: null,
      formData: null,
    };
    this.medicalFormTokens.set(id, newToken);
    return newToken;
  }

  async updateMedicalFormToken(id: string, updates: Partial<MedicalFormToken>): Promise<MedicalFormToken> {
    const token = this.medicalFormTokens.get(id);
    if (!token) {
      throw new Error("Medical form token not found");
    }
    const updatedToken = { ...token, ...updates };
    this.medicalFormTokens.set(id, updatedToken);
    return updatedToken;
  }
}

// ⚠️  IMPORTANT: DATA STORAGE CONFIGURATION
// 
// Currently using MemStorage - all data is lost when server restarts!
// This is only suitable for development/testing.
//
// For persistent data storage in production:
// 1. Comment out the MemStorage line below
// 2. Uncomment the DatabaseStorage line 
// 3. Run: npm run db:push
// 
// export const storage = new DatabaseStorage();  // <-- Use this for persistent data
export const storage = new MemStorage();           // <-- Currently active (temporary data)
