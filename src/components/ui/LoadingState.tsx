'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return <Loader2 className={`animate-spin text-blue-900 ${sizeClasses[size]} ${className}`} />;
};

export const Skeleton = ({ className = '' }: { className?: string }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
};

export const GrietLoadingAnimation = ({ label = 'Loading campus data...' }: { label?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-sm mx-auto select-none" role="status" aria-label={label}>
      {/* Dynamic Animated Runner on Progress Bar (hidden if user prefers reduced motion) */}
      <div className="block motion-reduce:hidden w-full relative h-20">
        {/* Runner Container */}
        <div className="absolute bottom-2.5 left-0 w-full pointer-events-none">
          <div className="relative w-full h-14">
            <div className="griet-runner-car absolute bottom-0">
              <div className="griet-bob flex flex-col items-center">
                {/* SVG Student Carrying GRIET Sign */}
                <svg
                  width="44"
                  height="50"
                  viewBox="0 0 44 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="overflow-visible"
                >
                  {/* GRIET Sign Board */}
                  <g className="griet-sign">
                    {/* Sign Stick */}
                    <line x1="26" y1="14" x2="26" y2="34" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                    {/* Sign Board */}
                    <rect x="8" y="2" width="34" height="15" rx="3" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1" />
                    {/* Sign Border Accent */}
                    <line x1="10" y1="15" x2="40" y2="15" stroke="#f59e0b" strokeWidth="1.5" />
                    {/* Text GRIET */}
                    <text
                      x="25"
                      y="12"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                      letterSpacing="0.8"
                      textAnchor="middle"
                    >
                      GRIET
                    </text>
                  </g>

                  {/* Student Character */}
                  <g className="student-body">
                    {/* Head */}
                    <circle cx="16" cy="18" r="4.5" fill="#1e293b" />
                    {/* Student Cap / Hair detail */}
                    <path d="M12 17 Q16 13 20 17 Z" fill="#0f172a" />
                    {/* Face highlight */}
                    <circle cx="17.5" cy="18" r="1" fill="#f8fafc" />

                    {/* Torso / College Jacket */}
                    <rect x="13" y="22" width="6.5" height="10" rx="1.5" fill="#2563eb" />
                    {/* Collar detail */}
                    <path d="M14 22 L16 25 L18 22" stroke="#ffffff" strokeWidth="1" fill="none" />

                    {/* Back Arm holding stick */}
                    <path d="M17 24 L26 22" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" />

                    {/* Left Leg */}
                    <line x1="14.5" y1="32" x2="11" y2="42" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" className="griet-leg-l" />

                    {/* Right Leg */}
                    <line x1="17.5" y1="32" x2="21" y2="42" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" className="griet-leg-r" />

                    {/* Front Arm */}
                    <line x1="14" y1="24" x2="10" y2="29" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" className="griet-arm" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-100 rounded-full border border-slate-200/80 overflow-hidden shadow-inner">
          <div className="griet-progress-bar h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 rounded-full" />
        </div>
      </div>

      {/* Accessible Fallback for prefers-reduced-motion */}
      <div className="hidden motion-reduce:flex items-center space-x-3 py-4">
        <Spinner size="md" />
        <span className="font-semibold text-slate-700 text-sm">Loading GRIET Campus Portal...</span>
      </div>

      {/* Status Label */}
      <p className="text-xs font-semibold text-slate-500 tracking-wide mt-3 animate-pulse">
        {label}
      </p>

      <style jsx global>{`
        @keyframes grietRunAcross {
          0% {
            left: 0%;
            transform: scaleX(1);
          }
          48% {
            left: calc(100% - 44px);
            transform: scaleX(1);
          }
          50% {
            left: calc(100% - 44px);
            transform: scaleX(-1);
          }
          98% {
            left: 0%;
            transform: scaleX(-1);
          }
          100% {
            left: 0%;
            transform: scaleX(1);
          }
        }

        @keyframes grietBobbing {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes grietLegSwingLeft {
          0%, 100% {
            transform: rotate(-24deg);
            transform-origin: 15px 32px;
          }
          50% {
            transform: rotate(24deg);
            transform-origin: 15px 32px;
          }
        }

        @keyframes grietLegSwingRight {
          0%, 100% {
            transform: rotate(24deg);
            transform-origin: 17px 32px;
          }
          50% {
            transform: rotate(-24deg);
            transform-origin: 17px 32px;
          }
        }

        @keyframes grietSignWiggle {
          0%, 100% {
            transform: rotate(-2deg);
            transform-origin: 26px 30px;
          }
          50% {
            transform: rotate(2deg);
            transform-origin: 26px 30px;
          }
        }

        @keyframes grietTrackProgress {
          0% {
            width: 5%;
          }
          50% {
            width: 95%;
          }
          100% {
            width: 5%;
          }
        }

        .griet-runner-car {
          animation: grietRunAcross 4.5s ease-in-out infinite;
          will-change: left, transform;
        }

        .griet-bob {
          animation: grietBobbing 0.28s ease-in-out infinite;
        }

        .griet-sign {
          animation: grietSignWiggle 0.6s ease-in-out infinite;
        }

        .griet-leg-l {
          animation: grietLegSwingLeft 0.28s ease-in-out infinite;
        }

        .griet-leg-r {
          animation: grietLegSwingRight 0.28s ease-in-out infinite;
        }

        .griet-progress-bar {
          animation: grietTrackProgress 4.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export const FullPageLoader = ({ label }: { label?: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
      <GrietLoadingAnimation label={label} />
    </div>
  );
};
