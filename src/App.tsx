import React, { useState, useRef, useEffect } from 'react';
import { Camera, History, Zap, Download, RefreshCw, ChevronRight, ChevronLeft, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ERAS, Era, analyzeUserPhoto, travelInTime } from './services/gemini';

export default function App() {
  const [step, setStep] = useState<'capture' | 'select' | 'traveling' | 'result'>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState<Era | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadingMessages = [
    "Calibrating flux capacitor...",
    "Synchronizing temporal coordinates...",
    "Analyzing facial geometry for era-appropriate rendering...",
    "Bending the space-time continuum...",
    "Consulting historical archives...",
    "Materializing in the past...",
    "Adjusting vintage filters..."
  ];

  useEffect(() => {
    if (step === 'capture') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'traveling') {
      let index = 0;
      setLoadingMessage(loadingMessages[0]);
      interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure you have given permission.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setStep('select');
      }
    }
  };

  const handleTravel = async () => {
    if (!capturedImage || !selectedEra) return;

    setStep('traveling');
    setError(null);

    try {
      // Step 1: Analyze the photo using Gemini 3.1 Pro (Image Understanding)
      const analysis = await analyzeUserPhoto(capturedImage);
      
      // Step 2: Generate the time travel image using Gemini 2.5 Flash Image
      const result = await travelInTime(capturedImage, selectedEra.prompt, analysis);
      
      setResultImage(result);
      setStep('result');
    } catch (err) {
      console.error("Time travel failed:", err);
      setError("Temporal rift detected! The time travel failed. Please try again.");
      setStep('select');
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setSelectedEra(null);
    setResultImage(null);
    setStep('capture');
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `chronos-booth-${selectedEra?.id || 'travel'}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#141414] text-[#E4E3E0] flex items-center justify-center rounded-sm">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase">Chronos Booth</h1>
            <p className="text-[10px] uppercase opacity-50 font-mono">Temporal Imaging System v2.5</p>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Ready</span>
          </div>
          <div className="hidden md:block opacity-50">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {step === 'capture' && (
            <motion.div 
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-6xl font-serif italic tracking-tight leading-none">
                    Capture your <br /> present self.
                  </h2>
                  <p className="text-lg opacity-70 max-w-md">
                    To begin your journey through time, we need a clear image of your current physical form.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-xs font-mono uppercase opacity-50">
                    <span className="w-8 h-[1px] bg-[#141414]" />
                    Instructions
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight size={14} /> Look directly at the camera
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight size={14} /> Ensure good lighting on your face
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight size={14} /> No hats or sunglasses for best results
                    </li>
                  </ul>
                </div>

                <button 
                  onClick={capturePhoto}
                  className="group relative inline-flex items-center gap-3 bg-[#141414] text-[#E4E3E0] px-8 py-4 rounded-full overflow-hidden transition-all hover:pr-12"
                >
                  <Camera size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs">Capture Image</span>
                  <ChevronRight className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all" size={18} />
                </button>
              </div>

              <div className="relative aspect-square bg-[#141414] rounded-2xl overflow-hidden border-8 border-[#141414] shadow-2xl">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute inset-0 border border-white/20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-white/30 rounded-full pointer-events-none" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </motion.div>
          )}

          {step === 'select' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <button 
                    onClick={() => setStep('capture')}
                    className="text-[10px] uppercase font-mono flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={12} /> Retake Photo
                  </button>
                  <h2 className="text-5xl font-serif italic tracking-tight">Choose your destination.</h2>
                </div>
                <div className="hidden md:block w-32 h-32 rounded-lg overflow-hidden border border-[#141414]">
                  <img src={capturedImage!} alt="Captured" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ERAS.map((era) => (
                  <motion.div
                    key={era.id}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedEra(era)}
                    className={`group cursor-pointer border border-[#141414] p-4 transition-all ${
                      selectedEra?.id === era.id ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-white/50 hover:bg-white'
                    }`}
                  >
                    <div className="aspect-[4/3] mb-4 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                      <img src={era.image} alt={era.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold uppercase tracking-tighter text-lg">{era.name}</h3>
                        <p className={`text-xs opacity-60 ${selectedEra?.id === era.id ? 'text-[#E4E3E0]' : ''}`}>
                          {era.description}
                        </p>
                      </div>
                      {selectedEra?.id === era.id && <Sparkles size={16} className="text-yellow-400" />}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  disabled={!selectedEra}
                  onClick={handleTravel}
                  className={`group relative inline-flex items-center gap-3 px-12 py-5 rounded-full overflow-hidden transition-all ${
                    selectedEra 
                      ? 'bg-[#141414] text-[#E4E3E0] hover:scale-105 shadow-xl' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Zap size={20} className={selectedEra ? 'animate-pulse' : ''} />
                  <span className="font-bold uppercase tracking-widest text-sm">Initiate Time Travel</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'traveling' && (
            <motion.div 
              key="traveling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-12"
            >
              <div className="relative">
                <div className="w-48 h-48 border-4 border-[#141414] rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-0 border-4 border-dashed border-[#141414]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <History size={48} className="animate-pulse" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-serif italic">{loadingMessage}</h2>
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-[#141414] rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="w-full max-w-md bg-white/30 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 20, ease: "linear" }}
                  className="h-full bg-[#141414]"
                />
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="relative aspect-square bg-white p-4 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={resultImage!} 
                  alt="Time Travel Result" 
                  className="w-full h-full object-cover border border-gray-100"
                />
                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 border border-[#141414] text-[10px] font-mono uppercase">
                  Captured in {selectedEra?.name}
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-6xl font-serif italic tracking-tight">Welcome back.</h2>
                  <p className="text-lg opacity-70">
                    You've successfully returned from {selectedEra?.name}. Your temporal likeness has been preserved.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={downloadImage}
                    className="inline-flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                  >
                    <Download size={16} /> Save Memory
                  </button>
                  <button 
                    onClick={reset}
                    className="inline-flex items-center gap-2 border border-[#141414] px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                  >
                    <RefreshCw size={16} /> Travel Again
                  </button>
                </div>

                <div className="pt-8 border-t border-[#141414]/10">
                  <div className="text-[10px] font-mono uppercase opacity-50 mb-4">Temporal Metadata</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block opacity-40 uppercase">Destination</span>
                      <span className="font-bold">{selectedEra?.name}</span>
                    </div>
                    <div>
                      <span className="block opacity-40 uppercase">Status</span>
                      <span className="font-bold text-emerald-600">Stable</span>
                    </div>
                    <div>
                      <span className="block opacity-40 uppercase">Timestamp</span>
                      <span className="font-bold">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block opacity-40 uppercase">AI Processor</span>
                      <span className="font-bold">Gemini 3.1 & 2.5</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-3"
          >
            <Zap size={16} />
            {error}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full p-6 flex justify-between items-center pointer-events-none">
        <div className="text-[8px] font-mono uppercase opacity-30">
          Experimental Temporal Imaging Unit // No. 8472-B
        </div>
        <div className="text-[8px] font-mono uppercase opacity-30">
          Powered by Google Gemini
        </div>
      </footer>
    </div>
  );
}
