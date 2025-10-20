// Types for the SaluLink Chronic Treatment App

export interface Condition {
  name: string;
  icdCode: string;
  description: string;
  category: 'cardiovascular' | 'endocrine';
}

export interface Treatment {
  condition: string;
  procedureName: string;
  procedureCode: string;
  coverageLimit: number;
  basketType: 'diagnostic' | 'ongoing_management';
}

export interface Medicine {
  condition: string;
  medicineClass: string;
  activeIngredient: string;
  medicineName: string;
  strength: string;
  cdaCore: number;
  cdaExecutive: number;
  planExclusions?: string[];
}

export interface ICDCode {
  code: string;
  description: string;
  condition: string;
}

export interface CaseData {
  id: string;
  patientNotes: string;
  detectedConditions: string[];
  selectedICDCodes: ICDCode[];
  selectedTreatments: Treatment[];
  selectedMedicines: Medicine[];
  evidenceFiles: File[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicalBERTResponse {
  detectedConditions: string[];
  confidence: number;
  processingTime: number;
}

export interface AuthiResponse {
  icdCodes: ICDCode[];
  treatments: Treatment[];
  medicines: Medicine[];
  complianceStatus: 'compliant' | 'non_compliant' | 'requires_review';
}

export interface PlanType {
  id: string;
  name: string;
  category: 'core' | 'priority' | 'saver' | 'executive' | 'comprehensive';
}

export interface EvidenceFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'note';
  content: string | File;
  treatmentId?: string;
  medicineId?: string;
}

export interface PrescriptionNote {
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  motivation?: string; // Required for excluded medicines
}

export interface PMBComplianceReport {
  caseId: string;
  originalNotes: string;
  conditions: string[];
  icdCodes: ICDCode[];
  treatments: Treatment[];
  medicines: Medicine[];
  evidence: EvidenceFile[];
  prescriptions: PrescriptionNote[];
  complianceStatus: string;
  generatedAt: Date;
}

export interface ClaimDocument {
  originalNote: string;
  confirmedConditions: string[];
  selectedIcdCodes: ICDCode[];
  diagnosticTreatments: any[];
  managementTreatments: any[];
  medicineSelections: any[];
}
