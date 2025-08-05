import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/contexts/ApiContext';
import { 
  Home, 
  Users, 
  MessageSquare, 
  HeartHandshake, 
  LogIn, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CollegeInfo } from '@/types';

export function MainLayout() {
  const { currentUser, logout } = useAuth();
  const { getCollegeInfo } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [collegeInfo, setCollegeInfo] = useState<CollegeInfo | null>(null);

  useEffect(() => {
    const fetchCollegeInfo = async () => {
      try {
        const info = await getCollegeInfo();
        setCollegeInfo(info);
      } catch (error) {
        console.error('Failed to fetch college info:', error);
      }
    };

    fetchCollegeInfo();
  }, [getCollegeInfo]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Alumni', path: '/alumni', icon: <Users className="h-5 w-5" /> },
    { name: 'Feedback', path: '/feedback', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Fundraising', path: '/fundraising', icon: <HeartHandshake className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo and title */}
          <Link to="/" className="flex items-center space-x-2">
            {collegeInfo?.logo && (
              <img src={collegeInfo.logo} alt="College Logo" className="h-8 w-8" />
            )}
            <span className="font-bold text-xl">{collegeInfo?.name || 'Alumni Portal'}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1",
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-2">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">{currentUser.name}</div>
                {currentUser.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">Admin</Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleLogin} className="flex items-center">
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 p-3 rounded-md",
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="border-t pt-3">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{currentUser.name}</div>
                  </div>
                  {currentUser.role === 'admin' && (
                    <Link to="/admin" className="block w-full">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout} 
                    className="w-full flex items-center justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogin} 
                  className="w-full flex items-center justify-start"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="font-bold text-lg mb-2">{collegeInfo?.name || 'Alumni Portal'}</h3>
              <p className="text-gray-600 text-sm">
                {collegeInfo?.location || 'Location'}<br />
                Established: {collegeInfo?.established || 'N/A'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-medium mb-2">Navigation</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  {navItems.map(item => (
                    <li key={item.path}>
                      <Link to={item.path} className="hover:text-gray-900">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Resources</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-gray-900">Terms of Use</a></li>
                  <li><a href="#" className="hover:text-gray-900">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {collegeInfo?.name || 'Alumni Portal'}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}