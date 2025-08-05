import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BellIcon, 
  LayoutDashboardIcon, 
  UsersIcon, 
  MessageSquareTextIcon, 
  BanknoteIcon, 
  LogOutIcon,
  MenuIcon,
  XIcon,
  SearchIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApi } from '@/contexts/ApiContext';
import { Notification } from '@/types';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { getNotifications, markNotificationAsRead } = useApi();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // If not an admin, redirect to home page
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const adminNotifications = await getNotifications(true);
        setNotifications(adminNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    
    // Set up interval to fetch notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [isAdmin, navigate, getNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white shadow-md"
        >
          {isSidebarOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "w-64 bg-white shadow-md fixed h-full z-40 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0" // Always visible on large screens
      )}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">{currentUser?.name}</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/admin" className="flex items-center p-3 text-gray-700 rounded-md hover:bg-gray-100">
              <LayoutDashboardIcon className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/admin/alumni" className="flex items-center p-3 text-gray-700 rounded-md hover:bg-gray-100">
              <UsersIcon className="mr-3 h-5 w-5" />
              Alumni Management
            </Link>
            <Link to="/admin/feedback" className="flex items-center p-3 text-gray-700 rounded-md hover:bg-gray-100">
              <MessageSquareTextIcon className="mr-3 h-5 w-5" />
              Feedback Management
            </Link>
            <Link to="/admin/fundraising" className="flex items-center p-3 text-gray-700 rounded-md hover:bg-gray-100">
              <BanknoteIcon className="mr-3 h-5 w-5" />
              Fundraising
            </Link>
            <Link to="/admin/scraper" className="flex items-center p-3 text-gray-700 rounded-md hover:bg-gray-100">
              <SearchIcon className="mr-3 h-5 w-5" />
              Alumni Scraper
            </Link>
          </nav>
          
          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOutIcon className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "lg:ml-64" : "ml-0",
      )}>
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-end items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2 font-medium">Notifications</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  notifications.map(notification => (
                    <DropdownMenuItem 
                      key={notification.id}
                      className={cn(
                        "flex flex-col items-start p-3 cursor-pointer",
                        !notification.isRead && "bg-blue-50"
                      )}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="font-medium">{notification.message}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}