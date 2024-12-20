import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    regularize: 0
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAttendanceStats();
      fetchAttendanceHistory();
    }
  }, [user]);

  const fetchAttendanceStats = async () => {
    if (!user?.employeeId) return;

    const db = getFirestore();
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const q = query(
      collection(db, "attendance"),
      where("employeeId", "==", user.employeeId),
      where("date", ">=", startOfMonth),
      where("date", "<=", endOfMonth)
    );

    try {
      const querySnapshot = await getDocs(q);
      let present = 0;
      let late = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'P') present++;
        if (data.status === 'PL') late++;
      });

      // Calculate working days in current month (excluding weekends)
      const workingDays = Array.from(
        { length: endOfMonth.getDate() },
        (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
      ).filter(date =>![0, 6].includes(date.getDay())).length;

      setStats({
        present,
        late,
        absent: workingDays - (present + late),
        regularize: 0 // To be implemented with regularization system
      });
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!user?.employeeId) return;

    const db = getFirestore();
    const q = query(
      collection(db, "attendance"),
      where("employeeId", "==", user.employeeId)
    );

    try {
      const querySnapshot = await getDocs(q);
      const attendanceHistory = querySnapshot.docs.map((doc) => doc.data());
      setAttendanceHistory(attendanceHistory);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.present}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Regularize</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.regularize}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Date: {format(new Date(), 'PPP')}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {stats.present > 0? 'Present' : 'Not Marked'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Photo</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((attendance) => (
                  <tr key={attendance.date}>
                    <td className="px-4 py-2">{format(attendance.date, 'PPP')}</td>
                    <td className="px-4 py-2">{attendance.status}</td>
                    <td className="px-4 py-2">
                      <img src={attendance.photo} alt="Attendance Photo" className="w-20 h-20 object-cover" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
