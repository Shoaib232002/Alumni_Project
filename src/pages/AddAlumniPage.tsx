import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApi } from "@/contexts/ApiContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Generate list of graduation years (last 30 years)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 30; year--) {
    years.push(year.toString());
  }
  return years;
};

export default function AddAlumniPage() {
  const navigate = useNavigate();
  const { addAlumni, sendWelcomeEmail } = useApi();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    batch: "",
    degree: "",
    currentCompany: "",
    designation: "",
    linkedInProfile: "",
    naukriProfile: "",
    bio: "",
  });

  const degrees = [
    "B.Tech Computer Science",
    "B.Tech Electronics",
    "B.Tech Mechanical",
    "B.Tech Civil",
    "B.Tech Electrical",
    "M.Tech Computer Science",
    "M.Tech Electronics",
    "M.Tech Mechanical",
    "M.Tech Civil",
    "M.Tech Electrical",
    "BBA",
    "MBA",
    "B.Com",
    "M.Com",
    "B.Sc",
    "M.Sc",
    "Ph.D"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.push("Email is invalid");
    if (!formData.batch) errors.push("Batch year is required");
    if (!formData.degree) errors.push("Degree is required");
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Prepare alumni data
      const alumniData = {
        ...formData,
        otherProfiles: {}
      };
      
      // Add the alumni
      const newAlumni = await addAlumni(alumniData);
      
      // Send welcome email
      await sendWelcomeEmail(newAlumni.email, newAlumni.name);
      
      toast.success("Alumni profile added successfully");
      
      // Navigate to the alumni detail page
      navigate(`/alumni/${newAlumni.id}`);
    } catch (error) {
      console.error("Error adding alumni:", error);
      toast.error("Failed to add alumni profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/alumni" className="text-blue-600 hover:text-blue-800 flex items-center mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Add Alumni Profile</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Enter the basic information about the alumni.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Graduation Year <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.batch}
                    onValueChange={handleSelectChange("batch")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select graduation year" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateYearOptions().map(year => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.degree}
                    onValueChange={handleSelectChange("degree")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {degrees.map(degree => (
                        <SelectItem key={degree} value={degree}>
                          {degree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="bio">Bio / About</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Write a brief bio..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="h-32 mt-1"
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Details about current employment and professional profiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentCompany">Current Company</Label>
                  <Input
                    id="currentCompany"
                    name="currentCompany"
                    placeholder="Enter current company"
                    value={formData.currentCompany}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation / Job Title</Label>
                  <Input
                    id="designation"
                    name="designation"
                    placeholder="Enter job title"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedInProfile">LinkedIn Profile</Label>
                  <Input
                    id="linkedInProfile"
                    name="linkedInProfile"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedInProfile}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="naukriProfile">Naukri Profile</Label>
                  <Input
                    id="naukriProfile"
                    name="naukriProfile"
                    placeholder="https://naukri.com/username"
                    value={formData.naukriProfile}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-4">
                  By submitting this form, you confirm that the information provided is accurate.
                  The alumni will receive a welcome email after submission.
                </p>
                <div className="flex justify-between space-x-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate("/alumni")}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add Alumni"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}