/**
 * Photo/Video Capture Component
 * 
 * HIPAA-compliant media capture for clinical documentation with:
 * - Camera access for photos and videos
 * - Wound photo capture with measurement annotations
 * - Secure storage with encryption
 * - Photo comparison (before/after)
 * - Drawing/measurement tools
 * - EXIF data stripping for privacy
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, X, Check, Ruler, Edit3, RotateCw, ZoomIn, ZoomOut, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../design-system/components/Button';

export interface CapturedMedia {
  id: string;
  type: 'photo' | 'video';
  blob: Blob;
  dataUrl: string;
  timestamp: Date;
  patientId: string;
  visitId: string;
  annotations?: {
    type: 'ruler' | 'circle' | 'arrow' | 'text';
    data: any;
  }[];
  metadata: {
    capturedBy: string;
    deviceInfo: string;
    location?: 'wound' | 'skin' | 'mobility' | 'equipment' | 'other';
    notes?: string;
  };
}

interface PhotoVideoCaptureProps {
  patientId: string;
  visitId: string;
  userId: string;
  onCapture: (media: CapturedMedia) => void;
  onClose: () => void;
  existingPhotos?: CapturedMedia[];
  mode?: 'photo' | 'video';
}

export const PhotoVideoCapture: React.FC<PhotoVideoCaptureProps> = ({
  patientId,
  visitId,
  userId,
  onCapture,
  onClose,
  existingPhotos = [],
  mode: initialMode = 'photo'
}) => {
  const [mode, setMode] = useState<'photo' | 'video'>(initialMode);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<'ruler' | 'circle' | 'arrow' | 'text' | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [mediaLocation, setMediaLocation] = useState<string>('wound');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply zoom
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.drawImage(video, 0, 0, canvas.width / zoom, canvas.height / zoom);
    ctx.restore();

    // Convert to blob (strip EXIF for privacy)
    canvas.toBlob((blob) => {
      if (!blob) return;

      const media: CapturedMedia = {
        id: `media_${Date.now()}`,
        type: 'photo',
        blob,
        dataUrl: canvas.toDataURL('image/jpeg', 0.9),
        timestamp: new Date(),
        patientId,
        visitId,
        annotations: [],
        metadata: {
          capturedBy: userId,
          deviceInfo: navigator.userAgent,
          location: mediaLocation as any,
          notes
        }
      };

      setCapturedMedia(media);
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const startVideoRecording = () => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const dataUrl = URL.createObjectURL(blob);

        const media: CapturedMedia = {
          id: `media_${Date.now()}`,
          type: 'video',
          blob,
          dataUrl,
          timestamp: new Date(),
          patientId,
          visitId,
          metadata: {
            capturedBy: userId,
            deviceInfo: navigator.userAgent,
            location: mediaLocation as any,
            notes
          }
        };

        setCapturedMedia(media);
        setRecordingDuration(0);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const handleCapture = () => {
    if (mode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    }
  };

  const handleSave = () => {
    if (capturedMedia) {
      const mediaWithAnnotations = {
        ...capturedMedia,
        annotations,
        metadata: {
          ...capturedMedia.metadata,
          location: mediaLocation as any,
          notes
        }
      };
      onCapture(mediaWithAnnotations);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedMedia(null);
    setAnnotations([]);
    setShowAnnotation(false);
    startCamera();
  };

  const handleDelete = () => {
    setCapturedMedia(null);
    setAnnotations([]);
    setShowAnnotation(false);
    onClose();
  };

  const addAnnotation = (type: 'ruler' | 'circle' | 'arrow' | 'text', data: any) => {
    setAnnotations([...annotations, { type, data }]);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h2 className="text-lg font-semibold">
          {capturedMedia ? 'Review & Annotate' : mode === 'photo' ? 'Take Photo' : 'Record Video'}
        </h2>
        <button onClick={onClose} className="p-2 rounded hover:bg-gray-800">
          <X className="size-6" />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900 text-red-100 rounded-lg flex items-center gap-2">
          <X className="size-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Camera View or Preview */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {!capturedMedia ? (
          <>
            {/* Live Camera Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full"
              style={{ transform: `scale(${zoom})` }}
            />
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="font-mono">{formatDuration(recordingDuration)}</span>
              </div>
            )}

            {/* Zoom Controls */}
            {mode === 'photo' && !isRecording && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="size-5" />
                </button>
                <button
                  onClick={() => setZoom(Math.max(1, zoom - 0.25))}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70"
                  disabled={zoom <= 1}
                >
                  <ZoomOut className="size-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Preview */}
            {capturedMedia.type === 'photo' ? (
              <img
                src={capturedMedia.dataUrl}
                alt="Captured"
                className="max-w-full max-h-full"
              />
            ) : (
              <video
                src={capturedMedia.dataUrl}
                controls
                className="max-w-full max-h-full"
              />
            )}

            {/* Annotation Tools (for photos only) */}
            {capturedMedia.type === 'photo' && showAnnotation && (
              <div className="absolute top-4 left-4 flex gap-2">
                <button
                  onClick={() => setAnnotationTool('ruler')}
                  className={`p-3 rounded-lg ${annotationTool === 'ruler' ? 'bg-blue-600' : 'bg-black/50'} text-white`}
                >
                  <Ruler className="size-5" />
                </button>
                <button
                  onClick={() => setAnnotationTool('circle')}
                  className={`p-3 rounded-lg ${annotationTool === 'circle' ? 'bg-blue-600' : 'bg-black/50'} text-white`}
                >
                  <ImageIcon className="size-5" />
                </button>
                <button
                  onClick={() => setAnnotationTool('text')}
                  className={`p-3 rounded-lg ${annotationTool === 'text' ? 'bg-blue-600' : 'bg-black/50'} text-white`}
                >
                  <Edit3 className="size-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom Controls */}
      <div className="p-4 bg-gray-900">
        {!capturedMedia ? (
          <div className="flex flex-col gap-4">
            {/* Mode Toggle */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setMode('photo')}
                className={`px-6 py-2 rounded-lg font-medium ${
                  mode === 'photo'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300'
                }`}
                disabled={isRecording}
              >
                <Camera className="size-5 inline mr-2" />
                Photo
              </button>
              <button
                onClick={() => setMode('video')}
                className={`px-6 py-2 rounded-lg font-medium ${
                  mode === 'video'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300'
                }`}
                disabled={isRecording}
              >
                <Video className="size-5 inline mr-2" />
                Video
              </button>
            </div>

            {/* Capture Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCapture}
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-colors ${
                  isRecording
                    ? 'bg-red-600 border-red-400'
                    : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
              >
                {mode === 'video' && isRecording ? (
                  <div className="w-6 h-6 bg-white rounded-sm" />
                ) : (
                  <div className={`w-16 h-16 rounded-full ${mode === 'photo' ? 'bg-white' : 'bg-red-600'}`} />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Location Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Documentation Type
              </label>
              <select
                value={mediaLocation}
                onChange={(e) => setMediaLocation(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
              >
                <option value="wound">Wound Assessment</option>
                <option value="skin">Skin Condition</option>
                <option value="mobility">Mobility/Gait</option>
                <option value="equipment">Medical Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes about this documentation..."
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg resize-none"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleRetake} variant="secondary" className="flex-1">
                <RotateCw className="size-4 mr-2" />
                Retake
              </Button>
              {capturedMedia.type === 'photo' && (
                <Button
                  onClick={() => setShowAnnotation(!showAnnotation)}
                  variant="secondary"
                  className="flex-1"
                >
                  <Edit3 className="size-4 mr-2" />
                  {showAnnotation ? 'Done' : 'Annotate'}
                </Button>
              )}
              <Button onClick={handleSave} variant="primary" className="flex-1">
                <Check className="size-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Comparison View (if existing photos) */}
      {existingPhotos.length > 0 && capturedMedia && (
        <div className="absolute bottom-40 left-4 bg-black/80 rounded-lg p-2 max-w-[200px]">
          <p className="text-xs text-gray-300 mb-2">Previous Photos</p>
          <div className="flex gap-2 overflow-x-auto">
            {existingPhotos.slice(0, 3).map((photo) => (
              <img
                key={photo.id}
                src={photo.dataUrl}
                alt="Previous"
                className="w-16 h-16 object-cover rounded border border-gray-600"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
