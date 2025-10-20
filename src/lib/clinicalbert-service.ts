import { ClinicalBERTResponse } from '@/types';

// Mock ClinicalBERT service - in production this would connect to a real ClinicalBERT API
export class ClinicalBERTService {
  private static instance: ClinicalBERTService;
  
  private constructor() {}
  
  public static getInstance(): ClinicalBERTService {
    if (!ClinicalBERTService.instance) {
      ClinicalBERTService.instance = new ClinicalBERTService();
    }
    return ClinicalBERTService.instance;
  }
  
  async analyzeClinicalNotes(notes: string): Promise<ClinicalBERTResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis based on keywords in the notes
    const detectedConditions: string[] = [];
    const notesLower = notes.toLowerCase();
    
    // Cardiovascular conditions
    const cardiovascularKeywords = {
      'Cardiac Failure': ['heart failure', 'cardiac failure', 'congestive heart failure', 'chf', 'left ventricular failure'],
      'Cardiomyopathy': ['cardiomyopathy', 'dilated cardiomyopathy', 'hypertrophic cardiomyopathy'],
      'Coronary Artery Disease': ['coronary artery disease', 'cad', 'angina', 'myocardial infarction', 'heart attack'],
      'Dysrhythmias': ['atrial fibrillation', 'afib', 'ventricular tachycardia', 'arrhythmia', 'irregular heartbeat'],
      'Haemophilia': ['haemophilia', 'hemophilia', 'factor viii deficiency', 'factor ix deficiency'],
      'Hyperlipidaemia': ['hyperlipidemia', 'high cholesterol', 'elevated lipids', 'dyslipidemia'],
      'Hypertension': ['hypertension', 'high blood pressure', 'elevated blood pressure', 'htn']
    };
    
    // Endocrine conditions
    const endocrineKeywords = {
      'Diabetes Insipidus': ['diabetes insipidus', 'di', 'vasopressin deficiency'],
      'Diabetes Mellitus Type 1': ['diabetes mellitus type 1', 'type 1 diabetes', 'insulin dependent diabetes', 't1dm'],
      'Diabetes Mellitus Type 2': ['diabetes mellitus type 2', 'type 2 diabetes', 'non-insulin dependent diabetes', 't2dm', 'diabetes']
    };
    
    // Check for cardiovascular conditions
    Object.entries(cardiovascularKeywords).forEach(([condition, keywords]) => {
      if (keywords.some(keyword => notesLower.includes(keyword))) {
        detectedConditions.push(condition);
      }
    });
    
    // Check for endocrine conditions
    Object.entries(endocrineKeywords).forEach(([condition, keywords]) => {
      if (keywords.some(keyword => notesLower.includes(keyword))) {
        detectedConditions.push(condition);
      }
    });
    
    // If no conditions detected, add a generic one for demo
    if (detectedConditions.length === 0) {
      detectedConditions.push('Hypertension'); // Default fallback
    }
    
    return {
      detectedConditions,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      processingTime: 2000
    };
  }
  
  async validateCondition(condition: string, notes: string): Promise<boolean> {
    // Mock validation - in production this would use the actual ClinicalBERT model
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const notesLower = notes.toLowerCase();
    const conditionLower = condition.toLowerCase();
    
    // Simple keyword matching for validation
    return notesLower.includes(conditionLower) || 
           notesLower.includes(conditionLower.replace(' ', '')) ||
           notesLower.includes(conditionLower.replace(' ', '-'));
  }
}

// Export singleton instance
export const clinicalBERTService = ClinicalBERTService.getInstance();
