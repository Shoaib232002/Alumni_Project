import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApi } from "@/contexts/ApiContext";
import { FundraisingCampaign } from "@/types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

export default function DonationPage() {
  const { id } = useParams<{ id: string }>();
  const { getCampaignById, addDonation } = useApi();
  const { currentUser } = useAuth();
  const [campaign, setCampaign] = useState<FundraisingCampaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    amount: 100,
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    message: "",
    isAnonymous: false
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const campaignData = await getCampaignById(id);
        if (!campaignData) {
          toast.error("Campaign not found");
          navigate("/fundraising");
          return;
        }
        
        if (!campaignData.isActive) {
          toast.error("This campaign is no longer accepting donations");
          navigate(`/fundraising/${id}`);
          return;
        }
        
        setCampaign(campaignData);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        toast.error("Failed to load campaign");
        navigate("/fundraising");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, getCampaignById, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle amount validation
    if (name === "amount") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        setFormData(prev => ({ ...prev, [name]: numValue }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isAnonymous: checked }));
  };

  const handleAmountSelect = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (formData.amount <= 0) errors.push("Amount must be greater than 0");
    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.push("Email is invalid");
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !campaign) return;
    
    setIsSubmitting(true);
    try {
      // Prepare donation data
      const donationData = {
        campaignId: campaign.id,
        alumniId: currentUser?.id,
        amount: formData.amount,
        name: formData.name,
        email: formData.email,
        message: formData.message,
        isAnonymous: formData.isAnonymous
      };
      
      // Submit donation
      await addDonation(donationData);
      
      toast.success("Thank you for your donation!");
      
      // Navigate to campaign page
      navigate(`/fundraising/${campaign.id}`);
    } catch (error) {
      console.error("Error processing donation:", error);
      toast.error("Failed to process your donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Campaign Not Found</h2>
        <p className="text-gray-600 mb-6">The fundraising campaign you are looking for doesn't exist or has been removed.</p>
        <Link to="/fundraising">
          <Button>Back to Fundraising</Button>
        </Link>
      </div>
    );
  }

  const percentComplete = Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to={`/fundraising/${campaign.id}`} className="text-blue-600 hover:text-blue-800 flex items-center mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Campaign
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Support {campaign.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Selection */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Choose Donation Amount</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[50, 100, 250, 500].map(amount => (
                    <Button
                      key={amount}
                      type="button"
                      variant={formData.amount === amount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className="text-lg font-bold"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <div className="mt-4">
                  <Label htmlFor="amount">Custom Amount</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.amount}
                      onChange={handleChange}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Donor Information */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Your Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Add a message with your donation"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isAnonymous" 
                      checked={formData.isAnonymous}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <label 
                      htmlFor="isAnonymous"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Make my donation anonymous
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Donation Submission */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Donation Summary</h2>
                  <span className="text-xl font-bold text-blue-600">${formData.amount}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  By proceeding, you agree to support this campaign. Your donation will help
                  make a difference.
                </p>
                <Button 
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Complete Donation"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
        
        <div className="space-y-6">
          {/* Campaign Summary */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-2">{campaign.title}</h2>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">${campaign.raised.toLocaleString()} raised</span>
                  <span className="text-sm font-medium">{percentComplete}%</span>
                </div>
                <Progress value={percentComplete} className="h-2" />
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {campaign.description}
              </p>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Goal</span>
                  <span className="font-medium">${campaign.goal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">End Date</span>
                  <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Secure Donation */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-2">Secure Donation</h3>
              <p className="text-sm text-gray-600">
                Your donation is secure and encrypted. All information will be kept confidential.
                You will receive a confirmation email with the details of your donation.
              </p>
            </CardContent>
          </Card>
          
          {/* Tax Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold mb-2">Tax Information</h3>
              <p className="text-sm text-gray-600">
                All donations may be tax-deductible to the extent allowed by law.
                Please consult with a tax professional for advice regarding your specific situation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}