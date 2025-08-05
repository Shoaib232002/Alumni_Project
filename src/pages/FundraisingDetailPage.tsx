import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApi } from "@/contexts/ApiContext";
import { FundraisingCampaign, Donation } from "@/types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function FundraisingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getCampaignById, getDonationsByCampaign } = useApi();
  const [campaign, setCampaign] = useState<FundraisingCampaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch campaign details
        const campaignData = await getCampaignById(id);
        if (!campaignData) {
          toast.error("Campaign not found");
          return;
        }
        setCampaign(campaignData);
        
        // Fetch donations for this campaign
        const donationsData = await getDonationsByCampaign(id);
        setDonations(donationsData);
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        toast.error("Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, getCampaignById, getDonationsByCampaign]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign details...</p>
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
  const endDate = new Date(campaign.endDate);
  const today = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Group donations by amount for statistics
  const donationCount = donations.length;
  const averageDonation = donationCount > 0 
    ? donations.reduce((sum, donation) => sum + donation.amount, 0) / donationCount 
    : 0;
  
  // Recent donations (last 5)
  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/fundraising" className="text-blue-600 hover:text-blue-800 flex items-center mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Fundraising
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Campaign Details */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
            {campaign.image && (
              <div className="h-64 md:h-80 mb-6 overflow-hidden rounded-lg">
                <img 
                  src={campaign.image} 
                  alt={campaign.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="font-medium">${campaign.raised.toLocaleString()} raised of ${campaign.goal.toLocaleString()}</span>
                <span className="font-medium">{percentComplete}%</span>
              </div>
              <Progress value={percentComplete} className="h-3" />
            </div>
            <div className="mb-6 flex flex-wrap gap-4">
              <Link to={`/fundraising/${campaign.id}/donate`}>
                <Button size="lg">Donate Now</Button>
              </Link>
              <Button variant="outline" size="lg">Share Campaign</Button>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{campaign.description}</p>
            </div>
          </div>
          
          {/* Recent Donors */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Recent Donors</h2>
            {recentDonations.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No donations yet. Be the first to donate!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDonations.map(donation => (
                  <div key={donation.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarFallback>
                        {donation.isAnonymous 
                          ? "A" 
                          : donation.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {donation.isAnonymous ? "Anonymous" : donation.name}
                        </div>
                        <div className="font-bold text-blue-600">
                          ${donation.amount.toLocaleString()}
                        </div>
                      </div>
                      {donation.message && (
                        <p className="text-gray-600 text-sm mt-1">{donation.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Campaign Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">${campaign.raised.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Raised</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{donationCount}</p>
                  <p className="text-sm text-gray-500">Donors</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">${averageDonation.toFixed(0)}</p>
                  <p className="text-sm text-gray-500">Avg. Donation</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {daysLeft > 0 ? daysLeft : 'Ended'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {daysLeft > 0 ? 'Days Left' : 'Campaign Ended'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Start Date</span>
                  <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">End Date</span>
                  <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Donation CTA */}
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-4">Make a Difference</h3>
              <p className="text-gray-600 mb-4">
                Your contribution will help us reach our goal of ${campaign.goal.toLocaleString()}.
                Every donation counts, no matter how small.
              </p>
              <Link to={`/fundraising/${campaign.id}/donate`}>
                <Button className="w-full">Donate Now</Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Share Campaign */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-4">Share This Campaign</h3>
              <p className="text-gray-600 mb-4">
                Help spread the word by sharing this campaign with your network.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full">
                  Facebook
                </Button>
                <Button variant="outline" className="w-full">
                  Twitter
                </Button>
                <Button variant="outline" className="w-full">
                  LinkedIn
                </Button>
                <Button variant="outline" className="w-full">
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}