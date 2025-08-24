import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { 
  insertAccessRequestSchema,
  insertAuditLogSchema,
  insertZKProofSchema,
  insertMedicalFormTokenSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const demoUserId = "demo-user-123";

  // Profile update endpoint
  app.patch("/api/profile", async (req, res) => {
    try {
      const { fullName, email, phone, location, bio, userType } = req.body;
      
      // Validate required fields
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({ message: "Full name is required and must be at least 2 characters" });
      }
      
      // Update user profile
      const updateData: any = {
        fullName: fullName.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        location: location?.trim() || null,
        bio: bio?.trim() || null,
        updatedAt: new Date(),
      };
      
      if (userType && (userType === "citizen" || userType === "police")) {
        updateData.userType = userType;
      }
      
      const updatedUser = await storage.updateUser(demoUserId, updateData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: demoUserId,
        action: "profile_updated",
        description: "Profile information updated",
        entityName: null,
        privacyLevel: 1,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Dashboard data endpoint
  app.get("/api/dashboard", async (req, res) => {
    try {
      const user = await storage.getUser(demoUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const [vaultItems, accessRequests, auditLogs, zkProofs] = await Promise.all([
        storage.getVaultItems(demoUserId),
        storage.getAccessRequests(demoUserId),
        storage.getAuditLogs(demoUserId, 5),
        storage.getZKProofs(demoUserId),
      ]);

      res.json({
        user,
        vaultItems,
        accessRequests,
        auditLogs,
        zkProofs,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Access requests endpoints
  app.get("/api/access-requests", async (req, res) => {
    try {
      const requests = await storage.getAccessRequests(demoUserId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/access-requests/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRequest = await storage.updateAccessRequestStatus(id, "approved");
      
      // Create audit log
      await storage.createAuditLog({
        userId: demoUserId,
        action: "access_granted",
        description: `Access granted to ${updatedRequest.requesterName}`,
        entityName: updatedRequest.requesterName,
        privacyLevel: updatedRequest.privacyLevel,
      });

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/access-requests/:id/deny", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRequest = await storage.updateAccessRequestStatus(id, "denied");
      
      // Create audit log
      await storage.createAuditLog({
        userId: demoUserId,
        action: "access_denied",
        description: `Access denied to ${updatedRequest.requesterName}`,
        entityName: updatedRequest.requesterName,
        privacyLevel: updatedRequest.privacyLevel,
      });

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/access-requests/:id/revoke", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRequest = await storage.updateAccessRequestStatus(id, "revoked");
      
      // Create audit log
      await storage.createAuditLog({
        userId: demoUserId,
        action: "access_revoked",
        description: `Access revoked from ${updatedRequest.requesterName}`,
        entityName: updatedRequest.requesterName,
        privacyLevel: updatedRequest.privacyLevel,
      });

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Grant access endpoint
  app.post("/api/grant-access", async (req, res) => {
    try {
      const validatedData = insertAccessRequestSchema.parse({
        ...req.body,
        userId: demoUserId,
        status: "approved",
      });

      const request = await storage.createAccessRequest(validatedData);
      await storage.updateAccessRequestStatus(request.id, "approved");

      // Create audit log
      await storage.createAuditLog({
        userId: demoUserId,
        action: "access_granted",
        description: `Access granted to ${request.requesterName}`,
        entityName: request.requesterName,
        privacyLevel: request.privacyLevel,
      });

      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // ZK Proof generation endpoint
  app.post("/api/generate-proof", async (req, res) => {
    try {
      const validatedData = insertZKProofSchema.parse({
        ...req.body,
        userId: demoUserId,
      });

      const proof = await storage.createZKProof(validatedData);

      // Create audit log
      await storage.createAuditLog({
        userId: demoUserId,
        action: "zk_proof_generated",
        description: `ZK Proof generated for ${proof.proofType}`,
        entityName: null,
        privacyLevel: 2,
      });

      res.json(proof);
    } catch (error) {
      res.status(400).json({ message: "Invalid proof data" });
    }
  });

  // ZK Proof verification endpoint
  app.get("/api/verify-proof/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const proof = await storage.getZKProof(id);
      
      if (!proof) {
        return res.json({ 
          valid: false, 
          error: "Proof not found or may have expired" 
        });
      }

      // Check if proof has expired (if expiration was set)
      if (proof.attributes?.expiresInDays && proof.attributes.expiresInDays > 0) {
        const createdDate = new Date(proof.createdAt);
        const expirationDate = new Date(createdDate.getTime() + (proof.attributes.expiresInDays * 24 * 60 * 60 * 1000));
        
        if (new Date() > expirationDate) {
          return res.json({ 
            valid: false, 
            error: "This proof has expired and is no longer valid" 
          });
        }
      }

      res.json({ 
        valid: true, 
        proof: {
          id: proof.id,
          proofType: proof.proofType,
          proofResult: proof.proofResult,
          createdAt: proof.createdAt,
          attributes: proof.attributes
        }
      });
    } catch (error) {
      res.status(500).json({ 
        valid: false, 
        error: "Failed to verify proof" 
      });
    }
  });

  // Update privacy level endpoint
  app.patch("/api/user/privacy-level", async (req, res) => {
    try {
      const { privacyLevel } = req.body;
      if (typeof privacyLevel !== 'number' || privacyLevel < 0 || privacyLevel > 6) {
        return res.status(400).json({ message: "Privacy level must be between 0 and 6" });
      }

      const updatedUser = await storage.updateUser(demoUserId, { privacyLevel });
      
      // Create audit log
      await storage.createAuditLog({
        userId: demoUserId,
        action: "privacy_level_updated",
        description: `Privacy level updated to ${privacyLevel}`,
        entityName: null,
        privacyLevel,
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Audit logs endpoint
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const logs = await storage.getAuditLogs(demoUserId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings update endpoint
  app.patch("/api/settings", async (req, res) => {
    try {
      const { 
        emailNotifications, 
        pushNotifications, 
        securityAlerts, 
        privacyLevel, 
        twoFactorAuth,
        dataRetention,
        autoLogout 
      } = req.body;

      // Update user privacy level if provided
      if (typeof privacyLevel === 'number' && privacyLevel >= 0 && privacyLevel <= 6) {
        await storage.updateUser(demoUserId, { privacyLevel });
        
        // Create audit log for privacy level change
        await storage.createAuditLog({
          userId: demoUserId,
          action: "privacy_level_updated",
          description: `Privacy level updated to ${privacyLevel}`,
          entityName: null,
          privacyLevel,
        });
      }

      // Create audit log for settings update
      await storage.createAuditLog({
        userId: demoUserId,
        action: "settings_updated",
        description: "Account settings have been updated",
        entityName: null,
        privacyLevel: 1,
      });

      res.json({ 
        success: true, 
        message: "Settings updated successfully",
        settings: {
          emailNotifications,
          pushNotifications,
          securityAlerts,
          privacyLevel,
          twoFactorAuth,
          dataRetention,
          autoLogout
        }
      });
    } catch (error) {
      console.error("Settings update error:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Object storage endpoints
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Upload URL generation error:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Medical Form Token endpoints
  app.post("/api/medical-form-tokens", async (req, res) => {
    console.log("=== MEDICAL FORM TOKEN CREATION START ===");
    console.log("Request body:", req.body);
    try {
      const parsedToken = insertMedicalFormTokenSchema.parse(req.body);
      console.log("Parsed token:", parsedToken);
      const createdToken = await storage.createMedicalFormToken(parsedToken);
      console.log("Created token object:", createdToken);
      const response = { 
        success: true,
        token: createdToken.token,
        id: createdToken.id,
        expiresAt: createdToken.expiresAt
      };
      console.log("Sending response:", response);
      res.json(response);
      console.log("=== MEDICAL FORM TOKEN CREATION END ===");
    } catch (error) {
      console.error("Medical form token creation error:", error);
      res.status(500).json({ message: "Failed to create medical form token" });
    }
  });

  app.get("/api/medical-form-tokens/:userId", async (req, res) => {
    try {
      const tokens = await storage.getMedicalFormTokens(req.params.userId);
      res.json(tokens);
    } catch (error) {
      console.error("Medical form tokens fetch error:", error);
      res.status(500).json({ message: "Failed to fetch medical form tokens" });
    }
  });

  app.get("/api/medical-form/:token", async (req, res) => {
    try {
      const formToken = await storage.getMedicalFormTokenByToken(req.params.token);
      if (!formToken) {
        return res.status(404).json({ message: "Form not found" });
      }
      if (formToken.isUsed) {
        return res.status(410).json({ message: "Form has already been completed" });
      }
      if (new Date() > formToken.expiresAt) {
        return res.status(410).json({ message: "Form has expired" });
      }
      res.json(formToken);
    } catch (error) {
      console.error("Medical form fetch error:", error);
      res.status(500).json({ message: "Failed to fetch medical form" });
    }
  });

  app.post("/api/medical-form/:token/complete", async (req, res) => {
    try {
      const formToken = await storage.getMedicalFormTokenByToken(req.params.token);
      if (!formToken) {
        return res.status(404).json({ message: "Form not found" });
      }
      if (formToken.isUsed) {
        return res.status(410).json({ message: "Form has already been completed" });
      }
      if (new Date() > formToken.expiresAt) {
        return res.status(410).json({ message: "Form has expired" });
      }

      const updatedToken = await storage.updateMedicalFormToken(formToken.id, {
        isUsed: true,
        completedAt: new Date(),
        formData: req.body.formData,
        doctorWalletAddress: req.body.doctorWalletAddress,
        doctorName: req.body.doctorName,
      });

      // Create the vault item for the patient
      const vaultItemData = {
        userId: formToken.userId,
        category: "health",
        name: `${formToken.appointmentType} - ${req.body.doctorName}`,
        privacyLevel: 0, // Maximum security for medical data
        data: {
          type: "medical_appointment",
          appointmentType: formToken.appointmentType,
          doctorName: req.body.doctorName,
          doctorWalletAddress: req.body.doctorWalletAddress,
          completedAt: new Date().toISOString(),
          formData: req.body.formData,
        },
      };

      const vaultItem = await storage.createVaultItem(vaultItemData);

      res.json({ success: true, vaultItem, token: updatedToken });
    } catch (error) {
      console.error("Medical form completion error:", error);
      res.status(500).json({ message: "Failed to complete medical form" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
