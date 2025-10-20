'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Treatment, ICDCode } from '@/types';
import { authiService } from '@/lib/authi-service';

interface TreatmentBasketSelectorProps {
  selectedICDCodes: ICDCode[];
  onTreatmentsSelected: (treatments: Treatment[]) => void;
  className?: string;
}

interface SelectedTreatment extends Treatment {
  selected: boolean;
  quantity: number;
}

export function TreatmentBasketSelector({ selectedICDCodes, onTreatmentsSelected, className }: TreatmentBasketSelectorProps) {
  const [availableTreatments, setAvailableTreatments] = useState<{
    diagnostic: Treatment[];
    ongoingManagement: Treatment[];
  }>({ diagnostic: [], ongoingManagement: [] });
  const [selectedTreatments, setSelectedTreatments] = useState<SelectedTreatment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedICDCodes.length > 0) {
      loadTreatments();
    }
  }, [selectedICDCodes]);

  const loadTreatments = async () => {
    setLoading(true);
    try {
      const allDiagnostic: Treatment[] = [];
      const allOngoing: Treatment[] = [];
      
      for (const icdCode of selectedICDCodes) {
        const treatments = await authiService.getTreatmentsForCondition(icdCode.condition);
        treatments.forEach(treatment => {
          if (treatment.basketType === 'diagnostic') {
            allDiagnostic.push(treatment);
          } else {
            allOngoing.push(treatment);
          }
        });
      }
      
      setAvailableTreatments({
        diagnostic: allDiagnostic,
        ongoingManagement: allOngoing
      });
    } catch (error) {
      console.error('Error loading treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTreatmentToggle = (treatment: Treatment) => {
    const existingIndex = selectedTreatments.findIndex(t => t.procedureCode === treatment.procedureCode);
    
    if (existingIndex >= 0) {
      // Remove treatment
      setSelectedTreatments(selectedTreatments.filter((_, index) => index !== existingIndex));
    } else {
      // Add treatment
      setSelectedTreatments([...selectedTreatments, { ...treatment, selected: true, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (treatment: Treatment, delta: number) => {
    setSelectedTreatments(selectedTreatments.map(t => {
      if (t.procedureCode === treatment.procedureCode) {
        const newQuantity = Math.max(0, Math.min(t.coverageLimit, t.quantity + delta));
        return { ...t, quantity: newQuantity };
      }
      return t;
    }));
  };

  const handleConfirm = () => {
    const treatments = selectedTreatments.filter(t => t.selected && t.quantity > 0);
    onTreatmentsSelected(treatments);
  };

  const isTreatmentSelected = (treatment: Treatment) => {
    return selectedTreatments.some(t => t.procedureCode === treatment.procedureCode);
  };

  const getTreatmentQuantity = (treatment: Treatment) => {
    const selected = selectedTreatments.find(t => t.procedureCode === treatment.procedureCode);
    return selected ? selected.quantity : 0;
  };

  const renderTreatmentList = (treatments: Treatment[], basketType: 'diagnostic' | 'ongoing_management') => (
    <div className="space-y-3">
      {treatments.map((treatment) => {
        const isSelected = isTreatmentSelected(treatment);
        const quantity = getTreatmentQuantity(treatment);
        
        return (
          <div
            key={`${treatment.procedureCode}-${treatment.basketType}`}
            className={cn(
              "p-4 rounded-lg border transition-colors",
              isSelected ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleTreatmentToggle(treatment)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{treatment.procedureName}</h4>
                  <Badge variant="outline" className="text-xs">
                    Code: {treatment.procedureCode}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Coverage Limit: {treatment.coverageLimit} per year
                </p>
                
                {isSelected && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Quantity:</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(treatment, -1)}
                        disabled={quantity <= 0}
                        className="h-8 w-8 p-0"
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(treatment, 1)}
                        disabled={quantity >= treatment.coverageLimit}
                        className="h-8 w-8 p-0"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">
                      (Max: {treatment.coverageLimit})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card className={cn("w-full max-w-6xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          PMB Treatment Basket Selection
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select diagnostic and ongoing management treatments for the confirmed conditions. 
          Authi 1.0 will ensure PMB compliance and coverage limits.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading treatment baskets...</span>
          </div>
        ) : (
          <>
            <Tabs defaultValue="diagnostic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="diagnostic">Diagnostic Basket</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="diagnostic" className="mt-6">
                <ScrollArea className="h-96 w-full border rounded-md p-4">
                  {availableTreatments.diagnostic.length > 0 ? (
                    renderTreatmentList(availableTreatments.diagnostic, 'diagnostic')
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No diagnostic treatments available for selected conditions.
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="ongoing" className="mt-6">
                <ScrollArea className="h-96 w-full border rounded-md p-4">
                  {availableTreatments.ongoingManagement.length > 0 ? (
                    renderTreatmentList(availableTreatments.ongoingManagement, 'ongoing_management')
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No ongoing management treatments available for selected conditions.
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
            
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-gray-600">
                {selectedTreatments.filter(t => t.selected && t.quantity > 0).length} treatment{selectedTreatments.filter(t => t.selected && t.quantity > 0).length !== 1 ? 's' : ''} selected
              </div>
              <Button
                onClick={handleConfirm}
                disabled={selectedTreatments.filter(t => t.selected && t.quantity > 0).length === 0}
                className="flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Confirm Treatment Selection
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
