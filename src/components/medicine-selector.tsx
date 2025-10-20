'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertTriangle, Pill, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Medicine, PlanType, ICDCode } from '@/types';
import { authiService } from '@/lib/authi-service';

interface MedicineSelectorProps {
  selectedICDCodes: ICDCode[];
  onMedicinesSelected: (medicines: Medicine[]) => void;
  className?: string;
}

interface SelectedMedicine extends Medicine {
  selected: boolean;
  planType?: PlanType;
  motivation?: string;
}

export function MedicineSelector({ selectedICDCodes, onMedicinesSelected, className }: MedicineSelectorProps) {
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([]);
  const [planTypes, setPlanTypes] = useState<PlanType[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlanTypes();
  }, []);

  useEffect(() => {
    if (selectedICDCodes.length > 0) {
      loadMedicines();
    }
  }, [selectedICDCodes, selectedPlanType]);

  const loadPlanTypes = async () => {
    try {
      const plans = await authiService.getPlanTypes();
      setPlanTypes(plans);
      setSelectedPlanType(plans[0]); // Default to first plan
    } catch (error) {
      console.error('Error loading plan types:', error);
    }
  };

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const allMedicines: Medicine[] = [];
      
      for (const icdCode of selectedICDCodes) {
        const medicines = await authiService.getMedicinesForCondition(
          icdCode.condition, 
          selectedPlanType || undefined
        );
        allMedicines.push(...medicines);
      }
      
      setAvailableMedicines(allMedicines);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineToggle = (medicine: Medicine) => {
    const existingIndex = selectedMedicines.findIndex(m => m.medicineName === medicine.medicineName);
    
    if (existingIndex >= 0) {
      // Remove medicine
      setSelectedMedicines(selectedMedicines.filter((_, index) => index !== existingIndex));
    } else {
      // Add medicine
      setSelectedMedicines([...selectedMedicines, { 
        ...medicine, 
        selected: true, 
        planType: selectedPlanType || undefined 
      }]);
    }
  };

  const handleMotivationChange = (medicine: Medicine, motivation: string) => {
    setSelectedMedicines(selectedMedicines.map(m => {
      if (m.medicineName === medicine.medicineName) {
        return { ...m, motivation };
      }
      return m;
    }));
  };

  const handleConfirm = () => {
    const medicines = selectedMedicines.filter(m => m.selected);
    onMedicinesSelected(medicines);
  };

  const isMedicineSelected = (medicine: Medicine) => {
    return selectedMedicines.some(m => m.medicineName === medicine.medicineName);
  };

  const getMedicineMotivation = (medicine: Medicine) => {
    const selected = selectedMedicines.find(m => m.medicineName === medicine.medicineName);
    return selected ? selected.motivation : '';
  };

  const getCDA = (medicine: Medicine) => {
    if (!selectedPlanType) return medicine.cdaCore;
    return authiService.calculateCDA(medicine, selectedPlanType);
  };

  const isExcluded = (medicine: Medicine) => {
    if (!selectedPlanType) return false;
    return authiService.checkMedicineExclusions(medicine, selectedPlanType);
  };

  const groupedMedicines = availableMedicines.reduce((acc, medicine) => {
    if (!acc[medicine.medicineClass]) {
      acc[medicine.medicineClass] = [];
    }
    acc[medicine.medicineClass].push(medicine);
    return acc;
  }, {} as Record<string, Medicine[]>);

  return (
    <Card className={cn("w-full max-w-6xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill size={20} className="text-purple-600" />
          Medicine Selection & Validation
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select appropriate medicines for the confirmed conditions. Authi 1.0 will validate 
          CDAs and highlight any plan exclusions requiring motivation notes.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Plan Type Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Medical Scheme Plan:</label>
          <Select
            value={selectedPlanType?.id || ''}
            onValueChange={(value) => {
              const plan = planTypes.find(p => p.id === value);
              setSelectedPlanType(plan || null);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select plan type" />
            </SelectTrigger>
            <SelectContent>
              {planTypes.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600">Loading medicines...</span>
          </div>
        ) : (
          <>
            <ScrollArea className="h-96 w-full border rounded-md p-4">
              <div className="space-y-6">
                {Object.entries(groupedMedicines).map(([medicineClass, medicines]) => (
                  <div key={medicineClass} className="space-y-3">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">
                      {medicineClass}
                    </h3>
                    <div className="space-y-3 pl-4">
                      {medicines.map((medicine) => {
                        const isSelected = isMedicineSelected(medicine);
                        const motivation = getMedicineMotivation(medicine);
                        const cda = getCDA(medicine);
                        const excluded = isExcluded(medicine);
                        
                        return (
                          <div
                            key={medicine.medicineName}
                            className={cn(
                              "p-4 rounded-lg border transition-colors",
                              isSelected ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                              excluded && isSelected ? "border-orange-200 bg-orange-50" : ""
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleMedicineToggle(medicine)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-gray-900">{medicine.medicineName}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {medicine.activeIngredient}
                                  </Badge>
                                  {excluded && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle size={12} className="mr-1" />
                                      Excluded
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <DollarSign size={14} />
                                    <span>CDA: R{cda.toFixed(2)}</span>
                                  </div>
                                  <div className="text-xs">
                                    {medicine.strength && `Strength: ${medicine.strength}`}
                                  </div>
                                </div>
                                
                                {isSelected && excluded && (
                                  <div className="mt-3">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Motivation Note (Required for excluded medicine):
                                    </label>
                                    <Textarea
                                      placeholder="Explain why this excluded medicine is necessary for the patient..."
                                      value={motivation}
                                      onChange={(e) => handleMotivationChange(medicine, e.target.value)}
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-gray-600">
                {selectedMedicines.filter(m => m.selected).length} medicine{selectedMedicines.filter(m => m.selected).length !== 1 ? 's' : ''} selected
                {selectedMedicines.filter(m => m.selected && m.planExclusions && m.planExclusions.length > 0).length > 0 && (
                  <span className="text-orange-600 ml-2">
                    ({selectedMedicines.filter(m => m.selected && m.planExclusions && m.planExclusions.length > 0).length} excluded)
                  </span>
                )}
              </div>
              <Button
                onClick={handleConfirm}
                disabled={selectedMedicines.filter(m => m.selected).length === 0}
                className="flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Confirm Medicine Selection
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
