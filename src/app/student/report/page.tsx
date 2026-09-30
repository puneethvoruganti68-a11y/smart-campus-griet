"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { classifyIssue, generateTitle } from '@/lib/ai';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import AIAnalysisView from '@/components/issues/AIAnalysisView';
import { BUILDINGS } from '@/lib/constants';
import { ArrowRight, ArrowLeft, CheckCircle, Ticket, Activity, MapPin, Sparkles } from 'lucide-react';
import { AIClassification } from '@/lib/types';
import { GrietLoadingAnimation } from '@/components/ui/LoadingState';
import { useToast } from '@/components/ui/Toast';

export default function ReportIssuePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ building: '', floor: '', room: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classification, setClassification] = useState<AIClassification | null>(null);
  const [title, setTitle] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [submittedIssue, setSubmittedIssue] = useState<{ title: string; category: string; priority: string; department: string; location: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState('');

  const buildingOptions = BUILDINGS.map(b => ({ value: b.name, label: b.name }));
  const selectedBuildingObj = BUILDINGS.find(b => b.name === location.building);
  const floors = selectedBuildingObj
    ? selectedBuildingObj.floors.map(f => ({ value: f, label: f.includes('Floor') ? f : `${f} Floor` }))
    : [
        { value: 'Ground', label: 'Ground Floor' },
        { value: '1st', label: '1st Floor' },
        { value: '2nd', label: '2nd Floor' },
        { value: '3rd', label: '3rd Floor' },
        { value: '4th', label: '4th Floor' },
      ];

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleLocationNext = () => {
    const hasBuilding = !!location.building.trim();
    const hasFloor = !!location.floor.trim();
    const hasRoom = !!location.room.trim();

    if (!hasBuilding || !hasFloor || !hasRoom) {
      setLocationError('Please select a building and floor and enter the room or specific location.');
      return;
    }

    setLocationError('');
    void handleAnalyze();
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setStep(3);
    try {
      const generatedTitle = await generateTitle(description);
      setTitle(generatedTitle);
      const result = await classifyIssue(description);
      setClassification(result);
    } catch (error) {
      toast({ title: 'Analysis failed', description: 'Could not analyze issue.', variant: 'error' });
      setStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !classification) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        title: title || description.slice(0, 50),
        description,
        category: classification.category,
        priority: classification.priority,
        building: location.building,
        floor: location.floor,
        room: location.room,
        safetyConcern: classification.safetyConcern,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create issue.');
      setTicketId(result.issue.ticketNumber);
      window.dispatchEvent(new Event('campus-notifications-updated'));
      setSubmittedIssue({
        title: result.issue.title,
        category: classification.categoryLabel,
        priority: classification.priority,
        department: result.issue.department,
        location: `${location.building}, ${location.floor} Floor, ${location.room}`,
      });
      setStep(5);
      toast({ title: 'Report Submitted', description: `Ticket ${result.issue.ticketNumber} created successfully!`, variant: 'success' });
    } catch (error) {
      toast({ title: 'Submission failed', description: error instanceof Error ? error.message : 'Could not create issue.', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, icon: Activity, label: 'Describe' },
      { num: 2, icon: MapPin, label: 'Location' },
      { num: 3, icon: Sparkles, label: 'Analysis' },
      { num: 4, icon: CheckCircle, label: 'Confirm' }
    ];
    
    return (
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 hide-scrollbar">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className={`flex flex-col items-center min-w-[60px] ${step >= s.num ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= s.num ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'} ${step === s.num ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${step > s.num ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-0">
      {step < 6 && renderStepIndicator()}
      
      <Card className="border-0 shadow-lg">
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">What happened?</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Tell us what happened in detail..." 
                className="min-h-[150px] sm:min-h-[200px] text-base"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleNext} disabled={description.trim().length < 10}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Where is it located?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Building"
                value={location.building}
                onChange={e => {
                  setLocation({ ...location, building: e.target.value, floor: '' });
                  setLocationError('');
                }}
                options={[{ value: '', label: 'Select building' }, ...buildingOptions]}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Floor"
                  value={location.floor}
                  onChange={e => {
                    setLocation({ ...location, floor: e.target.value });
                    setLocationError('');
                  }}
                  options={[{ value: '', label: 'Select floor' }, ...floors]}
                  disabled={!location.building}
                />
                <Input
                  label="Room / Specific Location"
                  placeholder="e.g. Room 302, Near water cooler"
                  value={location.room}
                  onChange={e => {
                    setLocation({ ...location, room: e.target.value });
                    setLocationError('');
                  }}
                />
              </div>
              {locationError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {locationError}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={handleLocationNext} disabled={!location.building || !location.floor || !location.room.trim()}>
                Analyze Issue <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <div className="p-8">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                <GrietLoadingAnimation />
                <p className="text-lg font-medium text-slate-700 animate-pulse">AI is analyzing your report...</p>
              </div>
            ) : classification ? (
              <AIAnalysisView 
                analysis={classification} 
                onConfirm={handleNext} 
                onEdit={() => setStep(1)} 
              />
            ) : null}
          </div>
        )}

        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Confirm Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-600 mb-4">{description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {location.building}, {location.floor} Floor, {location.room}</span>
                </div>
              </div>
              {classification && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Category</p>
                    <p className="font-medium capitalize">{classification.category.replace('_', ' ')}</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Priority</p>
                    <p className="font-medium capitalize">{classification.priority}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-36 uppercase tracking-wide">
                {isSubmitting ? 'Submitting...' : 'SUBMIT REPORT'}
              </Button>
            </CardFooter>
          </>
        )}

        {step === 5 && (
          <div className="text-center py-12 px-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted Successfully</h2>
            <p className="text-slate-500 mb-6">Your issue has been successfully reported to the campus administration.</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 inline-flex items-center mb-8">
              <Ticket className="w-5 h-5 text-slate-400 mr-2" />
              <span className="font-mono font-medium text-lg">{ticketId}</span>
            </div>

            {submittedIssue && (
              <dl className="mx-auto mb-8 grid max-w-lg grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left sm:grid-cols-2">
                <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Issue</dt><dd className="font-medium text-slate-900">{submittedIssue.title}</dd></div>
                <div><dt className="text-xs text-slate-500">Category</dt><dd className="font-medium text-slate-900">{submittedIssue.category}</dd></div>
                <div><dt className="text-xs text-slate-500">Priority</dt><dd className="font-medium capitalize text-slate-900">{submittedIssue.priority}</dd></div>
                <div><dt className="text-xs text-slate-500">Department</dt><dd className="font-medium text-slate-900">{submittedIssue.department}</dd></div>
                <div><dt className="text-xs text-slate-500">Status</dt><dd className="font-medium text-slate-900">Reported</dd></div>
                <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Location</dt><dd className="font-medium text-slate-900">{submittedIssue.location}</dd></div>
              </dl>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" onClick={() => router.push(`/student/issues`)} className="w-full sm:w-auto">
                View Submitted Reports
              </Button>
              <Button onClick={() => {
                setStep(1);
                setDescription('');
                setLocation({ building: '', floor: '', room: '' });
              }} className="w-full sm:w-auto">
                Report Another
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
