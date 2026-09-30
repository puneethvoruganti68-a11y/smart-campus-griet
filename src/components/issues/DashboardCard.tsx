'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean | null;
  };
  colorClass?: string;
  subtitle?: string;
}

export default function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  colorClass = 'text-primary bg-primary/10',
  subtitle
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</h3>
          
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`
                flex items-center text-xs font-medium px-1.5 py-0.5 rounded
                ${trend.isPositive === true ? 'text-green-700 bg-green-100' : 
                  trend.isPositive === false ? 'text-red-700 bg-red-100' : 
                  'text-slate-600 bg-slate-100'}
              `}>
                {trend.isPositive === true && <TrendingUp className="w-3 h-3 mr-1" />}
                {trend.isPositive === false && <TrendingDown className="w-3 h-3 mr-1" />}
                {trend.isPositive === null && <Minus className="w-3 h-3 mr-1" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-400">vs last period</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
