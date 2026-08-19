'use client';
import Link from 'next/link';

export default function Home() {

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black text-white selection:bg-blue-500/30">
      <div className="max-w-4xl w-full text-center space-y-8 z-10 px-4 md:px-0">

        <div className="inline-block mb-4 p-4 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
          <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>

        <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-500 mb-6 tracking-tight drop-shadow-sm">
          Curriculum Tracker
        </h1>

        <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 font-medium">
          Elevating basketball coaching through structured progression tracking and video execution analysis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">

          <Link
            href="/coach"
            className="group relative flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-700 hover:border-blue-500/50 rounded-2xl transition-all hover:bg-neutral-800 overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(37,99,235,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2 z-10 text-white">Coach Portal</h2>
            <p className="text-neutral-400 text-sm z-10 text-center">Submit your weekly curriculum progression and upload execution videos.</p>
          </Link>

          <Link
            href="/senior"
            className="group relative flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-700 hover:border-emerald-500/50 rounded-2xl transition-all hover:bg-neutral-800 overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(5,150,105,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h2 className="text-2xl font-bold mb-2 z-10 text-white">Senior Dashboard</h2>
            <p className="text-neutral-400 text-sm z-10 text-center">Review submissions, track state progress, and provide interventions.</p>
          </Link>

        </div>
      </div>

      <div className="absolute top-0 right-0 p-[20%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 p-[20%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
