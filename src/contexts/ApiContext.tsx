import React, { createContext, useContext, ReactNode } from 'react';

import { 
  Alumni, 
  Feedback, 
  FundraisingCampaign, 
  Donation, 
  Notification, 
  CollegeInfo 
} from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface ApiContextType {
  // Alumni methods
  getAlumniList: () => Promise<Alumni[]>;
  getAlumniById: (id: string) => Promise<Alumni | null>;
  getAlumniByBatch: (batch: string) => Promise<Alumni[]>;
  addAlumni: (alumni: Omit<Alumni, 'id' | 'createdAt' | 'updatedAt' | 'isVerified'>) => Promise<Alumni>;
  updateAlumni: (id: string, alumniData: Partial<Alumni>) => Promise<Alumni | null>;
  deleteAlumni: (id: string) => Promise<boolean>;

  // Feedback methods
  getFeedbackList: () => Promise<Feedback[]>;
  getApprovedFeedbacks: () => Promise<Feedback[]>;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'isApproved'>) => Promise<Feedback>;
  approveFeedback: (id: string) => Promise<boolean>;
  deleteFeedback: (id: string) => Promise<boolean>;

  // Fundraising methods
  getCampaignList: () => Promise<FundraisingCampaign[]>;
  getActiveCampaigns: () => Promise<FundraisingCampaign[]>;
  getCampaignById: (id: string) => Promise<FundraisingCampaign | null>;
  addCampaign: (campaign: Omit<FundraisingCampaign, 'id'>) => Promise<FundraisingCampaign>;
  updateCampaign: (id: string, campaignData: Partial<FundraisingCampaign>) => Promise<FundraisingCampaign | null>;
  deleteCampaign: (id: string) => Promise<boolean>;

  // Donation methods
  getDonationsByCampaign: (campaignId: string) => Promise<Donation[]>;
  addDonation: (donation: Omit<Donation, 'id' | 'createdAt'>) => Promise<Donation>;

  // Notification methods
  getNotifications: (forAdmin: boolean) => Promise<Notification[]>;
  markNotificationAsRead: (id: string) => Promise<boolean>;

  // College info
  getCollegeInfo: () => Promise<CollegeInfo>;
  updateCollegeInfo: (info: Partial<CollegeInfo>) => Promise<CollegeInfo>;

  // Email methods
  sendWelcomeEmail: (email: string, name: string) => Promise<boolean>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  
  // Base URL for API
  const API_BASE_URL = 'http://localhost:5000/api';
  
  // Helper function to get auth token
  const getAuthToken = () => localStorage.getItem('token');
  
  // Helper function for API requests
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    
    return response.json();
  };

  // Helper function to add notification (now calls the API)
  const addNotification = async (message: string, type: 'info' | 'success' | 'warning' | 'error', forAdmin: boolean = true): Promise<void> => {
    try {
      await apiRequest('/notification', {
        method: 'POST',
        body: JSON.stringify({
          message,
          type,
          for: forAdmin ? 'admin' : 'all'
        }),
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  // Alumni methods
  const getAlumniList = async (): Promise<Alumni[]> => {
    try {
      return await apiRequest('/alumni');
    } catch (error) {
      console.error('Error fetching alumni list:', error);
      toast.error('Failed to fetch alumni list');
      return [];
    }
  };

  const getAlumniById = async (id: string): Promise<Alumni | null> => {
    try {
      return await apiRequest(`/alumni/${id}`);
    } catch (error) {
      console.error(`Error fetching alumni ${id}:`, error);
      toast.error('Failed to fetch alumni details');
      return null;
    }
  };

  const getAlumniByBatch = async (batch: string): Promise<Alumni[]> => {
    try {
      return await apiRequest(`/alumni/batch/${batch}`);
    } catch (error) {
      console.error(`Error fetching alumni by batch ${batch}:`, error);
      toast.error('Failed to fetch alumni by batch');
      return [];
    }
  };

  const addAlumni = async (newAlumni: Omit<Alumni, 'id' | 'createdAt' | 'updatedAt' | 'isVerified'>): Promise<Alumni> => {
    try {
      const alumni = await apiRequest('/alumni', {
        method: 'POST',
        body: JSON.stringify(newAlumni),
      });
      toast.success(`Alumni ${alumni.name} added successfully`);
      return alumni;
    } catch (error) {
      console.error('Error adding alumni:', error);
      toast.error('Failed to add alumni');
      throw error;
    }
  };

  const updateAlumni = async (id: string, alumniData: Partial<Alumni>): Promise<Alumni | null> => {
    try {
      const alumni = await apiRequest(`/alumni/${id}`, {
        method: 'PUT',
        body: JSON.stringify(alumniData),
      });
      toast.success('Alumni updated successfully');
      return alumni;
    } catch (error) {
      console.error(`Error updating alumni ${id}:`, error);
      toast.error('Failed to update alumni');
      return null;
    }
  };

  const deleteAlumni = async (id: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Only admins can delete alumni');
      return false;
    }
    
    try {
      await apiRequest(`/alumni/${id}`, {
        method: 'DELETE',
      });
      toast.success('Alumni deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting alumni ${id}:`, error);
      toast.error('Failed to delete alumni');
      return false;
    }
  };

  // Feedback methods
  const getFeedbackList = async (): Promise<Feedback[]> => {
    try {
      return await apiRequest('/feedback');
    } catch (error) {
      console.error('Error fetching feedback list:', error);
      toast.error('Failed to fetch feedback list');
      return [];
    }
  };

  const getApprovedFeedbacks = async (): Promise<Feedback[]> => {
    try {
      return await apiRequest('/feedback/approved');
    } catch (error) {
      console.error('Error fetching approved feedbacks:', error);
      toast.error('Failed to fetch approved feedbacks');
      return [];
    }
  };

  const addFeedback = async (newFeedback: Omit<Feedback, 'id' | 'createdAt' | 'isApproved'>): Promise<Feedback> => {
    try {
      const feedback = await apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify(newFeedback),
      });
      toast.success('Feedback submitted successfully');
      return feedback;
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast.error('Failed to submit feedback');
      throw error;
    }
  };

  const approveFeedback = async (id: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Only admins can approve feedback');
      return false;
    }
    
    try {
      await apiRequest(`/feedback/${id}/approve`, {
        method: 'PATCH',
      });
      toast.success('Feedback approved successfully');
      return true;
    } catch (error) {
      console.error(`Error approving feedback ${id}:`, error);
      toast.error('Failed to approve feedback');
      return false;
    }
  };

  const deleteFeedback = async (id: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Only admins can delete feedback');
      return false;
    }
    
    try {
      await apiRequest(`/feedback/${id}`, {
        method: 'DELETE',
      });
      toast.success('Feedback deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting feedback ${id}:`, error);
      toast.error('Failed to delete feedback');
      return false;
    }
  };

  // Fundraising methods
  const getCampaignList = async (): Promise<FundraisingCampaign[]> => {
    try {
      return await apiRequest('/fundraising');
    } catch (error) {
      console.error('Error fetching campaign list:', error);
      toast.error('Failed to fetch campaign list');
      return [];
    }
  };

  const getActiveCampaigns = async (): Promise<FundraisingCampaign[]> => {
    try {
      return await apiRequest('/fundraising/active');
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      toast.error('Failed to fetch active campaigns');
      return [];
    }
  };

  const getCampaignById = async (id: string): Promise<FundraisingCampaign | null> => {
    try {
      return await apiRequest(`/fundraising/${id}`);
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      toast.error('Failed to fetch campaign details');
      return null;
    }
  };

  const addCampaign = async (campaign: Omit<FundraisingCampaign, 'id'>): Promise<FundraisingCampaign> => {
    if (!isAdmin) {
      toast.error('Only admins can create campaigns');
      throw new Error('Unauthorized');
    }
    
    try {
      const newCampaign = await apiRequest('/fundraising', {
        method: 'POST',
        body: JSON.stringify(campaign),
      });
      toast.success(`Campaign "${newCampaign.title}" created successfully`);
      return newCampaign;
    } catch (error) {
      console.error('Error adding campaign:', error);
      toast.error('Failed to create campaign');
      throw error;
    }
  };

  const updateCampaign = async (id: string, campaignData: Partial<FundraisingCampaign>): Promise<FundraisingCampaign | null> => {
    if (!isAdmin) {
      toast.error('Only admins can update campaigns');
      return null;
    }
    
    try {
      const campaign = await apiRequest(`/fundraising/${id}`, {
        method: 'PUT',
        body: JSON.stringify(campaignData),
      });
      toast.success('Campaign updated successfully');
      return campaign;
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      toast.error('Failed to update campaign');
      return null;
    }
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Only admins can delete campaigns');
      return false;
    }
    
    try {
      await apiRequest(`/fundraising/${id}`, {
        method: 'DELETE',
      });
      toast.success('Campaign deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      toast.error('Failed to delete campaign');
      return false;
    }
  };

  // Donation methods
  const getDonationsByCampaign = async (campaignId: string): Promise<Donation[]> => {
    try {
      return await apiRequest(`/donation/campaign/${campaignId}`);
    } catch (error) {
      console.error(`Error fetching donations for campaign ${campaignId}:`, error);
      toast.error('Failed to fetch donations');
      return [];
    }
  };

  const addDonation = async (donation: Omit<Donation, 'id' | 'createdAt'>): Promise<Donation> => {
    try {
      const newDonation = await apiRequest('/donation', {
        method: 'POST',
        body: JSON.stringify(donation),
      });
      toast.success('Thank you for your donation!');
      return newDonation;
    } catch (error) {
      console.error('Error adding donation:', error);
      toast.error('Failed to process donation');
      throw error;
    }
  };

  // Notification methods
  const getNotifications = async (forAdmin: boolean): Promise<Notification[]> => {
    if (forAdmin && !isAdmin) return [];
    
    try {
      return await apiRequest('/notification');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };

  const markNotificationAsRead = async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/notification/${id}/read`, {
        method: 'PATCH',
      });
      return true;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      return false;
    }
  };

  // College info
  const getCollegeInfo = async (): Promise<CollegeInfo> => {
    try {
      return await apiRequest('/college-info');
    } catch (error) {
      console.error('Error fetching college info:', error);
      toast.error('Failed to fetch college information');
      throw error;
    }
  };

  const updateCollegeInfo = async (info: Partial<CollegeInfo>): Promise<CollegeInfo> => {
    if (!isAdmin) {
      toast.error('Only admins can update college information');
      throw new Error('Unauthorized');
    }
    
    try {
      const updatedInfo = await apiRequest('/college-info', {
        method: 'PUT',
        body: JSON.stringify(info),
      });
      toast.success('College information updated successfully');
      return updatedInfo;
    } catch (error) {
      console.error('Error updating college info:', error);
      toast.error('Failed to update college information');
      throw error;
    }
  };

  // Email methods
  const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
    try {
      // In a real application, this would call an API endpoint to send an email
      // For now, we'll just show a toast notification
      toast.success(`Welcome email sent to ${name} at ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      toast.error('Failed to send welcome email');
      return false;
    }
  };

  const value: ApiContextType = {
    getAlumniList,
    getAlumniById,
    getAlumniByBatch,
    addAlumni,
    updateAlumni,
    deleteAlumni,
    getFeedbackList,
    getApprovedFeedbacks,
    addFeedback,
    approveFeedback,
    deleteFeedback,
    getCampaignList,
    getActiveCampaigns,
    getCampaignById,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    getDonationsByCampaign,
    addDonation,
    getNotifications,
    markNotificationAsRead,
    getCollegeInfo,
    updateCollegeInfo,
    sendWelcomeEmail
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};