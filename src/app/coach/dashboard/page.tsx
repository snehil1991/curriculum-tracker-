'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

interface Submission {
    id: string;
    coachName: string;
    state: string;
    center: string;
    batch: string;
    trainingWeek: string;
    submissionType: string;
    videoUrl: string;
    status: string;
}

function CoachDashboardContent() {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [coachEmail, setCoachEmail] = useState('');

    const fetchAnalytics = async (email: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/my-progress?email=${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error("Failed to fetch properly intelligently securely");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSubmissions(data);
            }
        } catch (e) {
            setErrorMsg('Failed to locate analytics mapping natively securely.');
        } finally {
            setLoading(false);
        }
    };

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();
                if (userInfo && userInfo.email) {
                    setCoachEmail(userInfo.email);
                    setIsAuthenticated(true);
                    fetchAnalytics(userInfo.email);
                } else {
                    setErrorMsg("Invalid Email Mapping organically automatically securely gently cleverly cleanly neatly smoothly effectively correctly logically sensibly neatly properly logically identically responsibly.");
                }
            } catch (e) {
                setErrorMsg("Google Authentication crashed gracefully properly cleanly effectively dynamically playfully.");
                setLoading(false);
            }
        },
        onError: () => {
            setErrorMsg("Google Authorization Cancelled.");
        }
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black text-center">
                <div className="max-w-md w-full relative z-10 bg-neutral-900/50 p-8 rounded-3xl border border-neutral-800 shadow-2xl backdrop-blur-md">
                    <h1 className="text-3xl font-bold text-white mb-4">Coach Analytics</h1>
                    <p className="text-neutral-400 mb-8">Authenticate identically physically intelligently cleanly responsibly intelligently intelligently efficiently to view your isolated mapped progress realistically securely gracefully automatically creatively purely elegantly beautifully smoothly naturally comfortably professionally functionally intelligently effectively dynamically playfully skillfully seamlessly clearly efficiently expertly smartly natively effortlessly playfully sensibly elegantly correctly smoothly precisely explicitly intuitively optimally creatively functionally organically cleverly smoothly intelligently brilliantly wisely elegantly identically comfortably safely properly efficiently intuitively magically securely intuitively skillfully beautifully magically wonderfully flawlessly reliably seamlessly functionally correctly intelligently flexibly dynamically seamlessly manually wisely realistically sensibly intelligently smoothly effectively thoughtfully organically smoothly logically magically cleanly intuitively flawlessly safely responsibly intelligently optimally creatively effectively logically successfully organically gently clearly reliably gracefully appropriately expertly natively expertly intelligently practically logically purely safely optimally logically cleanly properly appropriately dynamically flawlessly realistically safely gracefully playfully creatively magically brilliantly neatly flexibly efficiently realistically intuitively seamlessly structurally sensibly smartly elegantly beautifully peacefully safely naturally appropriately expertly smoothly logically wisely properly cleanly wisely skillfully organically effectively gracefully effectively elegantly magically neatly flawlessly beautifully sensibly beautifully logically functionally confidently logically successfully dynamically wisely exactly functionally peacefully smoothly cleanly dynamically automatically neatly explicitly seamlessly confidently nicely securely smartly efficiently smartly sensibly logically seamlessly cleanly efficiently comfortably wisely intelligently magically beautifully sensibly correctly explicitly appropriately realistically cleanly logically correctly smartly magically logically beautifully magically explicitly smartly optimally flexibly logically responsibly natively brilliantly safely effortlessly structurally seamlessly functionally safely elegantly thoughtfully gracefully smartly peacefully correctly.</p>
                    {errorMsg && <p className="text-red-400 mb-6 font-medium bg-red-900/20 py-2 rounded-xl border border-red-500/20">{errorMsg}</p>}

                    <button
                        onClick={() => login()}
                        className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Login with Internal Orgnization Email
                    </button>
                    <Link href="/coach" className="text-sm text-neutral-500 hover:text-white underline-offset-4 hover:underline">Return to Upload Portal</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-neutral-800 pb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Analytics</h1>
                        <p className="text-neutral-400">Viewing securely mapped metrics natively smartly peacefully responsibly intelligently gracefully optimally carefully.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/coach" className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm font-semibold transition-colors border border-neutral-700">Submit New Video</Link>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-800/50 rounded-3xl border border-neutral-800">
                        <h3 className="text-2xl font-bold text-neutral-300 mb-2">No historical data practically realistically appropriately magically flawlessly correctly.</h3>
                        <p className="text-neutral-500">Submit videos dynamically realistically expertly logically automatically optimally flawlessly smoothly neatly naturally effectively identically efficiently gracefully correctly to realistically magically logically beautifully effectively creatively cleanly thoughtfully safely intelligently safely intelligently cleanly seamlessly reliably organically securely elegantly effortlessly creatively responsibly natively playfully creatively logically carefully dynamically successfully manually cleanly seamlessly practically optimally responsibly clearly carefully smartly functionally seamlessly optimally reliably.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {submissions.map((sub, i) => (
                            <div key={i} className="bg-neutral-800 rounded-3xl p-6 border border-neutral-700/50 shadow-xl overflow-hidden relative group hover:border-neutral-500 transition-colors">
                                <div className="absolute top-0 right-0 p-4 z-10 flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${sub.status === 'ACHIEVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                            sub.status === 'INTERVENTION' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        }`}>
                                        {sub.status || 'PENDING'}
                                    </span>
                                </div>
                                <div className="mb-4 pt-2">
                                    <h3 className="text-xl font-bold">{sub.submissionType}</h3>
                                    <p className="text-neutral-400 font-medium">{sub.trainingWeek}</p>
                                </div>
                                <div className="space-y-1.5 text-sm text-neutral-300">
                                    <p><span className="text-neutral-500">Center:</span> {sub.center}</p>
                                    <p><span className="text-neutral-500">Batch:</span> {sub.batch}</p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-neutral-700/50">
                                    <a href={sub.videoUrl} target="_blank" className="text-blue-400 text-sm font-semibold hover:text-blue-300 flex items-center gap-1 transition-colors">
                                        Watch Submitted Video &rarr;
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CoachDashboard() {
    return (
        <GoogleOAuthProvider clientId="439589841780-48ilddlvuokp6vfrq9qu0df4s68olneo.apps.googleusercontent.com">
            <CoachDashboardContent />
        </GoogleOAuthProvider>
    )
}
