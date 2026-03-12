/**
 * GPS Capture Component
 * Captures GPS coordinates with consent checking
 */
import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface GPSCaptureProps {
  patientId: string;
  hasConsent: boolean;
  onCapture: (latitude: number, longitude: number, accuracy: number) => void;
  autoCapture?: boolean;
}

interface GPSData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export default function GPSCapture({ 
  patientId, 
  hasConsent, 
  onCapture,
  autoCapture = true,
}: GPSCaptureProps) {
  const [gpsData, setGpsData] = useState<GPSData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const captureGPS = async () => {
    if (!hasConsent) {
      setError('Patient has not granted GPS tracking consent');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const data: GPSData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        };

        setGpsData(data);
        setLoading(false);

        // Call parent handler
        onCapture(data.latitude, data.longitude, data.accuracy);
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred while getting location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (autoCapture && hasConsent) {
      captureGPS();
    }
  }, [autoCapture, hasConsent]);

  if (!hasConsent) {
    return (
      <Alert className="border-yellow-500 bg-yellow-50">
        <AlertTriangle className="size-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          GPS tracking is disabled. Patient has not granted location tracking consent.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="size-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Alert className="border-blue-500 bg-blue-50">
        <MapPin className="size-4 text-blue-600 animate-pulse" />
        <AlertDescription className="text-blue-800">
          Capturing GPS location...
        </AlertDescription>
      </Alert>
    );
  }

  if (gpsData) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="size-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-1">
            <div className="font-semibold">GPS Location Captured</div>
            <div className="text-xs space-y-0.5">
              <div>Latitude: {gpsData.latitude.toFixed(6)}</div>
              <div>Longitude: {gpsData.longitude.toFixed(6)}</div>
              <div>Accuracy: ±{Math.round(gpsData.accuracy)}m</div>
              <div>Time: {gpsData.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
