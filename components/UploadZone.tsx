import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, Camera, Loader2, Link as LinkIcon, FileText, AlertCircle, X, RotateCcw } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (base64: string, mimeType: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clean up stream on unmount to ensure camera light goes off (Privacy)
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleStreamSuccess = (stream: MediaStream) => {
    setCameraStream(stream);
    setIsCameraOpen(true);
    // Slight delay to allow modal to render before attaching stream
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }, 100);
  };

  const startCamera = async () => {
    setError(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API is not supported in this browser.");
      return;
    }

    try {
      // Try with ideal constraints first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 } 
        } 
      });
      handleStreamSuccess(stream);
    } catch (err: any) {
      console.error("Camera access error:", err);

      // Attempt fallback with minimal constraints if ideal failed due to constraints
      if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
         try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
            handleStreamSuccess(fallbackStream);
            return;
         } catch (fallbackErr) {
            console.error("Fallback camera access error:", fallbackErr);
         }
      }

      // Descriptive error messages
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera permission was denied. Please check your browser settings and try again.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No camera found on this device.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError("Camera is currently in use by another application.");
      } else {
        setError("Could not access camera. Please check permissions or upload a file.");
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const base64 = dataUrl.split(',')[1];
        
        stopCamera(); // Stop stream immediately after capture
        onImageSelected(base64, 'image/jpeg');
      }
    }
  };

  const processFile = (file: File) => {
    setLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      const mimeType = file.type || 'application/pdf'; 
      onImageSelected(base64, mimeType);
      setLoading(false);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const processUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(urlInput);
      if (!response.ok) throw new Error(`Failed to load URL: ${response.statusText}`);
      
      const blob = await response.blob();
      const mimeType = blob.type;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        onImageSelected(base64, mimeType);
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      setError("Could not load URL directly. Please upload the file instead.");
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        processFile(file);
      } else {
        setError("Please upload an Image or a PDF file.");
      }
    }
  }, [onImageSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      
      {/* Live Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-3xl aspect-[3/4] md:aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               className="w-full h-full object-cover"
             />
             <canvas ref={canvasRef} className="hidden" />
             
             {/* Camera Controls */}
             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                <button 
                  onClick={stopCamera}
                  className="p-4 bg-slate-800/80 text-white rounded-full hover:bg-slate-700 backdrop-blur-sm"
                >
                  <X size={24} />
                </button>
                
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 hover:border-brand-500 hover:scale-105 transition-all shadow-lg flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-100"></div>
                </button>
                
                <div className="w-14"></div> {/* Spacer for layout balance */}
             </div>
          </div>
          <p className="text-white mt-4 text-sm opacity-70">Align document and tap circle to capture</p>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative border-4 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all duration-300 flex flex-col items-center gap-6
          ${isDragOver 
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-102' 
            : 'border-slate-300 dark:border-slate-700 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
        `}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-16 h-16 text-brand-500 animate-spin mb-4" />
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">Processing material...</p>
          </div>
        ) : (
          <>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg relative group transition-colors">
              <Upload className="w-12 h-12 text-brand-500 relative z-10" />
              <div className="absolute inset-0 bg-brand-100 dark:bg-brand-900 rounded-full scale-0 group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Upload Learning Material</h3>
              <p className="text-slate-500 dark:text-slate-400">Drag & drop a page, PDF, or click to browse</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                <span className="font-bold">Privacy Note:</span> No files are saved to our servers. All processing happens in this session and is cleared upon refresh.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 w-full justify-center">
              <label className="cursor-pointer bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transform">
                <FileText size={20} />
                Select File
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileInput} />
              </label>
              
              <button 
                onClick={startCamera}
                className="bg-white dark:bg-slate-800 border-2 border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-slate-700 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 transform"
              >
                <Camera size={20} />
                Open Camera
              </button>
            </div>

            <div className="w-full flex items-center gap-4 my-2 opacity-50">
                <div className="h-px bg-slate-400 dark:bg-slate-600 flex-1"></div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">OR</span>
                <div className="h-px bg-slate-400 dark:bg-slate-600 flex-1"></div>
            </div>

            <form onSubmit={processUrl} className="w-full flex gap-2 relative">
                <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="url" 
                        placeholder="Paste a URL to an image or PDF..." 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                    />
                </div>
                <button 
                    type="submit"
                    disabled={!urlInput}
                    className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Go
                </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-xl flex items-start gap-2 text-left w-full border border-red-100 dark:border-red-800">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                <span>{error}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};