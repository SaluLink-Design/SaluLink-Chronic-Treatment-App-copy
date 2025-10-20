import { supabase } from './supabase-client';
import { ICDCode, Treatment, Medicine, CaseData } from '@/types';

export interface SavedCase {
  id: string;
  patientNotes: string;
  detectedConditions: string[];
  analysisConfidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedTreatment {
  id: string;
  caseId: string;
  condition: string;
  procedureName: string;
  procedureCode: string;
  basketType: string;
  quantity: number;
  coverageLimit: number;
  evidence: TreatmentEvidence[];
}

export interface TreatmentEvidence {
  type: 'note' | 'file';
  content: string;
  fileName?: string;
}

export interface SavedMedicine {
  id: string;
  caseId: string;
  condition: string;
  medicineClass: string;
  medicineName: string;
  activeIngredient: string;
  cdaCore: number;
  cdaExecutive: number;
  planType: string;
  prescriptionNotes: string;
  motivation: string;
}

export class CaseService {
  async saveCase(data: {
    patientNotes: string;
    detectedConditions: string[];
    analysisConfidence: number;
    icdCodes: ICDCode[];
    treatments: any[];
    medicines: any[];
  }): Promise<string> {
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .insert({
        patient_notes: data.patientNotes,
        detected_conditions: data.detectedConditions,
        analysis_confidence: data.analysisConfidence,
        updated_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (caseError || !caseData) {
      throw new Error('Failed to save case: ' + caseError?.message);
    }

    const caseId = caseData.id;

    if (data.icdCodes.length > 0) {
      const { error: icdError } = await supabase
        .from('case_icd_codes')
        .insert(
          data.icdCodes.map(icd => ({
            case_id: caseId,
            icd_code: icd.code,
            description: icd.description,
            condition: icd.condition
          }))
        );

      if (icdError) {
        throw new Error('Failed to save ICD codes: ' + icdError.message);
      }
    }

    if (data.treatments.length > 0) {
      const { error: treatmentError } = await supabase
        .from('case_treatments')
        .insert(
          data.treatments.map(treatment => ({
            case_id: caseId,
            condition: treatment.condition,
            procedure_name: treatment.procedureName,
            procedure_code: treatment.procedureCode,
            basket_type: treatment.basketType,
            quantity: treatment.quantity,
            coverage_limit: treatment.coverageLimit
          }))
        );

      if (treatmentError) {
        throw new Error('Failed to save treatments: ' + treatmentError.message);
      }

      for (const treatment of data.treatments) {
        if (treatment.evidence && treatment.evidence.length > 0) {
          const { data: treatmentData } = await supabase
            .from('case_treatments')
            .select('id')
            .eq('case_id', caseId)
            .eq('procedure_code', treatment.procedureCode)
            .maybeSingle();

          if (treatmentData) {
            for (const evidence of treatment.evidence) {
              await supabase.from('case_evidence').insert({
                case_id: caseId,
                treatment_id: treatmentData.id,
                evidence_type: evidence.type,
                file_name: evidence.fileName || 'Note',
                notes: evidence.type === 'note' ? evidence.content : null,
                file_url: evidence.type === 'file' ? evidence.content : null
              });
            }
          }
        }
      }
    }

    if (data.medicines.length > 0) {
      const { error: medicineError } = await supabase
        .from('case_medicines')
        .insert(
          data.medicines.map(medicine => ({
            case_id: caseId,
            condition: medicine.condition,
            medicine_class: medicine.medicineClass,
            medicine_name: medicine.medicineName,
            active_ingredient: medicine.activeIngredient,
            cda_core: medicine.cdaCore,
            cda_executive: medicine.cdaExecutive,
            plan_type: medicine.planType?.name || '',
            prescription_notes: '',
            motivation: medicine.motivation || ''
          }))
        );

      if (medicineError) {
        throw new Error('Failed to save medicines: ' + medicineError.message);
      }
    }

    return caseId;
  }

  async getAllCases(): Promise<SavedCase[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch cases: ' + error.message);
    }

    return data.map(row => ({
      id: row.id,
      patientNotes: row.patient_notes,
      detectedConditions: row.detected_conditions || [],
      analysisConfidence: row.analysis_confidence,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getCaseById(caseId: string): Promise<{
    case: SavedCase;
    icdCodes: ICDCode[];
    treatments: SavedTreatment[];
    medicines: SavedMedicine[];
  }> {
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .maybeSingle();

    if (caseError || !caseData) {
      throw new Error('Failed to fetch case: ' + caseError?.message);
    }

    const { data: icdData } = await supabase
      .from('case_icd_codes')
      .select('*')
      .eq('case_id', caseId);

    const { data: treatmentData } = await supabase
      .from('case_treatments')
      .select('*')
      .eq('case_id', caseId);

    const { data: medicineData } = await supabase
      .from('case_medicines')
      .select('*')
      .eq('case_id', caseId);

    const treatments: SavedTreatment[] = [];
    if (treatmentData) {
      for (const treatment of treatmentData) {
        const { data: evidenceData } = await supabase
          .from('case_evidence')
          .select('*')
          .eq('treatment_id', treatment.id);

        const evidence = evidenceData?.map(e => ({
          type: e.evidence_type as 'note' | 'file',
          content: e.notes || e.file_url || '',
          fileName: e.file_name
        })) || [];

        treatments.push({
          id: treatment.id,
          caseId: treatment.case_id,
          condition: treatment.condition,
          procedureName: treatment.procedure_name,
          procedureCode: treatment.procedure_code,
          basketType: treatment.basket_type,
          quantity: treatment.quantity,
          coverageLimit: treatment.coverage_limit,
          evidence
        });
      }
    }

    return {
      case: {
        id: caseData.id,
        patientNotes: caseData.patient_notes,
        detectedConditions: caseData.detected_conditions || [],
        analysisConfidence: caseData.analysis_confidence,
        createdAt: caseData.created_at,
        updatedAt: caseData.updated_at
      },
      icdCodes: icdData?.map(icd => ({
        code: icd.icd_code,
        description: icd.description,
        condition: icd.condition
      })) || [],
      treatments,
      medicines: medicineData?.map(med => ({
        id: med.id,
        caseId: med.case_id,
        condition: med.condition,
        medicineClass: med.medicine_class,
        medicineName: med.medicine_name,
        activeIngredient: med.active_ingredient,
        cdaCore: med.cda_core,
        cdaExecutive: med.cda_executive,
        planType: med.plan_type,
        prescriptionNotes: med.prescription_notes,
        motivation: med.motivation
      })) || []
    };
  }

  async deleteCase(caseId: string): Promise<void> {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', caseId);

    if (error) {
      throw new Error('Failed to delete case: ' + error.message);
    }
  }
}

export const caseService = new CaseService();
