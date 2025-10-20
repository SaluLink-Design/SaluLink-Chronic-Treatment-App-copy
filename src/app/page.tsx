'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { PatientNotesInput, AnalysisResult } from '@/components/patient-notes-input';
import { ICDCodeSelector } from '@/components/icd-code-selector';
import { TreatmentBasketSelector } from '@/components/treatment-basket-selector';
import { MedicineSelector } from '@/components/medicine-selector';
import { ViewCases } from '@/components/view-cases';
import { clinicalBERTService } from '@/lib/clinicalbert-service';
import { generatePDFClaim } from '@/lib/pdf-service';
import { caseService } from '@/lib/case-service';
import { ClinicalBERTResponse, ICDCode, Treatment, Medicine } from '@/types';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [currentView, setCurrentView] = useState<'new-case' | 'view-cases'>('new-case');
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'icd-selection' | 'treatment' | 'medicine' | 'export'>('input');
  const [patientNotes, setPatientNotes] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ClinicalBERTResponse | null>(null);
  const [selectedICDCodes, setSelectedICDCodes] = useState<ICDCode[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<any[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalyzeNotes = async (notes: string) => {
    setPatientNotes(notes);
    setIsAnalyzing(true);
    
    try {
      const result = await clinicalBERTService.analyzeClinicalNotes(notes);
      setAnalysisResult(result);
      setCurrentStep('analysis');
    } catch (error) {
      console.error('Error analyzing notes:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleICDCodesSelected = (codes: ICDCode[]) => {
    setSelectedICDCodes(codes);
    setCurrentStep('treatment');
  };

  const handleTreatmentsSelected = (treatments: any[]) => {
    setSelectedTreatments(treatments);
    setCurrentStep('medicine');
  };

  const handleMedicinesSelected = (medicines: any[]) => {
    setSelectedMedicines(medicines);
    setCurrentStep('export');
  };

  const handleSaveCase = async () => {
    setIsSaving(true);
    try {
      const caseId = await caseService.saveCase({
        patientNotes,
        detectedConditions: analysisResult?.detectedConditions || [],
        analysisConfidence: analysisResult?.confidence || 0,
        icdCodes: selectedICDCodes,
        treatments: selectedTreatments,
        medicines: selectedMedicines
      });
      alert('Case saved successfully!');
    } catch (error) {
      console.error('Error saving case:', error);
      alert('Failed to save case. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartNewCase = () => {
    setCurrentStep('input');
    setPatientNotes('');
    setAnalysisResult(null);
    setSelectedICDCodes([]);
    setSelectedTreatments([]);
    setSelectedMedicines([]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onMenuItemClick={(itemId) => {
        if (itemId === 'new-case' || itemId === 'view-cases') {
          setCurrentView(itemId);
        }
      }} />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  SaluLink Chronic Treatment App
                </h1>
                <p className="text-gray-600 mt-2">
                  AI-powered PMB compliance documentation for chronic cardiovascular and endocrine disorders
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Authi 1.0</div>
                  <div className="text-xs text-gray-400">PMB Compliance Engine</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {[
                { id: 'input', label: 'Input Notes', completed: currentStep !== 'input' },
                { id: 'analysis', label: 'Analysis', completed: currentStep !== 'input' && currentStep !== 'analysis' },
                { id: 'icd-selection', label: 'ICD Codes', completed: currentStep !== 'input' && currentStep !== 'analysis' && currentStep !== 'icd-selection' },
                { id: 'treatment', label: 'Treatment', completed: currentStep !== 'input' && currentStep !== 'analysis' && currentStep !== 'icd-selection' && currentStep !== 'treatment' },
                { id: 'medicine', label: 'Medicine', completed: currentStep !== 'input' && currentStep !== 'analysis' && currentStep !== 'icd-selection' && currentStep !== 'treatment' && currentStep !== 'medicine' },
                { id: 'export', label: 'Export', completed: false }
              ].map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${
                    currentStep === step.id ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}>
                    {step.label}
                  </span>
                  {index < 5 && (
                    <div className={`w-8 h-0.5 ml-4 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {currentView === 'view-cases' ? (
              <ViewCases />
            ) : (
              <>
            {currentStep === 'input' && (
              <PatientNotesInput 
                onAnalyze={handleAnalyzeNotes}
                isLoading={isAnalyzing}
              />
            )}

            {currentStep === 'analysis' && analysisResult && (
              <>
                <AnalysisResult 
                  detectedConditions={analysisResult.detectedConditions}
                  confidence={analysisResult.confidence}
                  processingTime={analysisResult.processingTime}
                />
                <div className="flex justify-center">
                  <button
                    onClick={() => setCurrentStep('icd-selection')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Proceed to ICD Code Selection
                  </button>
                </div>
              </>
            )}

            {currentStep === 'icd-selection' && analysisResult && (
              <ICDCodeSelector
                detectedConditions={analysisResult.detectedConditions}
                onICDCodesSelected={handleICDCodesSelected}
              />
            )}

            {currentStep === 'treatment' && (
              <TreatmentBasketSelector
                selectedICDCodes={selectedICDCodes}
                onTreatmentsSelected={handleTreatmentsSelected}
              />
            )}

            {currentStep === 'medicine' && (
              <MedicineSelector
                selectedICDCodes={selectedICDCodes}
                onMedicinesSelected={handleMedicinesSelected}
              />
            )}

            {currentStep === 'export' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Case Summary & Export
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Detected Conditions</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult?.detectedConditions.map((condition, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Selected ICD-10 Codes</h3>
                      <div className="space-y-2">
                        {selectedICDCodes.map((code, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded border">
                            <span className="font-medium">{code.code}</span> - {code.description}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Selected Treatments</h3>
                      <p className="text-gray-600">{selectedTreatments.length} treatment(s) selected</p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Selected Medicines</h3>
                      <p className="text-gray-600">{selectedMedicines.length} medicine(s) selected</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-8 pt-6 border-t">
                    <Button
                      onClick={handleSaveCase}
                      disabled={isSaving}
                      variant="default"
                      size="lg"
                    >
                      {isSaving ? 'Saving...' : 'Save Case'}
                    </Button>
                    <Button
                      onClick={() => generatePDFClaim({
                        originalNote: patientNotes,
                        confirmedConditions: analysisResult?.detectedConditions || [],
                        selectedIcdCodes: selectedICDCodes,
                        diagnosticTreatments: selectedTreatments.filter(t => t.basketType === 'diagnostic'),
                        managementTreatments: selectedTreatments.filter(t => t.basketType === 'ongoing_management'),
                        medicineSelections: selectedMedicines
                      })}
                      variant="default"
                      size="lg"
                    >
                      Export PDF
                    </Button>
                    <Button
                      onClick={handleStartNewCase}
                      variant="outline"
                      size="lg"
                    >
                      Start New Case
                    </Button>
                  </div>
                </div>
              </div>
            )}
            </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}