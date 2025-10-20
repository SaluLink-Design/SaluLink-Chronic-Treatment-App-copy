import { Condition, Treatment, Medicine, ICDCode } from '@/types';

// Load CSV data from public directory
export async function loadConditions(): Promise<Condition[]> {
  try {
    const response = await fetch('/data/Cardiovascular CONDITIONS.csv');
    const cardiovascularText = await response.text();
    
    const response2 = await fetch('/data/Endocrine CONDITIONS.csv');
    const endocrineText = await response2.text();
    
    const conditions: Condition[] = [];
    
    // Parse Cardiovascular conditions
    const cardiovascularLines = cardiovascularText.split('\n').slice(1); // Skip header
    cardiovascularLines.forEach(line => {
      if (line.trim()) {
        const [name, icdCode, description] = line.split(',');
        if (name && icdCode && description) {
          conditions.push({
            name: name.trim(),
            icdCode: icdCode.trim(),
            description: description.trim(),
            category: 'cardiovascular'
          });
        }
      }
    });
    
    // Parse Endocrine conditions
    const endocrineLines = endocrineText.split('\n').slice(1); // Skip header
    endocrineLines.forEach(line => {
      if (line.trim()) {
        const [name, icdCode, description] = line.split(',');
        if (name && icdCode && description) {
          conditions.push({
            name: name.trim(),
            icdCode: icdCode.trim(),
            description: description.trim(),
            category: 'endocrine'
          });
        }
      }
    });
    
    return conditions;
  } catch (error) {
    console.error('Error loading conditions:', error);
    return [];
  }
}

export async function loadTreatments(): Promise<Treatment[]> {
  try {
    const response = await fetch('/data/Cardiovascular TREATMENT.csv');
    const cardiovascularText = await response.text();
    
    const response2 = await fetch('/data/Endocrine TREATMENT.csv');
    const endocrineText = await response2.text();
    
    const treatments: Treatment[] = [];
    
    // Parse Cardiovascular treatments
    const cardiovascularLines = cardiovascularText.split('\n').slice(2); // Skip headers
    cardiovascularLines.forEach(line => {
      if (line.trim()) {
        const parts = line.split(',');
        if (parts.length >= 7) {
          const condition = parts[0]?.trim();
          const procedureName = parts[1]?.trim();
          const procedureCode = parts[2]?.trim();
          const coverageLimit = parseInt(parts[3]?.trim() || '0');
          const ongoingProcedureName = parts[4]?.trim();
          const ongoingProcedureCode = parts[5]?.trim();
          const ongoingCoverageLimit = parseInt(parts[6]?.trim() || '0');
          
          if (condition && procedureName && procedureCode) {
            treatments.push({
              condition,
              procedureName,
              procedureCode,
              coverageLimit,
              basketType: 'diagnostic'
            });
          }
          
          if (condition && ongoingProcedureName && ongoingProcedureCode) {
            treatments.push({
              condition,
              procedureName: ongoingProcedureName,
              procedureCode: ongoingProcedureCode,
              coverageLimit: ongoingCoverageLimit,
              basketType: 'ongoing_management'
            });
          }
        }
      }
    });
    
    // Parse Endocrine treatments
    const endocrineLines = endocrineText.split('\n').slice(2); // Skip headers
    endocrineLines.forEach(line => {
      if (line.trim()) {
        const parts = line.split(',');
        if (parts.length >= 7) {
          const condition = parts[0]?.trim();
          const procedureName = parts[1]?.trim();
          const procedureCode = parts[2]?.trim();
          const coverageLimit = parseInt(parts[3]?.trim() || '0');
          const ongoingProcedureName = parts[4]?.trim();
          const ongoingProcedureCode = parts[5]?.trim();
          const ongoingCoverageLimit = parseInt(parts[6]?.trim() || '0');
          
          if (condition && procedureName && procedureCode) {
            treatments.push({
              condition,
              procedureName,
              procedureCode,
              coverageLimit,
              basketType: 'diagnostic'
            });
          }
          
          if (condition && ongoingProcedureName && ongoingProcedureCode) {
            treatments.push({
              condition,
              procedureName: ongoingProcedureName,
              procedureCode: ongoingProcedureCode,
              coverageLimit: ongoingCoverageLimit,
              basketType: 'ongoing_management'
            });
          }
        }
      }
    });
    
    return treatments;
  } catch (error) {
    console.error('Error loading treatments:', error);
    return [];
  }
}

export async function loadMedicines(): Promise<Medicine[]> {
  try {
    const response = await fetch('/data/Cardiovascular MEDICINE.csv');
    const cardiovascularText = await response.text();
    
    const response2 = await fetch('/data/Endocrine MEDICINE.csv');
    const endocrineText = await response2.text();
    
    const medicines: Medicine[] = [];
    
    // Parse Cardiovascular medicines
    const cardiovascularLines = cardiovascularText.split('\n').slice(1); // Skip header
    cardiovascularLines.forEach(line => {
      if (line.trim()) {
        const parts = line.split(',');
        if (parts.length >= 6) {
          const condition = parts[0]?.trim();
          const cdaCore = parseFloat(parts[1]?.replace('R ', '').replace(',', '') || '0');
          const cdaExecutive = parseFloat(parts[2]?.replace('R ', '').replace(',', '') || '0');
          const medicineClass = parts[3]?.trim();
          const activeIngredient = parts[4]?.trim();
          const medicineName = parts[5]?.trim();
          
          if (condition && medicineClass && activeIngredient && medicineName) {
            medicines.push({
              condition,
              medicineClass,
              activeIngredient,
              medicineName,
              strength: '', // Extract from medicine name if needed
              cdaCore,
              cdaExecutive,
              planExclusions: medicineName.includes('Not available on KeyCare plans') ? ['KeyCare'] : undefined
            });
          }
        }
      }
    });
    
    // Parse Endocrine medicines
    const endocrineLines = endocrineText.split('\n').slice(1); // Skip header
    endocrineLines.forEach(line => {
      if (line.trim()) {
        const parts = line.split(',');
        if (parts.length >= 6) {
          const condition = parts[0]?.trim();
          const cdaCore = parseFloat(parts[1]?.replace('R ', '').replace(',', '') || '0');
          const cdaExecutive = parseFloat(parts[2]?.replace('R ', '').replace(',', '') || '0');
          const medicineClass = parts[3]?.trim();
          const activeIngredient = parts[4]?.trim();
          const medicineName = parts[5]?.trim();
          
          if (condition && medicineClass && activeIngredient && medicineName) {
            medicines.push({
              condition,
              medicineClass,
              activeIngredient,
              medicineName,
              strength: '', // Extract from medicine name if needed
              cdaCore,
              cdaExecutive,
              planExclusions: medicineName.includes('Not available on KeyCare plans') ? ['KeyCare'] : undefined
            });
          }
        }
      }
    });
    
    return medicines;
  } catch (error) {
    console.error('Error loading medicines:', error);
    return [];
  }
}

export async function loadICDCodes(): Promise<ICDCode[]> {
  const conditions = await loadConditions();
  return conditions.map(condition => ({
    code: condition.icdCode,
    description: condition.description,
    condition: condition.name
  }));
}
