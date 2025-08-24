import { Genre } from "./common.model";

// =========================
// COMMON TYPES (Enums/Structs)
// =========================
export type MedicalCoverage = "SocialSecurity" | "Private" | "None";
export type BloodType = "A_Pos" | "A_Neg" | "B_Pos" | "B_Neg" | "AB_Pos" | "AB_Neg" | "O_Pos" | "O_Neg";
export type SpecialistType = "General" | "Cardiologist" | "Dermatologist" | "Other";

export interface ClinicalRecord {
  genre: Genre;
  fullName: string;
  medicalCoverage: MedicalCoverage;
  bloodType: BloodType;
}

// =========================
// MEDICAL — circuits
// =========================
export interface MedicalMethods {
  registerClinicalHistory(args: {
    genre: Genre;
    fullName: string; // Opaque<string>
    medicalCoverage: MedicalCoverage;
    bloodType: BloodType;
  }): Promise<void>;

  addConsultation(args: {
    professionalId: string; // Opaque<string>
    date: bigint; // Uint64
    result: string; // Opaque<string>
    specialistType: SpecialistType;
  }): Promise<void>;

  viewClinicalHistory(): Promise<ClinicalRecord>;

  canDonate(args: { target: BloodType }): Promise<boolean>;
  canReceive(args: { from: BloodType }): Promise<boolean>;
}

export interface IConsultation {
  id: string;
  date: string; // ISO date string
  doctor: string;
  notes: string;
  diagnosis?: string;
  treatment?: string;
}

export interface IClinicalHistory {
  patientId: string;
  histories: {
    id: string;
    createdAt: string; // ISO date string
    details: string;
    consultations: IConsultation[];
  }[];
}

export interface INewClinicalHistory {
  details: string;
}

export interface INewConsultation {
  date: string; // ISO date string
  doctor: string;
  notes: string;
  diagnosis?: string;
  treatment?: string;
}
