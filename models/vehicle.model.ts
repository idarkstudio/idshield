// =========================
// COMMON TYPES (Enums/Structs)
// =========================
export type InsuranceStatus = "Unpaid" | "Paid";
export type InsuranceType = "FullCoverage" | "ThirdParty" | "CivilLiability";

export interface VehicleRecord {
  insuranceStatus: InsuranceStatus;
  insuranceType: InsuranceType;
  insurancePaidDate: bigint; // Uint64
}
// =========================
// VEHICLES — circuits
// =========================
export interface VehicleMethods {
  registerVehicle(args: {
    status: InsuranceStatus;
    insType: InsuranceType;
    paidDate: bigint; // Uint64
  }): Promise<void>;

  canDrive(): Promise<boolean>;

  viewVehicle(): Promise<VehicleRecord>;
}

// Datos mínimos para registrar un vehículo
export interface IVehicleInput {
  brand: string;
  model: string;
  year: number;
}

// Representación completa de un vehículo en el sistema
export interface IVehicle {
  id: string; // Identificador único del vehículo
  owner: string; // Principal o ID del usuario que lo registró
  brand: string;
  model: string;
  year: number;
  registeredAt: string; // Fecha de registro en formato ISO
}
