export interface User {
  uid: string;
  employeeId: string;
  name: string;
  role: 'admin' | 'employee';
  joiningDate: Date;
  active: boolean;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  loginTime: Date;
  logoutTime?: Date;
  status: 'P' | 'A' | 'PL';
  photo: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  ipAddress: string;
}

export interface RegularizationRequest {
  id: string;
  employeeId: string;
  date: Date;
  requestedTime: {
    login?: Date;
    logout?: Date;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: Date;
}