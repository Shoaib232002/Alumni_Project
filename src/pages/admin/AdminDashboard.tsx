import { useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Alumni, Feedback, FundraisingCampaign, Notification } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { CampaignCard } from "@/components/fundraising/CampaignCard";
import { Link } from "react-router-dom";
import { ArrowRight, Users, MessageSquareText, BanknoteIcon, Bell } from "lucide-react";

export default function AdminDashboard() {
  const { 
    getAlumniList,
    getFeedbackList,
    getCampaignList,
    getNotifications,
    approveFeedback,
    deleteFeedback,
    markNotificationAsRead
  } = useApi();
  
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [alumniList, feedbackList, campaignList, notificationList] = await Promise.all([
          getAlumniList(),
          getFeedbackList(),
          getCampaignList(),
          getNotifications(true)
        ]);
        
        setAlumni(alumniList);
        setFeedbacks(feedbackList);
        setCampaigns(campaignList);
        setNotifications(notificationList);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [getAlumniList, getFeedbackList, getCampaignList, getNotifications]);

  const handleApproveFeedback = async (id: string) => {
    await approveFeedback(id);
    setFeedbacks(prev => prev.map(f => 
      f.id === id ? { ...f, isApproved: true } : f
    ));
  };

  const handleDeleteFeedback = async (id: string) => {
    await deleteFeedback(id);
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  };

  const handleMarkNotificationRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  // Stats calculations
  const totalAlumni = alumni.length;
  const pendingAlumni = alumni.filter(a => !a.isVerified).length;
  const pendingFeedbacks = feedbacks.filter(f => !f.isApproved).length;
  
  // Fundraising stats
  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goal, 0);
  const overallPercentage = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Alumni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{totalAlumni}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingAlumni} pending verification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquareText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{feedbacks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingFeedbacks} pending approval
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Fundraising</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">${totalRaised.toLocaleString()}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                of ${totalGoal.toLocaleString()} goal ({overallPercentage}%)
              </div>
              <div className="text-xs text-muted-foreground">
                {campaigns.length} campaigns
              </div>
            </div>
            <Progress value={overallPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{notifications.length}</div>
                <p className="text-xs text-muted-foreground">
                  {notifications.filter(n => !n.isRead).length} unread
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Notifications</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.slice(0, 5).map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-md flex items-start ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                    onClick={() => !notification.isRead && handleMarkNotificationRead(notification.id)}
                  >
                    <div className="flex-1">
                      <p className={`${notification.isRead ? 'font-normal' : 'font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Approvals */}
      {pendingFeedbacks > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Pending Feedback Approvals</h2>
            <Link to="/admin/feedback">
              <Button variant="ghost" size="sm" className="flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks
              .filter(f => !f.isApproved)
              .slice(0, 4)
              .map(feedback => (
                <FeedbackCard 
                  key={feedback.id} 
                  feedback={feedback} 
                  isAdmin 
                  onApprove={handleApproveFeedback}
                  onDelete={handleDeleteFeedback}
                />
              ))}
          </div>
        </div>
      )}

      {/* Recent Alumni */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Alumni</h2>
          <Link to="/admin/alumni">
            <Button variant="ghost" size="sm" className="flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {alumni
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4)
            .map(alumnus => (
              <AlumniCard key={alumnus.id} alumni={alumnus} isCompact />
            ))}
        </div>
      </div>

      {/* Fundraising Campaigns */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Active Fundraising Campaigns</h2>
          <Link to="/admin/fundraising">
            <Button variant="ghost" size="sm" className="flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns
            .filter(c => c.isActive)
            .slice(0, 3)
            .map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} isCompact />
            ))}
        </div>
      </div>
    </div>
  );
}