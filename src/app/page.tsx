'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { PatientNotesInput, AnalysisResult } from '@/components/patient-notes-input';
import { ICDCodeSelector } from '@/components/icd-code-selector';
import { clinicalBERTService } from '@/lib/clinicalbert-service';
import { generatePDFClaim } from '@/lib/pdf-service';
import { ClinicalBERTResponse, ICDCode } from '@/types';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'icd-selection' | 'treatment' | 'medicine' | 'export'>('input');
  const [patientNotes, setPatientNotes] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ClinicalBERTResponse | null>(null);
  const [selectedICDCodes, setSelectedICDCodes] = useState<ICDCode[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const handleStartNewCase = () => {
    setCurrentStep('input');
    setPatientNotes('');
    setAnalysisResult(null);
    setSelectedICDCodes([]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
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
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Treatment Basket Selection
                </h2>
                <p className="text-gray-600 mb-8">
                  Treatment basket selection will be implemented here.
                </p>
                <button
                  onClick={() => setCurrentStep('medicine')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Proceed to Medicine Selection
                </button>
              </div>
            )}

            {currentStep === 'medicine' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Medicine Selection
                </h2>
                <p className="text-gray-600 mb-8">
                  Medicine selection will be implemented here.
                </p>
                <button
                  onClick={() => setCurrentStep('export')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Proceed to Export
                </button>
              </div>
            )}

            {currentStep === 'export' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Export PMB Report
                </h2>
                <p className="text-gray-600 mb-8">
                  PDF export functionality will be implemented here.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleStartNewCase}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Start New Case
                  </button>
                  <button
                    onClick={() => generatePDFClaim({
                      originalNote: patientNotes,
                      confirmedConditions: analysisResult?.detectedConditions || [],
                      selectedIcdCodes: selectedICDCodes,
                      diagnosticTreatments: [],
                      managementTreatments: [],
                      medicineSelections: []
                    })}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}