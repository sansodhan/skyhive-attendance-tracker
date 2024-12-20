import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const Camera = ({ onCapture, onError }) => {
  const [photo, setPhoto] = useState(null);

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const photoBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      });
      setPhoto(photoBlob);
      onCapture(photoBlob);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <div>
      <button onClick={handleCapture}>Capture Photo</button>
      {photo && (
        <img src={URL.createObjectURL(photo)} alt="Captured Photo" />
      )}
    </div>
  );
};

const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const storage = getStorage();
  const db = getFirestore();

  const handlePhotoCapture = async (photoBlob) => {
    try {
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `attendance-photos/${employeeId}/${timestamp}.jpg`);
      await uploadBytes(storageRef, photoBlob);
      const photoUrl = await getDownloadURL(storageRef);
      
      const location = await getCurrentLocation();
      const ipAddress = await getIPAddress();
      
      // Save attendance record
      const attendanceRef = doc(db, 'attendance', `${employeeId}_${timestamp}`);
      await setDoc(attendanceRef, {
        employeeId,
        date: serverTimestamp(),
        loginTime: serverTimestamp(),
        status: new Date().getHours() < 9 || (new Date().getHours() === 9 && new Date().getMinutes() <= 30)? 'P' : 'PL',
        photo: photoUrl,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: 'To be implemented with geocoding service'
        },
        ipAddress
      });

      setShowCamera(false);
      navigate("/dashboard");
    } catch (error) {
      console.error('Error processing login:', error);
      toast({
        title: "Error",
        description: "Failed to process login. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(employeeId, password);
      setShowCamera(true);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description:
