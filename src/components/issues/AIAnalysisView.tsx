'use client';

import React, { useState, useEffect } from 'react';
import { AIClassification } from '@/lib/types';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { Check, Loader2, Sparkles, AlertTriangle, ArrowRight, Edit3 } from 'lucide-react';

interface AIAnalysisViewProps {
  analysis: AIClassification;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function AIAnalysisView({ analysis, onConfirm, onEdit }: AIAnalysisViewProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 800);
    const timer2 = setTimeout(() => setStep(2), 1600);
    const timer3 = setTimeout(() => setStep(3), 2400);
    const timer4 = setTimeout(() => setStep(4), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const departmentName = analysis.department;
  const priorityConfig = PRIORITY_CONFIG[analysis.priority];

  const steps = [
    { label: 'Understanding description & context', icon: Sparkles },
    { label: 'Detecting issue category', icon: Check },
    { label: 'Determining priority level', icon: Check },
    { label: 'Routing to correct department', icon: Check },
  ];

  return (
    <div className="bg-white border border-primary/20 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-primary/5 border-b border-primary/10 p-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-primary-900">AI Analysis Complete</h3>
      </div>
      
      <div className="p-5 sm:p-6">
        {step < 4 ? (
          <div className="space-y-4 py-4">
            {steps.map((s, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-3 transition-opacity duration-300 ${i <= step ? 'opacity-100' : 'opacity-30'}`}
              >
                {i < step ? (
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : i === step ? (
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  </div>
                )}
                <span className={`text-sm ${i <= step ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 italic border border-slate-100">
              "{analysis.summary}"
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-3">
                <span className="text-xs text-slate-500 font-medium block mb-1">Category</span>
                <span className="font-semibold text-slate-900">{analysis.categoryLabel}</span>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <span className="text-xs text-slate-500 font-medium block mb-1">Priority</span>
                <span 
                  className="font-semibold px-2 py-0.5 rounded text-sm inline-block"
                  style={{ backgroundColor: priorityConfig.bgColor, color: priorityConfig.textColor }}
                >
                  {priorityConfig.label}
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg p-3 col-span-2">
                <span className="text-xs text-slate-500 font-medium block mb-1">Routed To</span>
                <span className="font-semibold text-slate-900">{departmentName}</span>
              </div>
            </div>

            {analysis.safetyConcern && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 border border-red-100">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                <div className="text-sm">
                  <strong>Safety Concern Detected:</strong> This issue has been flagged as a potential safety risk and will be prioritized.
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={onConfirm}
                className="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                SUBMIT REPORT <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onEdit}
                className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 px-4 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
