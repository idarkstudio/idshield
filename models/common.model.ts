// =========================
// COMMON TYPES (Enums/Structs)

import { BloodType, MedicalMethods } from "./medical.model";
import { VehicleMethods } from "./vehicle.model";

// =========================
export type Genre = "Male" | "Female" | "Other";

// =========================
// WITNESSES (opcionales)
// =========================
export interface CommonWitnesses {
  /** Bytes[32] */
  secretKey(): Promise<Uint8Array>; // length 32
}
export interface MedicalWitnesses {
  getUserBloodType(): Promise<BloodType>;
}

// =========================
// API combinada (opcional)
// =========================
export interface ContractAPI {
  vehicles: VehicleMethods;
  medical: MedicalMethods;
  witnesses?: CommonWitnesses & MedicalWitnesses;
}
