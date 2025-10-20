'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Trash2, Eye } from 'lucide-react';
import { caseService, SavedCase } from '@/lib/case-service';

interface ViewCasesProps {
  onCaseSelect?: (caseId: string) => void;
}

export function ViewCases({ onCaseSelect }: ViewCasesProps) {
  const [cases, setCases] = useState<SavedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState<any>(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const allCases = await caseService.getAllCases();
      setCases(allCases);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = async (caseId: string) => {
    try {
      const details = await caseService.getCaseById(caseId);
      setSelectedCase(caseId);
      setCaseDetails(details);
    } catch (error) {
      console.error('Error loading case details:', error);
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return;

    try {
      await caseService.deleteCase(caseId);
      setCases(cases.filter(c => c.id !== caseId));
      if (selectedCase === caseId) {
        setSelectedCase(null);
        setCaseDetails(null);
      }
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Failed to delete case');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading cases...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Saved Cases ({cases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {cases.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No cases saved yet</p>
                ) : (
                  cases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedCase === caseItem.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleViewCase(caseItem.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {caseItem.detectedConditions.slice(0, 2).map((condition, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                            {caseItem.detectedConditions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{caseItem.detectedConditions.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            {formatDate(caseItem.createdAt)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCase(caseItem.id);
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {caseItem.patientNotes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {caseDetails ? (
          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Patient Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded border">
                      {caseDetails.case.patientNotes}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Detected Conditions</h3>
                    <div className="flex flex-wrap gap-2">
                      {caseDetails.case.detectedConditions.map((condition: string, idx: number) => (
                        <Badge key={idx} className="text-sm">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">ICD-10 Codes</h3>
                    <div className="space-y-2">
                      {caseDetails.icdCodes.map((icd: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded border">
                          <span className="font-medium">{icd.code}</span> - {icd.description}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Treatments ({caseDetails.treatments.length})</h3>
                    <div className="space-y-2">
                      {caseDetails.treatments.map((treatment: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{treatment.procedureName}</span>
                            <Badge variant={treatment.basketType === 'diagnostic' ? 'default' : 'secondary'}>
                              {treatment.basketType}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Code: {treatment.procedureCode} | Quantity: {treatment.quantity}
                          </p>
                          {treatment.evidence.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {treatment.evidence.length} evidence file(s) attached
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Medicines ({caseDetails.medicines.length})</h3>
                    <div className="space-y-2">
                      {caseDetails.medicines.map((medicine: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded border">
                          <div className="font-medium">{medicine.medicineName}</div>
                          <p className="text-sm text-gray-600">
                            {medicine.medicineClass} | {medicine.activeIngredient}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            CDA: Core R{medicine.cdaCore} | Executive R{medicine.cdaExecutive}
                          </p>
                          {medicine.motivation && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-xs font-medium text-yellow-800">Motivation:</p>
                              <p className="text-xs text-yellow-700">{medicine.motivation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-gray-500">
                <Eye size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a case to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
