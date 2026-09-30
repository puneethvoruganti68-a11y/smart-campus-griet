'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Building, Activity, CheckCircle, Search, User, ShieldCheck } from 'lucide-react';

export default function AdminStaffPage() {
  const { user, isLoading } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [staffStats, setStaffStats] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetch('/api/admin/meta').then(response => response.ok ? response.json() : { staff: [] }).then(data => {
        const actualStaff = data.staff || [];
        setStaff(actualStaff);
        setStaffStats(Object.fromEntries(actualStaff.map((member: any) => [member.id, { active: Number(member.activeIssues || 0), completed: Number(member.completedIssues || 0) }])));
      }).catch(() => setStaff([])).finally(() => setIsLoaded(true));
    }
  }, [user]);

  if (isLoading || !isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const filteredStaff = staff.filter(s => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const deptName = String(s.departmentName || '').toLowerCase();
      return s.name.toLowerCase().includes(q) || s.staffId.toLowerCase().includes(q) || deptName.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Campus Staff Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Registered staff IDs, departments, and assigned issue performance.</p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700">
          Total Staff: {staff.length}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by staff name, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-slate-900"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Staff Member</th>
                <th className="px-6 py-3.5 font-semibold">Department</th>
                <th className="px-6 py-3.5 font-semibold">Duty Status</th>
                <th className="px-6 py-3.5 font-semibold">Active Tasks</th>
                <th className="px-6 py-3.5 font-semibold">Resolved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length > 0 ? (
                filteredStaff.map(member => {
                  const stats = staffStats[member.id] || { active: 0, completed: 0, total: 0 };
                  const status = 'registered';

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{member.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{member.staffId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          <Building className="h-3 w-3 text-slate-400" />
                          {member.departmentName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            'bg-slate-400'
                          }`} />
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Activity className="h-3 w-3" />
                          {stats.active} Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="h-3 w-3" />
                          {stats.completed} Done
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No staff members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredStaff.length > 0 ? (
            filteredStaff.map(member => {
              const stats = staffStats[member.id] || { active: 0, completed: 0, total: 0 };
              const status = 'registered';

              return (
                <div key={member.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{member.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{member.staffId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="font-medium text-slate-600">
                      {member.departmentName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                        {stats.active} Active
                      </span>
                      <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">
                        {stats.completed} Done
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No staff members found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
