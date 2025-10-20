import { AuthiResponse, ICDCode, Treatment, Medicine, PlanType } from '@/types';
import { loadICDCodes, loadTreatments, loadMedicines } from './data-loader';

export class AuthiService {
  private static instance: AuthiService;
  private icdCodes: ICDCode[] = [];
  private treatments: Treatment[] = [];
  private medicines: Medicine[] = [];
  
  private constructor() {}
  
  public static getInstance(): AuthiService {
    if (!AuthiService.instance) {
      AuthiService.instance = new AuthiService();
    }
    return AuthiService.instance;
  }
  
  async initialize(): Promise<void> {
    // Load all data on initialization
    this.icdCodes = await loadICDCodes();
    this.treatments = await loadTreatments();
    this.medicines = await loadMedicines();
  }
  
  async getICDCodesForCondition(condition: string): Promise<ICDCode[]> {
    await this.initialize();
    return this.icdCodes.filter(icd => 
      icd.condition.toLowerCase().includes(condition.toLowerCase()) ||
      condition.toLowerCase().includes(icd.condition.toLowerCase())
    );
  }
  
  async getTreatmentsForCondition(condition: string): Promise<Treatment[]> {
    await this.initialize();
    return this.treatments.filter(treatment => 
      treatment.condition.toLowerCase().includes(condition.toLowerCase()) ||
      condition.toLowerCase().includes(treatment.condition.toLowerCase())
    );
  }
  
  async getMedicinesForCondition(condition: string, planType?: PlanType): Promise<Medicine[]> {
    await this.initialize();
    let medicines = this.medicines.filter(medicine => 
      medicine.condition.toLowerCase().includes(condition.toLowerCase()) ||
      condition.toLowerCase().includes(medicine.condition.toLowerCase())
    );
    
    // Filter by plan type if specified
    if (planType) {
      medicines = medicines.filter(medicine => {
        if (!medicine.planExclusions) return true;
        return !medicine.planExclusions.includes(planType.category);
      });
    }
    
    return medicines;
  }
  
  async validatePMBCompliance(
    condition: string,
    selectedICDCodes: ICDCode[],
    selectedTreatments: Treatment[],
    selectedMedicines: Medicine[]
  ): Promise<AuthiResponse> {
    await this.initialize();
    
    // Get available options for the condition
    const availableICDCodes = await this.getICDCodesForCondition(condition);
    const availableTreatments = await this.getTreatmentsForCondition(condition);
    const availableMedicines = await this.getMedicinesForCondition(condition);
    
    // Check compliance
    const icdCompliance = selectedICDCodes.every(selected => 
      availableICDCodes.some(available => available.code === selected.code)
    );
    
    const treatmentCompliance = selectedTreatments.every(selected => 
      availableTreatments.some(available => 
        available.procedureCode === selected.procedureCode &&
        available.basketType === selected.basketType
      )
    );
    
    const medicineCompliance = selectedMedicines.every(selected => 
      availableMedicines.some(available => 
        available.medicineName === selected.medicineName
      )
    );
    
    let complianceStatus: 'compliant' | 'non_compliant' | 'requires_review' = 'compliant';
    
    if (!icdCompliance || !treatmentCompliance || !medicineCompliance) {
      complianceStatus = 'non_compliant';
    } else if (selectedMedicines.some(med => med.planExclusions && med.planExclusions.length > 0)) {
      complianceStatus = 'requires_review';
    }
    
    return {
      icdCodes: availableICDCodes,
      treatments: availableTreatments,
      medicines: availableMedicines,
      complianceStatus
    };
  }
  
  async generateTreatmentBasket(condition: string): Promise<{
    diagnostic: Treatment[];
    ongoingManagement: Treatment[];
  }> {
    const treatments = await this.getTreatmentsForCondition(condition);
    
    return {
      diagnostic: treatments.filter(t => t.basketType === 'diagnostic'),
      ongoingManagement: treatments.filter(t => t.basketType === 'ongoing_management')
    };
  }
  
  async getMedicineClasses(condition: string): Promise<string[]> {
    const medicines = await this.getMedicinesForCondition(condition);
    return [...new Set(medicines.map(med => med.medicineClass))];
  }
  
  async getPlanTypes(): Promise<PlanType[]> {
    return [
      { id: 'core', name: 'Core Plans', category: 'core' },
      { id: 'priority', name: 'Priority Plans', category: 'priority' },
      { id: 'saver', name: 'Saver Plans', category: 'saver' },
      { id: 'executive', name: 'Executive Plans', category: 'executive' },
      { id: 'comprehensive', name: 'Comprehensive Plans', category: 'comprehensive' }
    ];
  }
  
  async calculateCDA(medicine: Medicine, planType: PlanType): Promise<number> {
    switch (planType.category) {
      case 'core':
      case 'priority':
      case 'saver':
        return medicine.cdaCore;
      case 'executive':
      case 'comprehensive':
        return medicine.cdaExecutive;
      default:
        return medicine.cdaCore;
    }
  }
  
  async checkMedicineExclusions(medicine: Medicine, planType: PlanType): Promise<boolean> {
    if (!medicine.planExclusions) return false;
    return medicine.planExclusions.includes(planType.category);
  }
}

// Export singleton instance
export const authiService = AuthiService.getInstance();
