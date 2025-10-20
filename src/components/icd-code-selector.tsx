'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICDCode } from '@/types';
import { authiService } from '@/lib/authi-service';

interface ICDCodeSelectorProps {
  detectedConditions: string[];
  onICDCodesSelected: (codes: ICDCode[]) => void;
  className?: string;
}

export function ICDCodeSelector({ detectedConditions, onICDCodesSelected, className }: ICDCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableCodes, setAvailableCodes] = useState<ICDCode[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<ICDCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (detectedConditions.length > 0) {
      loadICDCodes();
    }
  }, [detectedConditions]);

  const loadICDCodes = async () => {
    setLoading(true);
    try {
      const allCodes: ICDCode[] = [];
      for (const condition of detectedConditions) {
        const codes = await authiService.getICDCodesForCondition(condition);
        allCodes.push(...codes);
      }
      setAvailableCodes(allCodes);
    } catch (error) {
      console.error('Error loading ICD codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeToggle = (code: ICDCode) => {
    const isSelected = selectedCodes.some(selected => selected.code === code.code);
    if (isSelected) {
      setSelectedCodes(selectedCodes.filter(selected => selected.code !== code.code));
    } else {
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const handleConfirm = () => {
    onICDCodesSelected(selectedCodes);
    setIsOpen(false);
  };

  const groupedCodes = availableCodes.reduce((acc, code) => {
    if (!acc[code.condition]) {
      acc[code.condition] = [];
    }
    acc[code.condition].push(code);
    return acc;
  }, {} as Record<string, ICDCode[]>);

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle size={20} className="text-blue-600" />
            ICD-10 Code Selection
          </span>
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {isOpen ? 'Hide' : 'Show'} Codes
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select the appropriate ICD-10 codes for the detected conditions. Authi 1.0 will map these to PMB treatment baskets.
        </p>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading ICD codes...</span>
            </div>
          ) : (
            <>
              <ScrollArea className="h-96 w-full border rounded-md p-4">
                <div className="space-y-4">
                  {Object.entries(groupedCodes).map(([condition, codes]) => (
                    <div key={condition} className="space-y-2">
                      <h4 className="font-medium text-gray-900">{condition}</h4>
                      <div className="space-y-2 pl-4">
                        {codes.map((code) => {
                          const isSelected = selectedCodes.some(selected => selected.code === code.code);
                          return (
                            <div
                              key={code.code}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                isSelected ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleCodeToggle(code)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {code.code}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700">{code.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {selectedCodes.length} code{selectedCodes.length !== 1 ? 's' : ''} selected
                </div>
                <Button
                  onClick={handleConfirm}
                  disabled={selectedCodes.length === 0}
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Confirm Selection
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
      
      {selectedCodes.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Selected ICD-10 Codes:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCodes.map((code) => (
                <Badge key={code.code} variant="secondary" className="text-xs">
                  {code.code}: {code.description}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
