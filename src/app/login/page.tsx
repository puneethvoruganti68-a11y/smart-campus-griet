import Link from 'next/link';
import { ArrowRight, Building2, GraduationCap, ShieldCheck, Wrench } from 'lucide-react';

const portals = [
  { title: 'Student Access', detail: 'Report an issue and follow its progress.', href: '/student/access', icon: GraduationCap },
  { title: 'Staff Portal', detail: 'Open your department issue queue.', href: '/staff/access', icon: Wrench },
  { title: 'Administration Portal', detail: 'Manage campus-wide reports and analytics.', href: '/admin/login', icon: ShieldCheck },
];

export default function AccessSelectionPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 flex items-center justify-center">
      <section className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-[#1e3a5f]" />
          <h1 className="text-3xl font-bold text-slate-900">Smart Campus GRIET</h1>
          <p className="mt-2 text-slate-600">Choose your portal to continue.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {portals.map(({ title, detail, href, icon: Icon }) => (
            <Link key={href} href={href} className="group flex min-h-48 flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
              <Icon className="mb-5 h-7 w-7 text-[#2563eb]" />
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600">{detail}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb]">Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-center text-sm"><Link href="/" className="font-medium text-[#2563eb] hover:underline">Back to home</Link></p>
      </section>
    </main>
  );
}