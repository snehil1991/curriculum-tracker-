'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const STATE_CENTER_MAP: Record<string, string[]> = {
    "Andhra Pradesh": ["8101 Bangarupalem", "8103 Padamata", "8105 Nuzividu", "8106 Jaggaiahpet", "8202 Gurukulam", "8204 Heal Paradise"],
    "Arunachal Pradesh": ["7201 RKM Aalo"],
    "Assam": ["9201 CNL Assam", "9202 Auxilium Assam", "9303 GNS Assam"],
    "Gujarat": ["4101 Radka", "4102 Pay center", "4203 Uttar Buniyadi"],
    "Madhya Pradesh": ["5201 Sandalpur"],
    "Maharashtra": ["1104 Dixit", "1106 Goshala", "1107 Motilal", "1108 Pahadi", "1109 Unnat Nagar", "1110 Worli", "1118 Poonam Nagar", "1119 Siddharth Nagar", "1122 Mithagar", "1124 Ahilyanagar", "1213 Vajreshwari", "1220 Vasind"],
    "Tamil Nadu": ["6201 Sevalaya"],
    "Telangana": ["2203 Jinnaram", "2204 Krushi home", "2205 Chegunta", "2207 BalaNagar", "2208 Gandhari", "2210 Spoorthi", "2211 Palwancha"],
    "West Bengal": ["3201 Parivaar (Boys)", "3202 Parivaar (Girls)"]
};

const STATES = Object.keys(STATE_CENTER_MAP);
const WEEKS = Array.from({ length: 26 }, (_, i) => `Week ${i + 1}`);
const SUBMISSION_TYPES = ['Day 1', 'Day 6'];

function CoachPortalContent() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);

    // Form inputs state
    const [coachName, setCoachName] = useState('');
    const [batch, setBatch] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [center, setCenter] = useState('');
    const [trainingWeek, setTrainingWeek] = useState('');
    const [submissionType, setSubmissionType] = useState('');

    const availableCenters = selectedState && STATE_CENTER_MAP[selectedState] ? STATE_CENTER_MAP[selectedState] : [];

    const handleUploadExecution = async (accessToken: string) => {
        try {
            setUploadProgress(20);

            // Generate clean target filename
            const cleanName = `${coachName.replace(/\s+/g, '_')}_${trainingWeek}_${submissionType.replace(/[/ ]/g, '_')}.mp4`;

            // 1. Handshake with Next.js Backend bypassing CORS locks safely submitting the specific Client Token
            const initUrlRes = await fetch('/api/init-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: cleanName,
                    mimeType: videoFile!.type || 'video/mp4',
                    size: videoFile!.size,
                    authToken: accessToken
                })
            });
            const initData = await initUrlRes.json();
            if (!initData.uploadUrl) throw new Error("Backend refused handshake: " + (initData.error || "Unknown"));

            const uploadUrl = initData.uploadUrl;

            // 2. Upload Raw HD File directly mapped from the browser gracefully using Robust XHR
            const existingDriveFileId = await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', uploadUrl, true);

                // Track genuine byte-level upload execution stream instead of static 50%
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.floor((event.loaded / event.total) * 100);
                        // Scale it between 20% and 70% visually!
                        setUploadProgress(20 + Math.floor(percentComplete * 0.5));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const res = JSON.parse(xhr.responseText);
                            resolve(res.id);
                        } catch (e) {
                            reject(new Error("Failed to map Google Drive ID response."));
                        }
                    } else {
                        reject(new Error(`Google API Server rejected the chunked payload with Status ${xhr.status}: ${xhr.statusText}`));
                    }
                };

                xhr.onerror = () => {
                    reject(new Error("Step 2 Failed: Browser aggressively terminated the connection to googleapis.com/upload during active XHR stream! This happens if an Ad-Blocker blocked the Google URL or CORS Preflight strictly failed."));
                };

                // Native streaming without memory alloc
                xhr.send(videoFile);
            });

            // 3. Mark the freshly created native generic video as viewable universally
            setUploadProgress(70);
            await fetch(`https://www.googleapis.com/drive/v3/files/${existingDriveFileId}/permissions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type: 'anyone', role: 'reader' })
            }).catch(e => console.warn("Failed to set public permissions natively, ignoring.", e));

            // 4. Delegate to Webhook logic to categorize generic folders natively
            setUploadProgress(90);
            let formData = new FormData();
            formData.append('coachName', coachName);
            formData.append('batch', batch);
            formData.append('state', selectedState);
            formData.append('center', center);
            formData.append('trainingWeek', trainingWeek);
            formData.append('submissionType', submissionType);
            formData.append('existingDriveFileId', existingDriveFileId);

            const res = await fetch('/api/submit-video', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Submission webhook logging failed internally');

            setSuccess(true);
            setVideoFile(null);
            setCoachName('');
            setBatch('');
            setSelectedState('');
            setCenter('');
            setTrainingWeek('');
            setSubmissionType('');
        } catch (err: any) {
            setError(err.message || 'An error occurred dynamically during the pipeline');
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    const login = useGoogleLogin({
        onSuccess: tokenResponse => {
            handleUploadExecution(tokenResponse.access_token);
        },
        onError: () => {
            setError("Google Drive authentication explicitly refused or cancelled. Try again.");
            setIsSubmitting(false);
            setUploadProgress(0);
        },
        scope: 'https://www.googleapis.com/auth/drive.file'
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!videoFile) {
            setError('Please select or record a generic video first.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        setSuccess(false);
        setUploadProgress(10);

        // This triggers the specific secure Google Popup immediately pushing handling to the pipeline!
        login();
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Coach Portal</h1>
                    <p className="text-neutral-400">Submit curriculum video progression</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-neutral-800 p-8 rounded-2xl shadow-xl border border-neutral-700/50">
                    {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">{error}</div>}
                    {success && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 rounded-lg">Video successfully streamed securely to generic Cloud Directory</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-neutral-300">Coach's Name</label>
                            <input type="text" value={coachName} onChange={(e) => setCoachName(e.target.value)} placeholder="Enter full name" required className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">State</label>
                            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} required className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none">
                                <option value="">Select State</option>
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Center</label>
                            <select value={center} onChange={(e) => setCenter(e.target.value)} required disabled={!selectedState} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none disabled:opacity-50">
                                <option value="">Select Center</option>
                                {availableCenters.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-neutral-300">Batch</label>
                            <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="Enter batch (e.g. B1, BX1, I1)" required className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Training Week</label>
                            <select value={trainingWeek} onChange={(e) => setTrainingWeek(e.target.value)} required className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none">
                                <option value="">Select Week</option>
                                {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Submission Type</label>
                            <select value={submissionType} onChange={(e) => setSubmissionType(e.target.value)} required className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none">
                                <option value="">Select Type</option>
                                {SUBMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mb-8 space-y-2">
                        <label className="text-sm font-medium text-neutral-300">HD Video Upload</label>
                        <div className="relative border-2 border-dashed border-neutral-700 hover:border-neutral-500 transition-colors rounded-xl p-8 text-center bg-neutral-900 overflow-hidden">
                            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} required className="absolute inset-x-0 inset-y-0 w-full h-full opacity-0 cursor-pointer z-10" />

                            <div className="pointer-events-none relative z-0">
                                {!videoFile ? (
                                    <>
                                        <svg className="w-10 h-10 mx-auto text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-neutral-300 font-medium text-lg">Record or tap to upload explicitly</p>
                                        <p className="text-neutral-500 text-sm mt-1">Unlimited file size • Cloud Auth Sync Native</p>
                                    </>
                                ) : (
                                    <div className="py-2">
                                        <svg className="w-10 h-10 mx-auto text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-white font-medium break-all">{videoFile.name}</p>
                                        <p className="text-neutral-400 text-sm mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full bg-blue-600 hover:bg-blue-500 overflow-hidden disabled:bg-neutral-800 disabled:text-neutral-400 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                        {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="absolute inset-y-0 left-0 bg-blue-400/30 transition-all duration-300 ease-linear" style={{ width: `${uploadProgress}%` }} />
                        )}

                        <div className="relative z-10 flex items-center justify-center gap-2">
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {uploadProgress === 10 && 'Awaiting Authoritative Generic Google Login...'}
                                    {uploadProgress === 20 && 'Initiating Native Chunking Session...'}
                                    {uploadProgress === 50 && 'Streaming original HD file natively...'}
                                    {uploadProgress === 70 && 'Setting internal generic accessibility layers...'}
                                    {uploadProgress === 90 && 'Verifying webhook payload generic structure...'}
                                </>
                            ) : (
                                'Submit HD Generic Pipeline Video'
                            )}
                        </div>
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-neutral-400 hover:text-white transition-colors underline-offset-4 hover:underline">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CoachPortal() {
    return (
        <GoogleOAuthProvider clientId="439589841780-48ilddlvuokp6vfrq9qu0df4s68olneo.apps.googleusercontent.com">
            <CoachPortalContent />
        </GoogleOAuthProvider>
    )
}
