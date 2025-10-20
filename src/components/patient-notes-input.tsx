'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientNotesInputProps {
  onAnalyze: (notes: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function PatientNotesInput({ onAnalyze, isLoading = false, className }: PatientNotesInputProps) {
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (notes.trim()) {
      onAnalyze(notes.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Patient Notes Analysis
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter the patient's clinical notes below. ClinicalBERT will analyze the text to identify potential chronic conditions.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="patient-notes" className="text-sm font-medium text-gray-700">
            Patient Notes:
          </label>
          <Textarea
            id="patient-notes"
            placeholder="Enter patient's clinical notes, symptoms, findings, or diagnosis notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[200px] resize-none"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle size={16} />
            <span>Press Cmd/Ctrl + Enter to analyze</span>
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!notes.trim() || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send size={16} />
                Analyze Notes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AnalysisResultProps {
  detectedConditions: string[];
  confidence: number;
  processingTime: number;
  className?: string;
}

export function AnalysisResult({ detectedConditions, confidence, processingTime, className }: AnalysisResultProps) {
  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <CheckCircle size={20} className="text-green-600" />
          Analysis Complete
        </CardTitle>
        <p className="text-sm text-gray-600">
          ClinicalBERT has identified the following potential chronic conditions:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {detectedConditions.map((condition, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {condition}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>Confidence:</span>
            <Badge variant="outline">
              {Math.round(confidence * 100)}%
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <span>Processing Time:</span>
            <Badge variant="outline">
              {processingTime}ms
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
