import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // For demonstration purposes only - this shows the available credentials
  const demoCredentials = [
    { email: "admin@techuniversity.edu", password: "password", role: "admin" },
    { email: "user@example.com", password: "password", role: "user" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success("Demo login successful!");
        navigate("/");
      } else {
        toast.error("Demo login failed");
      }
    } catch (error) {
      console.error("Demo login error:", error);
      toast.error("An error occurred during demo login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <GraduationCap className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Alumni Portal Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your alumni account
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Demo Accounts</CardTitle>
            <CardDescription>
              Use these credentials to test the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="border p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div><strong>Email:</strong> {cred.email}</div>
                    <div><strong>Password:</strong> {cred.password}</div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {cred.role}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => handleDemoLogin(cred.email, cred.password)}
                  disabled={isLoading}
                >
                  Login as {cred.role}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}