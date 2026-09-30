'use client';

import React, { useState } from 'react';
import { Issue, IssueHistory } from '@/lib/types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG, formatDateTime } from '@/lib/constants';
import IssueTimeline from './IssueTimeline';
import { 
  AlertTriangle, MapPin, Building2, User, Clock, 
  Copy, Check, Image as ImageIcon, Maximize2, X
} from 'lucide-react';

interface IssueDetailViewProps {
  issue: Issue;
  history: IssueHistory[];
  children?: React.ReactNode;
}

export default function IssueDetailView({ issue, history, children }: IssueDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[issue.category];
  const priorityConfig = PRIORITY_CONFIG[issue.priority];
  const statusConfig = STATUS_CONFIG[issue.status];
  
  const extendedIssue = issue as Issue & { departmentName?: string; studentName?: string; assignedStaffName?: string };
  const departmentName = extendedIssue.departmentName || 'Department';

  const copyTicket = () => {
    navigator.clipboard.writeText(issue.ticketNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {issue.safetyConcern && (
            <div className="bg-red-50 border-b border-red-100 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800">Safety Concern</h4>
                <p className="text-sm text-red-700">This issue has been flagged as a potential safety risk. Immediate attention may be required.</p>
              </div>
            </div>
          )}
          
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{issue.title}</h1>
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                  style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }}
                >
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                <span className="text-sm font-medium text-slate-600">{issue.ticketNumber}</span>
                <button 
                  onClick={copyTicket}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="Copy Ticket Number"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="prose prose-sm sm:prose-base max-w-none text-slate-700 mb-8">
              <p className="whitespace-pre-wrap">{issue.description}</p>
            </div>

            {issue.imageUrl && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  Attached Image
                </h3>
                <div 
                  className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-zoom-in max-w-md"
                  onClick={() => setFullscreenImage(true)}
                >
                  <img 
                    src={issue.imageUrl} 
                    alt="Issue attachment" 
                    className="w-full h-auto object-cover max-h-[300px]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Location</p>
                    <p className="text-sm font-medium text-slate-900">{issue.location}</p>
                    <p className="text-xs text-slate-500">{issue.building} {issue.floor ? `• ${issue.floor} Floor` : ''} • {issue.room}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Category & Department</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span 
                        className="text-xs font-medium px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: categoryConfig.bgColor, color: categoryConfig.color }}
                      >
                        {categoryConfig.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mt-1">{departmentName}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">People</p>
                    <p className="text-sm"><span className="text-slate-500">Reported by:</span> <span className="font-medium text-slate-900">{extendedIssue.studentName || 'Student'}</span></p>
                    <p className="text-sm mt-0.5">
                      <span className="text-slate-500">Assigned to:</span>{' '}
                      {extendedIssue.assignedStaffName ? (
                        <span className="font-medium text-slate-900">{extendedIssue.assignedStaffName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Timeline</p>
                    <p className="text-sm"><span className="text-slate-500">Created:</span> <span className="text-slate-900">{formatDateTime(issue.createdAt)}</span></p>
                    <p className="text-sm mt-0.5"><span className="text-slate-500">Updated:</span> <span className="text-slate-900">{formatDateTime(issue.updatedAt)}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Issue History</h3>
          </div>
          <div className="p-5 sm:p-6 bg-slate-50/50">
            <IssueTimeline history={history} />
          </div>
        </div>
      </div>

      {/* Sidebar / Actions */}
      <div className="lg:w-80 shrink-0 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Priority Level</h3>
          <div 
            className="flex items-center justify-center p-4 rounded-lg text-center"
            style={{ backgroundColor: priorityConfig.bgColor, color: priorityConfig.textColor, border: `1px solid ${priorityConfig.color}40` }}
          >
            <div>
              <span className="block text-2xl font-bold mb-1">{priorityConfig.label}</span>
              <span className="text-xs opacity-80">This determines response time</span>
            </div>
          </div>
        </div>

        {children && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Actions</h3>
            {children}
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && issue.imageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm">
          <button 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setFullscreenImage(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={issue.imageUrl} 
            alt="Issue attachment fullscreen" 
            className="max-w-full max-h-full object-contain rounded-md"
          />
        </div>
      )}
    </div>
  );
}
