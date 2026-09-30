'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Building2, ArrowRight, Zap, CheckCircle2, Shield, Activity, Users,
  BarChart3, Smartphone, Laptop, Wrench, Plug, AlertTriangle, Lightbulb
} from 'lucide-react'

// Constants for categories
const ISSUE_CATEGORIES = [
  { id: 'MAINTENANCE', name: 'Maintenance', icon: Wrench, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 'ELECTRICAL', name: 'Electrical', icon: Plug, color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { id: 'IT_SUPPORT', name: 'IT Support', icon: Laptop, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  { id: 'CLEANLINESS', name: 'Cleanliness', icon: Sparkles, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  { id: 'SAFETY', name: 'Safety', icon: AlertTriangle, color: 'bg-red-100 text-red-600 border-red-200' },
  { id: 'INFRASTRUCTURE', name: 'Infrastructure', icon: Building2, color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'SUGGESTION', name: 'Suggestion', icon: Lightbulb, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  { id: 'OTHER', name: 'Other', icon: Activity, color: 'bg-gray-100 text-gray-600 border-gray-200' },
]

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

const fadeInOnScroll = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target as HTMLElement;
      el.style.opacity = '1';
      el.classList.add('animate-fade-in');
      observer.unobserve(entry.target);
    }
  });
};

const slideUpOnScroll = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target as HTMLElement;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.classList.add('animate-slide-up');
      observer.unobserve(entry.target);
    }
  });
};

export default function LandingPage() {
  const fadeRefs = useRef<HTMLDivElement[]>([])
  const slideRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const fadeObserver = new IntersectionObserver(fadeInOnScroll, { threshold: 0.1 })
    const slideObserver = new IntersectionObserver(slideUpOnScroll, { threshold: 0.1 })

    fadeRefs.current.forEach(ref => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          ref.style.opacity = '1';
          ref.classList.add('animate-fade-in');
        } else {
          fadeObserver.observe(ref);
        }
      }
    })
    
    slideRefs.current.forEach(ref => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          ref.style.opacity = '1';
          ref.style.transform = 'translateY(0)';
          ref.classList.add('animate-slide-up');
        } else {
          slideObserver.observe(ref);
        }
      }
    })

    return () => {
      fadeObserver.disconnect()
      slideObserver.disconnect()
    }
  }, [])

  const addToFadeRefs = (el: HTMLDivElement | null) => {
    if (el && !fadeRefs.current.includes(el)) {
      fadeRefs.current.push(el)
    }
  }

  const addToSlideRefs = (el: HTMLDivElement | null) => {
    if (el && !slideRefs.current.includes(el)) {
      slideRefs.current.push(el)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
      
      {/* Navbar */}
      <header className="fixed w-full top-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-[#1e3a5f]" />
            <span className="font-bold text-xl text-[#1e3a5f]">Smart Campus</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student/access" className="text-sm font-medium text-slate-600 hover:text-[#2563eb] transition-colors hidden sm:block">
              Student Access
            </Link>
            <Link 
              href="/student/access" 
              className="bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Student: Report an Issue
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#1e3a5f]">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[25%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-3xl" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-left flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 max-w-2xl" ref={addToFadeRefs} style={{ opacity: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5" />
              <span>GRIET Official Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Your Campus.<br />
              Your Voice.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Faster Resolution.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed text-balance">
              Report campus problems in seconds. Smart Campus identifies the issue, routes it to the right team, and keeps you updated until it's resolved.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link 
                href="/student/access" 
                className="w-full sm:w-auto min-w-[220px] bg-[#2563eb] hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 group min-h-[46px]"
              >
                <span>Student: Report an Issue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/staff/access" className="w-full sm:w-auto min-w-[220px] border border-blue-200/50 bg-white/10 px-6 py-3.5 rounded-xl font-semibold text-white transition-colors hover:bg-white/15 flex items-center justify-center min-h-[46px]">
                Staff Portal
              </Link>
              <Link href="/admin/login" className="w-full sm:w-auto min-w-[220px] border border-blue-200/50 bg-white/10 px-6 py-3.5 rounded-xl font-semibold text-white transition-colors hover:bg-white/15 flex items-center justify-center min-h-[46px]">
                Administration Portal
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative" ref={addToSlideRefs} style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <div className="aspect-[4/3] bg-white rounded-2xl shadow-2xl p-2 relative overflow-hidden border border-white/20 ring-1 ring-black/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50 z-0" />
              {/* Mockup UI representation */}
              <div className="relative z-10 w-full h-full flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-4 h-6 flex-1 bg-white rounded border border-slate-200" />
                </div>
                <div className="flex-1 p-4 sm:p-6 grid grid-cols-2 gap-4">
                  <div className="col-span-2 h-20 bg-blue-50 rounded-lg border border-blue-100 flex items-center p-4 gap-4">
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 bg-blue-300 rounded" />
                      <div className="h-2 w-1/2 bg-blue-200 rounded" />
                    </div>
                  </div>
                  <div className="h-24 bg-slate-50 rounded-lg border border-slate-100 p-3 space-y-2">
                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                    <div className="h-2 w-full bg-slate-200 rounded" />
                    <div className="h-2 w-3/4 bg-slate-200 rounded" />
                  </div>
                  <div className="h-24 bg-slate-50 rounded-lg border border-slate-100 p-3 space-y-2">
                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                    <div className="h-2 w-full bg-slate-200 rounded" />
                    <div className="h-2 w-3/4 bg-slate-200 rounded" />
                  </div>
                  <div className="col-span-2 h-32 bg-slate-50 rounded-lg border border-slate-100 mt-2 flex flex-col justify-end p-4">
                     <div className="h-8 bg-[#2563eb] rounded w-1/3 self-end" />
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" ref={addToSlideRefs} style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How Smart Campus Works</h2>
            <p className="text-lg text-slate-600">A streamlined process from reporting to resolution, designed to keep our campus functioning perfectly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-slate-100 z-0" />
            
            {[
              { step: '01', title: 'Report', desc: 'Describe the issue clearly and choose its campus location.', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50' },
              { step: '02', title: 'Analyze', desc: 'AI auto-classifies the issue by urgency and category.', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
              { step: '03', title: 'Route', desc: 'Instantly assigned to the correct staff department.', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { step: '04', title: 'Resolve', desc: 'Track progress live until the issue is fixed.', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' }
            ].map((item, i) => (
              <div 
                key={i} 
                className="relative z-10 flex flex-col items-center text-center"
                ref={addToSlideRefs} 
                style={{ opacity: 0, transform: 'translateY(32px)', animationDelay: `${i * 150}ms` }}
              >
                <div className={`w-24 h-24 rounded-full ${item.bg} flex items-center justify-center mb-6 shadow-sm border border-white ring-4 ring-white`}>
                  <item.icon className={`w-10 h-10 ${item.color}`} />
                </div>
                <div className="text-sm font-bold text-slate-400 mb-2 tracking-widest uppercase">Step {item.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" ref={addToSlideRefs} style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful Features for Everyone</h2>
            <p className="text-lg text-slate-600">Built to handle the complexity of a modern campus with intuitive tools for students, staff, and administration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'AI Classification', desc: 'Smart algorithms automatically categorize issues and determine priority levels.', icon: Zap },
              { title: 'Real-time Tracking', desc: 'Know exactly where your reported issue stands in the resolution process at any time.', icon: Activity },
              { title: 'Smart Routing', desc: 'Issues are instantly routed to the specific department responsible for that category.', icon: ArrowRight },
              { title: 'Analytics Dashboard', desc: 'Comprehensive insights for administration to monitor resolution times and trends.', icon: BarChart3 },
              { title: 'Priority Management', desc: 'Critical issues are escalated automatically to ensure safety and campus operations.', icon: AlertTriangle },
              { title: 'Secure & Verified', desc: 'Integrated with college ID system ensuring authentic reports and responsible usage.', icon: Shield }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                ref={addToSlideRefs}
                style={{ opacity: 0, transform: 'translateY(32px)' }}
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Issue Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" ref={addToSlideRefs} style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Comprehensive Coverage</h2>
            <p className="text-lg text-slate-600">Report anything across campus. Our system handles it all.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {ISSUE_CATEGORIES.map((cat, i) => (
              <div 
                key={cat.id} 
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-3 transition-transform hover:scale-105 ${cat.color} bg-opacity-30`}
                ref={addToFadeRefs}
                style={{ opacity: 0 }}
              >
                <cat.icon className="w-8 h-8" />
                <span className="font-semibold text-sm">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based workflows */}
      <section className="py-20 bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" ref={addToSlideRefs} style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <h2 className="text-3xl font-bold text-white mb-4">Designed for the Whole Community</h2>
            <p className="text-lg text-blue-200">Customized experiences tailored to what you need to do.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10" ref={addToSlideRefs} style={{ opacity: 0, transform: 'translateY(32px)' }}>
              <Users className="w-10 h-10 text-blue-300 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Students & Faculty</h3>
              <ul className="space-y-3 text-blue-100 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Quickly report issues</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Describe issues clearly</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Track status in real-time</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Vote on common issues</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10" ref={addToSlideRefs} style={{ opacity: 0, transform: 'translateY(32px)' }}>
              <Wrench className="w-10 h-10 text-amber-300 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Campus Staff</h3>
              <ul className="space-y-3 text-blue-100 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> View assigned tickets</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Update issue status</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Communicate with reporters</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Manage workload efficiently</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10" ref={addToSlideRefs} style={{ opacity: 0, transform: 'translateY(32px)' }}>
              <Shield className="w-10 h-10 text-purple-300 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Administration</h3>
              <ul className="space-y-3 text-blue-100 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Full campus overview</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Analytics and metrics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Manage users & permissions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Oversee critical issues</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-500" />
              <div>
                <span className="font-bold text-xl text-white block">Smart Campus</span>
                <span className="text-sm text-slate-500">GRIET Issue Management</span>
              </div>
            </div>
            
            <div className="text-sm text-slate-500 text-center md:text-right">
              &copy; {new Date().getFullYear()} Gokaraju Rangaraju Institute of Engineering and Technology.<br />
              All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
