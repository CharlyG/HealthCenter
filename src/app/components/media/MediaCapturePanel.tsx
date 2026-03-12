/**
 * Media Capture Panel Component
 * 
 * HIPAA-compliant photo/video capture interface
 * 
 * Features:
 * - Camera preview
 * - Photo capture with annotation
 * - Video recording
 * - Upload to secure storage
 * - Metadata input
 */

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  X, 
  Upload, 
  Trash2, 
  FileImage,
  FileVideo,
  Check,
  Circle,
  Square,
  RotateCw
} from 'lucide-react';
import { useMediaCapture, CapturedMedia } from '../../hooks/useMediaCapture';

interface MediaCapturePanelProps {
  patientId?: string;
  visitId?: string;
  documentId?: string;
  onMediaCaptured?: (media: CapturedMedia) => void;
  onMediaUploaded?: (mediaId: string, url: string) => void;
  allowVideo?: boolean;
  className?: string;
}

export function MediaCapturePanel({
  patientId,
  visitId,
  documentId,
  onMediaCaptured,
  onMediaUploaded,
  allowVideo = true,
  className = ''
}: MediaCapturePanelProps) {
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<CapturedMedia | null>(null);

  const {
    isSupported,
    isCapturing,
    capturedMedia,
    isUploading,
    uploadProgress,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    startVideoRecording,
    stopVideoRecording,
    uploadMedia,
    deleteMedia,
    clearAll
  } = useMediaCapture({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    videoMaxDuration: 60,
    imageQuality: 0.85
  });

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleStartCamera = async () => {
    const success = await startCamera(facingMode);
    if (!success) {
      alert('Failed to start camera. Please check permissions.');
    }
  };

  const handleCapturePhoto = async () => {
    const metadata = {
      patientId,
      visitId,
      documentId,
      description: description.trim() || undefined,
      location: location.trim() || undefined
    };

    const media = await capturePhoto(metadata);
    if (media) {
      onMediaCaptured?.(media);
      setDescription('');
      setLocation('');
    }
  };

  const handleStartRecording = async () => {
    const success = await startVideoRecording();
    if (success) {
      setIsRecording(true);
    }
  };

  const handleStopRecording = async () => {
    const metadata = {
      patientId,
      visitId,
      documentId,
      description: description.trim() || undefined
    };

    const media = await stopVideoRecording(metadata);
    if (media) {
      onMediaCaptured?.(media);
      setIsRecording(false);
      setDescription('');
    }
  };

  const handleUpload = async (media: CapturedMedia) => {
    const result = await uploadMedia(media);
    if (result.success && result.url) {
      onMediaUploaded?.(media.id, result.url);
      alert('Media uploaded successfully');
    } else {
      alert(`Upload failed: ${result.error}`);
    }
  };

  const handleFlipCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => handleStartCamera(), 100);
  };

  if (!isSupported) {
    return (
      <div className={`p-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Camera capture is not supported in this browser. 
          Please use a modern browser like Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Camera Controls */}
      {!isCapturing && (
        <div className="flex gap-2">
          <button
            onClick={handleStartCamera}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Camera className="w-4 h-4" />
            Start Camera
          </button>

          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setMode('photo')}
              className={`px-4 py-2 flex items-center gap-2 font-medium transition-colors ${
                mode === 'photo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Camera className="w-4 h-4" />
              Photo
            </button>
            {allowVideo && (
              <button
                onClick={() => setMode('video')}
                className={`px-4 py-2 flex items-center gap-2 font-medium transition-colors border-l border-gray-300 dark:border-gray-600 ${
                  mode === 'video'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Video className="w-4 h-4" />
                Video
              </button>
            )}
          </div>
        </div>
      )}

      {/* Camera Preview */}
      {isCapturing && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video object-cover"
          />

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-full">
              <Circle className="w-3 h-3 fill-current animate-pulse" />
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}

          {/* Camera Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleFlipCamera}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Flip camera"
              >
                <RotateCw className="w-5 h-5 text-white" />
              </button>

              <div className="flex gap-3">
                {mode === 'photo' && (
                  <button
                    onClick={handleCapturePhoto}
                    className="p-4 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Capture photo"
                  >
                    <Camera className="w-6 h-6 text-gray-900" />
                  </button>
                )}

                {mode === 'video' && !isRecording && (
                  <button
                    onClick={handleStartRecording}
                    className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                    title="Start recording"
                  >
                    <Circle className="w-6 h-6 text-white fill-current" />
                  </button>
                )}

                {mode === 'video' && isRecording && (
                  <button
                    onClick={handleStopRecording}
                    className="p-4 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Stop recording"
                  >
                    <Square className="w-6 h-6 text-red-600 fill-current" />
                  </button>
                )}
              </div>

              <button
                onClick={stopCamera}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Close camera"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Metadata Input */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                className="px-3 py-2 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded border border-white/30 focus:border-white/50 focus:outline-none"
              />
              {mode === 'photo' && (
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Body location..."
                  className="px-3 py-2 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded border border-white/30 focus:border-white/50 focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Captured Media Gallery */}
      {capturedMedia.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Captured Media ({capturedMedia.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {capturedMedia.map((media) => (
              <div
                key={media.id}
                className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square"
              >
                {/* Thumbnail */}
                {media.type === 'photo' ? (
                  <img
                    src={media.dataUrl}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleUpload(media)}
                    disabled={isUploading}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50"
                    title="Upload"
                  >
                    <Upload className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => deleteMedia(media.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Media Type Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                  {media.type === 'photo' ? (
                    <FileImage className="w-3 h-3" />
                  ) : (
                    <FileVideo className="w-3 h-3" />
                  )}
                  {(media.size / 1024).toFixed(0)}KB
                </div>

                {/* Metadata */}
                {media.metadata?.description && (
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded truncate">
                    {media.metadata.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Uploading... {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* HIPAA Notice */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          🔒 <strong>HIPAA-Compliant:</strong> All media is encrypted and stored securely. 
          Access is restricted to authorized healthcare personnel only.
        </p>
      </div>
    </div>
  );
}
