import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContext";
import { Alumni } from "@/types";
import { 
  ArrowLeft, 
  Briefcase, 
  Building, 
  GraduationCap, 
  Mail, 
  Phone, 
  Linkedin, 
  Globe,
  Share2,
  Edit 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AlumniDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getAlumniById, sendWelcomeEmail } = useApi();
  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumni = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const alumniData = await getAlumniById(id);
        setAlumni(alumniData);
      } catch (error) {
        console.error("Error fetching alumni details:", error);
        toast.error("Failed to load alumni details");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [id, getAlumniById]);

  const handleSendWelcomeEmail = async () => {
    if (!alumni) return;
    
    try {
      await sendWelcomeEmail(alumni.email, alumni.name);
      toast.success(`Welcome email sent to ${alumni.name}`);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send welcome email");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alumni profile...</p>
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Alumni Not Found</h2>
        <p className="text-gray-600 mb-6">The alumni you are looking for doesn't exist or has been removed.</p>
        <Link to="/alumni">
          <Button>Back to Alumni Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/alumni" className="text-blue-600 hover:text-blue-800 flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
        </Link>
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <h1 className="text-3xl font-bold">{alumni.name}</h1>
          <div className="flex space-x-2 mt-4 md:mt-0">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate(`/admin/alumni/edit/${alumni.id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button variant="outline" onClick={handleSendWelcomeEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Send Welcome Email
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
                  <img 
                    src={alumni.image || `https://ui-avatars.com/api/?name=${alumni.name}&size=128`} 
                    alt={alumni.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-1">{alumni.name}</h3>
                {alumni.designation && alumni.currentCompany && (
                  <p className="text-gray-600 mb-2">
                    {alumni.designation} at {alumni.currentCompany}
                  </p>
                )}
                <Badge variant="outline" className="mb-4">{alumni.batch} Batch</Badge>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-gray-500 mr-3" />
                    <span className="text-gray-700">{alumni.degree}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-3" />
                    <a href={`mailto:${alumni.email}`} className="text-blue-600 hover:text-blue-800">
                      {alumni.email}
                    </a>
                  </div>
                  {alumni.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-3" />
                      <a href={`tel:${alumni.phone}`} className="text-blue-600 hover:text-blue-800">
                        {alumni.phone}
                      </a>
                    </div>
                  )}
                  {alumni.currentCompany && (
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">{alumni.currentCompany}</span>
                    </div>
                  )}
                  {alumni.designation && (
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">{alumni.designation}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="w-full">
                  <h4 className="font-medium mb-3 text-left">Professional Profiles</h4>
                  <div className="space-y-2">
                    {alumni.linkedInProfile && (
                      <a 
                        href={alumni.linkedInProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2 rounded-md hover:bg-gray-50 text-blue-600 hover:text-blue-800"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {alumni.naukriProfile && (
                      <a 
                        href={alumni.naukriProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2 rounded-md hover:bg-gray-50 text-blue-600 hover:text-blue-800"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        <span>Naukri</span>
                      </a>
                    )}
                    {alumni.otherProfiles && Object.entries(alumni.otherProfiles).map(([key, value]) => (
                      <a 
                        key={key}
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2 rounded-md hover:bg-gray-50 text-blue-600 hover:text-blue-800"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        <span>{key}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div>
                <h3 className="text-xl font-bold mb-4">About</h3>
                {alumni.bio ? (
                  <p className="text-gray-700 whitespace-pre-line">{alumni.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio available</p>
                )}
              </div>

              <Separator className="my-8" />
              
              <div>
                <h3 className="text-xl font-bold mb-4">Alumni Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                    <p>{alumni.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Graduation Batch</h4>
                    <p>{alumni.batch}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Degree</h4>
                    <p>{alumni.degree}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                    <p>{alumni.email}</p>
                  </div>
                  {alumni.phone && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                      <p>{alumni.phone}</p>
                    </div>
                  )}
                  {alumni.currentCompany && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Current Company</h4>
                      <p>{alumni.currentCompany}</p>
                    </div>
                  )}
                  {alumni.designation && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Designation</h4>
                      <p>{alumni.designation}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Member Since</h4>
                    <p>{new Date(alumni.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                    <p>{new Date(alumni.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Verification Status</h4>
                    <p>{alumni.isVerified ? "Verified" : "Unverified"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}