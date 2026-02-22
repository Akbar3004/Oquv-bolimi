import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowLeft, Hash, User, CheckCircle, XCircle, AlertTriangle, Loader2, Scan } from 'lucide-react';

export default function ExamLoginPage({ onSwitchToLogin, workers, onVerified }) {
    const [step, setStep] = useState('tabel'); // 'tabel' | 'camera' | 'verifying' | 'success' | 'error'
    const [tabelId, setTabelId] = useState('');
    const [foundWorker, setFoundWorker] = useState(null);
    const [error, setError] = useState('');
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Kamerani boshlash
    const startCamera = useCallback(async () => {
        try {
            setCameraError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error('Camera error:', err);
            setCameraError("Kameraga ruxsat berilmadi yoki kamera topilmadi!");
        }
    }, []);

    // Kamerani to'xtatish
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // Step o'zgarganda kamerani boshqarish
    useEffect(() => {
        if (step === 'camera') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [step, startCamera, stopCamera]);

    // Tabel raqamni tekshirish
    const handleTabelSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!tabelId.trim()) {
            setError("Tabel raqamni kiriting!");
            return;
        }

        // Xodimlar ichidan qidirish
        const worker = workers.find(w => {
            const workerTabel = w.tabelId ? w.tabelId.toString() : (1000 + w.id).toString();
            return workerTabel === tabelId.trim();
        });

        if (!worker) {
            setError("Bu tabel raqam bo'yicha xodim topilmadi!");
            return;
        }

        setFoundWorker(worker);
        setStep('camera'); // Kamerani ochish
    };

    // Yuzni "tasdiqlash" (simulyatsiya — real projectda Face API ishlatiladi)
    const handleVerifyFace = async () => {
        setStep('verifying');

        // Rasm olish (canvas orqali)
        if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
        }

        // Simulyatsiya - 2 soniya kutish (real projectda bu yerda Face Recognition API ishlatiladi)
        await new Promise(r => setTimeout(r, 2500));

        // Muvaffaqiyatli tasdiqlash (demo)
        stopCamera();
        setStep('success');

        // 1.5 soniyadan keyin imtihon interfeysiga o'tish
        setTimeout(() => {
            onVerified(foundWorker);
        }, 1500);
    };

    // Qayta urinish
    const handleRetry = () => {
        setStep('camera');
    };

    // Orqaga qaytish
    const handleBack = () => {
        stopCamera();
        setStep('tabel');
        setFoundWorker(null);
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0e1a]">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/3 -left-20 w-96 h-96 bg-amber-600/15 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-orange-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[150px]" />

                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-amber-900/10 overflow-hidden">
                    {/* Header */}
                    <div className="relative px-8 pt-8 pb-4">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={step === 'tabel' ? onSwitchToLogin : handleBack}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Imtihon Topshirish</h1>
                                <p className="text-xs text-slate-500">Tabel raqam + Yuz tasdiqlash</p>
                            </div>
                        </div>

                        {/* Steps Indicator */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`flex-1 h-1 rounded-full transition-colors duration-500 ${step === 'tabel' ? 'bg-amber-500' : 'bg-amber-500'}`} />
                            <div className={`flex-1 h-1 rounded-full transition-colors duration-500 ${['camera', 'verifying', 'success'].includes(step) ? 'bg-amber-500' : 'bg-white/10'}`} />
                            <div className={`flex-1 h-1 rounded-full transition-colors duration-500 ${step === 'success' ? 'bg-green-500' : 'bg-white/10'}`} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-600 uppercase tracking-wider px-1">
                            <span>Tabel raqam</span>
                            <span>Yuz tasdiqlash</span>
                            <span>Tayyor</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-8 pb-8">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Tabel ID */}
                            {step === 'tabel' && (
                                <motion.div
                                    key="tabel"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Icon */}
                                    <div className="flex justify-center mb-6 mt-4">
                                        <motion.div
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 relative"
                                        >
                                            <Hash className="w-10 h-10 text-white" />
                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl blur-xl opacity-30" />
                                        </motion.div>
                                    </div>

                                    <form onSubmit={handleTabelSubmit} className="space-y-5">
                                        {/* Error */}
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                                    className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                                                >
                                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                                    <span>{error}</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                Tabel Raqam
                                            </label>
                                            <div className="relative group">
                                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                                                <input
                                                    id="exam-tabel-input"
                                                    type="text"
                                                    value={tabelId}
                                                    onChange={(e) => { setTabelId(e.target.value); setError(''); }}
                                                    placeholder="Tabel raqamingizni kiriting..."
                                                    autoFocus
                                                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-center text-lg font-mono tracking-widest"
                                                />
                                            </div>
                                        </div>

                                        <motion.button
                                            id="exam-tabel-submit"
                                            type="submit"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all duration-300 relative overflow-hidden group"
                                        >
                                            <Camera className="w-5 h-5" />
                                            <span>Davom etish</span>
                                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        </motion.button>
                                    </form>
                                </motion.div>
                            )}

                            {/* Step 2: Camera / Face Verification */}
                            {(step === 'camera' || step === 'verifying') && (
                                <motion.div
                                    key="camera"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5 mt-4"
                                >
                                    {/* Worker Info */}
                                    {foundWorker && (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {foundWorker.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">{foundWorker.name}</p>
                                                <p className="text-blue-400 text-xs">{foundWorker.sex} • Tabel: {foundWorker.tabelId || (1000 + foundWorker.id)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Camera View */}
                                    <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-[4/3]">
                                        {cameraError ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-6 text-center">
                                                <XCircle className="w-12 h-12 mb-3" />
                                                <p className="text-sm">{cameraError}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="w-full h-full object-cover"
                                                    style={{ transform: 'scaleX(-1)' }}
                                                />
                                                <canvas ref={canvasRef} className="hidden" />

                                                {/* Face Scan Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <motion.div
                                                        animate={step === 'verifying' ? { borderColor: ['rgba(251,191,36,0.5)', 'rgba(34,197,94,0.5)'] } : {}}
                                                        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                                                        className="w-48 h-56 border-2 border-amber-400/50 rounded-3xl relative"
                                                    >
                                                        {/* Corner Marks */}
                                                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-xl" />
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-xl" />
                                                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-xl" />
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-xl" />

                                                        {/* Scan Line */}
                                                        {step === 'verifying' && (
                                                            <motion.div
                                                                animate={{ y: [0, 200, 0] }}
                                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                                className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                                                            />
                                                        )}
                                                    </motion.div>
                                                </div>

                                                {/* Status Text */}
                                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-sm">
                                                        {step === 'verifying' ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                                                                <span className="text-amber-400">Yuz tasdiqlanmoqda...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Scan className="w-4 h-4 text-white" />
                                                                <span className="text-white">Yuzingizni ramkaga joylashtiring</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Verify Button */}
                                    {step === 'camera' && !cameraError && (
                                        <motion.button
                                            id="verify-face-btn"
                                            onClick={handleVerifyFace}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 transition-all duration-300"
                                        >
                                            <Scan className="w-5 h-5" />
                                            <span>Yuzni Tasdiqlash</span>
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 3: Success */}
                            {step === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center py-10 space-y-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                                    >
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h2 className="text-xl font-bold text-white">Tasdiqlandi!</h2>
                                    <p className="text-slate-400 text-sm text-center">
                                        {foundWorker?.name}, imtihon interfeysi ochilmoqda...
                                    </p>
                                    <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mt-2" />
                                </motion.div>
                            )}

                            {/* Error State */}
                            {step === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center py-10 space-y-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30"
                                    >
                                        <XCircle className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h2 className="text-xl font-bold text-white">Tasdiqlanmadi!</h2>
                                    <p className="text-slate-400 text-sm text-center">
                                        Yuz mos kelmadi. Qayta urinib ko'ring.
                                    </p>
                                    <button
                                        onClick={handleRetry}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                                    >
                                        Qayta urinish
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom decoration */}
                    <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                </div>
            </motion.div>
        </div>
    );
}
