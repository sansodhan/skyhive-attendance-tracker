import React, { useRef, useEffect } from'react';
import { Button } from './ui/button';

interface CameraProps {
  onCapture: (photoBlob: Blob) => void;
  onError: (error: string) => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photoUrl, setPhotoUrl] = React.useState('');

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      onError('Failed to access camera');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
          const reader = new FileReader();
          reader.onload = () => {
            setPhotoUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', 0.8);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-lg shadow-lg"
      />
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Captured Photo"
          className="w-full rounded-lg shadow-lg mt-4"
        />
      )}
      <Button 
        onClick={capturePhoto}
        className="mt-4 w-full"
      >
        Capture Photo
      </Button>
    </div>
  );
};

export default Camera;
