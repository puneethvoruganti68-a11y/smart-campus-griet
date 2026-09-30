'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building2, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { DEMO_ADMIN, DEMO_STAFF } from '@/lib/demo-config';

type AccessRole = 'student' | 'staff' | 'admin';

const portalCopy = {
  student: { heading: 'Student Access', description: 'Enter your details to report and track campus issues.', button: 'Continue to Report' },
  staff: { heading: 'Staff Portal', description: 'Enter your registered Staff ID to access assigned issues.', button: 'Enter Staff Portal' },
  admin: { heading: 'Administration Portal', description: 'Sign in with the central administration credentials.', button: 'Login to Administration' },
} as const;

export default function AccessForm({ role }: { role: AccessRole }) {
  const router = useRouter();
  const { identifyStudent, enterStaff, loginAdmin, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [classSection, setClassSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [staffId, setStaffId] = useState('');
  const [email, setEmail] = useState(role === 'admin' ? DEMO_ADMIN.email : '');
  const [password, setPassword] = useState(role === 'admin' ? DEMO_ADMIN.password : '');
  const [availableStaffIds, setAvailableStaffIds] = useState<Array<{ staffId: string; name: string; departmentName: string }>>(
    DEMO_STAFF.map((member) => ({
      staffId: member.staffId,
      name: member.name,
      departmentName: member.departmentName,
    }))
  );
  const [error, setError] = useState('');
  const copy = portalCopy[role];

  useEffect(() => {
    if (role === 'admin') {
      setEmail(DEMO_ADMIN.email);
      setPassword(DEMO_ADMIN.password);
    }
  }, [role]);

  useEffect(() => {
    if (role !== 'staff') return;
    let isMounted = true;
    const fallbackStaffIds = DEMO_STAFF.map((member) => ({
      staffId: member.staffId,
      name: member.name,
      departmentName: member.departmentName,
    }));
    fetch('/api/staff/ids')
      .then(response => response.ok ? response.json() : { staffIds: [] })
      .then(data => {
        if (!isMounted) return;
        const nextStaffIds = Array.isArray(data?.staffIds) ? data.staffIds : fallbackStaffIds;
        setAvailableStaffIds(nextStaffIds.length > 0 ? nextStaffIds : fallbackStaffIds);
      })
      .catch(() => {
        if (isMounted) setAvailableStaffIds(fallbackStaffIds);
      });

    return () => { isMounted = false; };
  }, [role]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const result = role === 'student'
      ? await identifyStudent({ name, classSection, rollNumber })
      : role === 'staff'
        ? await enterStaff(staffId)
        : await loginAdmin({ email, password });

    if (!result.success) {
      setError(result.error || 'Unable to access the portal.');
      return;
    }
    router.replace(role === 'student' ? '/student/dashboard' : `/${role}/dashboard`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-[#1e3a5f] p-7 text-white sm:p-9">
          <div className="mb-6 flex items-center gap-3">
            <Building2 className="h-9 w-9" />
            <div>
              <p className="text-xl font-bold">GRIET</p>
              <p className="text-xs uppercase tracking-wider text-blue-200">Smart Campus</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold">{copy.heading}</h1>
          <p className="mt-2 text-sm text-blue-100">{copy.description}</p>
        </div>

        <form onSubmit={submit} className="space-y-5 p-7 sm:p-9">
          {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><Info className="h-5 w-5 shrink-0" />{error}</div>}
          {role === 'student' && <>
            <Field label="Full Name" placeholder="Enter your name" value={name} onChange={setName} autoComplete="name" />
            <Field label="Class / Section" placeholder="e.g. CSE-A" value={classSection} onChange={setClassSection} />
            <Field label="Roll Number" placeholder="Enter roll number" value={rollNumber} onChange={setRollNumber} />
          </>}
          {role === 'staff' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Staff Member</label>
                <select
                  value={staffId}
                  onChange={(event) => setStaffId(event.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select Staff Member</option>
                  {Array.from(new Set(availableStaffIds.map(({ departmentName }) => departmentName))).map((departmentName) => (
                    <optgroup key={departmentName} label={departmentName}>
                      {availableStaffIds.filter((staff) => staff.departmentName === departmentName).map((staff) => (
                        <option key={staff.staffId} value={staff.staffId}>{staff.name} — {staff.staffId}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <Field label="Staff ID" placeholder="Staff ID will be auto-filled" value={staffId} onChange={setStaffId} autoComplete="username" readOnly={true} />
            </div>
          )}
          {role === 'admin' && <>
            <Field label="Email / Admin ID" placeholder="Administration email" value={email} onChange={setEmail} autoComplete="username" type="email" />
            <Field label="Password" placeholder="Administration password" value={password} onChange={setPassword} autoComplete="current-password" type="password" />
            <button type="button" onClick={() => { setEmail(DEMO_ADMIN.email); setPassword(DEMO_ADMIN.password); setError(''); }} className="text-xs font-medium text-[#2563eb] underline decoration-dotted underline-offset-2 hover:text-blue-700">
              Use Demo Admin
            </button>
          </>}
          <button type="submit" disabled={isLoading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading ? 'Checking details...' : copy.button}<ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-center text-sm text-slate-500"><Link href="/" className="font-medium text-[#2563eb] hover:underline">Back to Smart Campus</Link></p>
        </form>
      </section>
    </main>
  );
}

function Field({ label, placeholder, value, onChange, autoComplete, type = 'text', readOnly = false }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return <label className="block space-y-1.5 text-sm font-medium text-slate-700">
    {label}
    <input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} required readOnly={readOnly} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100" />
  </label>;
}