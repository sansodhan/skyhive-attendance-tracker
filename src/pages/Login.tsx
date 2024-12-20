import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Camera from "@/components/Camera";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

  const getCurrentLocation = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported');
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const getIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
      return null;
    }
  };

  const handlePhotoCapture = async (photoBlob: Blob) => {
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
        status: new Date().getHours() < 9 || (new Date().getHours() === 9 && new Date().getMinutes() <= 30) ? 'P' : 'PL',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(employeeId, password);
      setShowCamera(true);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid employee ID or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/98e56d0a-4f02-4290-9ef1-bfe4bad98f11.png" 
              alt="Sky Investments Logo" 
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Sky Investments HRMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                placeholder="Enter your employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture Attendance Photo</DialogTitle>
          </DialogHeader>
          <Camera
            onCapture={handlePhotoCapture}
            onError={(error) => {
              toast({
                title: "Camera Error",
                description: error,
                variant: "destructive",
              });
              setShowCamera(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;