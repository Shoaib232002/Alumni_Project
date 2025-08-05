// Type definitions for the Alumni Management System

export interface Alumni {
  id: string;
  name: string;
  email: string;
  phone?: string;
  batch: string; // graduation year
  degree: string;
  currentCompany?: string;
  designation?: string;
  linkedInProfile?: string;
  naukriProfile?: string;
  otherProfiles?: { [key: string]: string };
  bio?: string;
  image?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  alumniId: string;
  alumniName: string;
  text?: string;
  videoUrl?: string;
  rating?: number;
  createdAt: string;
  isApproved: boolean;
}

export interface FundraisingCampaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  image?: string;
  isActive: boolean;
}

export interface Donation {
  id: string;
  campaignId: string;
  alumniId?: string;
  amount: number;
  name: string;
  email: string;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isVerified: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  for: 'admin' | 'all';
}

export interface CollegeInfo {
  name: string;
  location: string;
  established: string;
  website: string;
  logo: string;
}