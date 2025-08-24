import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  location: text("location"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  didAddress: text("did_address").notNull(),
  walletConnected: boolean("wallet_connected").default(true),
  userType: text("user_type").default("citizen"), // citizen, police
  privacyLevel: integer("privacy_level").default(4),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vaultItems = pgTable("vault_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  category: text("category").notNull(), // health, insurance, ids
  name: text("name").notNull(),
  privacyLevel: integer("privacy_level").notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accessRequests = pgTable("access_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  requesterName: text("requester_name").notNull(),
  requesterEmail: text("requester_email").notNull(),
  dataRequested: text("data_requested").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").default("pending"), // pending, approved, denied, revoked
  privacyLevel: integer("privacy_level").notNull(),
  requestDate: timestamp("request_date").defaultNow(),
  responseDate: timestamp("response_date"),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  entityName: text("entity_name"),
  privacyLevel: integer("privacy_level"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const zkProofs = pgTable("zk_proofs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  proofType: text("proof_type").notNull(),
  attributes: jsonb("attributes"),
  proofResult: text("proof_result").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical form tokens for shareable health forms
export const medicalFormTokens = pgTable("medical_form_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  patientName: text("patient_name").notNull(),
  appointmentType: text("appointment_type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  doctorWalletAddress: text("doctor_wallet_address"),
  doctorName: text("doctor_name"),
  completedAt: timestamp("completed_at"),
  formData: jsonb("form_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVaultItemSchema = createInsertSchema(vaultItems).omit({
  id: true,
  createdAt: true,
});

export const insertAccessRequestSchema = createInsertSchema(accessRequests).omit({
  id: true,
  requestDate: true,
  responseDate: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertZKProofSchema = createInsertSchema(zkProofs).omit({
  id: true,
  createdAt: true,
});

export const insertMedicalFormTokenSchema = createInsertSchema(medicalFormTokens).omit({
  id: true,
  createdAt: true,
}).extend({
  expiresAt: z.string().transform((str) => new Date(str)),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type VaultItem = typeof vaultItems.$inferSelect;
export type InsertVaultItem = z.infer<typeof insertVaultItemSchema>;
export type AccessRequest = typeof accessRequests.$inferSelect;
export type InsertAccessRequest = z.infer<typeof insertAccessRequestSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type ZKProof = typeof zkProofs.$inferSelect;
export type InsertZKProof = z.infer<typeof insertZKProofSchema>;
export type MedicalFormToken = typeof medicalFormTokens.$inferSelect;
export type InsertMedicalFormToken = z.infer<typeof insertMedicalFormTokenSchema>;
