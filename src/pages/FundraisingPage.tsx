import { useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { FundraisingCampaign } from "@/types";
import { CampaignCard } from "@/components/fundraising/CampaignCard";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function FundraisingPage() {
  const { getActiveCampaigns } = useApi();
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const activeCampaigns = await getActiveCampaigns();
        setCampaigns(activeCampaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        toast.error("Failed to load fundraising campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [getActiveCampaigns]);

  // Calculate total stats
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0);
  const overallPercentage = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;

  // Group campaigns by priority (featured first, then others)
  const featuredCampaign = campaigns.length > 0 ? campaigns[0] : null;
  const otherCampaigns = campaigns.slice(1);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Support Our College's Future
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your contribution makes a significant impact on our institution and the next generation of students.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="#active-campaigns">
                <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Donate Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-4xl font-bold text-blue-600">${totalRaised.toLocaleString()}</p>
                <p className="text-gray-600 mt-2">Total Amount Raised</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-4xl font-bold text-blue-600">{campaigns.length}</p>
                <p className="text-gray-600 mt-2">Active Campaigns</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-4xl font-bold text-blue-600">{overallPercentage}%</p>
                <p className="text-gray-600 mt-2">Overall Progress</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section id="active-campaigns" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Active Fundraising Campaigns</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading campaigns...</p>
              </div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">No Active Campaigns</h3>
              <p className="text-gray-500">
                There are currently no active fundraising campaigns. Please check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured Campaign */}
              {featuredCampaign && (
                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-6">Featured Campaign</h3>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        {featuredCampaign.image && (
                          <div className="h-64 mb-6 overflow-hidden rounded-lg">
                            <img 
                              src={featuredCampaign.image} 
                              alt={featuredCampaign.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-2xl font-bold mb-2">{featuredCampaign.title}</h3>
                        <p className="text-gray-600 mb-4">{featuredCampaign.description}</p>
                        <Link to={`/fundraising/${featuredCampaign.id}`}>
                          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mr-4">
                            Learn More
                          </button>
                        </Link>
                        <Link to={`/fundraising/${featuredCampaign.id}/donate`}>
                          <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
                            Donate
                          </button>
                        </Link>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-medium">
                              {Math.round((featuredCampaign.raised / featuredCampaign.goal) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.min(Math.round((featuredCampaign.raised / featuredCampaign.goal) * 100), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Raised:</span>
                            <span className="font-medium">${featuredCampaign.raised.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Goal:</span>
                            <span className="font-medium">${featuredCampaign.goal.toLocaleString()}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-gray-500">Start Date:</span>
                            <span className="font-medium">
                              {new Date(featuredCampaign.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">End Date:</span>
                            <span className="font-medium">
                              {new Date(featuredCampaign.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Campaigns */}
              {otherCampaigns.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Other Campaigns</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherCampaigns.map(campaign => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How to Donate Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">How to Donate</h2>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="rounded-full bg-blue-100 text-blue-600 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Choose a Campaign</h3>
                <p className="text-gray-600">
                  Browse through our active fundraising campaigns and select one that resonates with you.
                </p>
              </div>
              <div>
                <div className="rounded-full bg-blue-100 text-blue-600 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Select Amount</h3>
                <p className="text-gray-600">
                  Choose how much you'd like to contribute. Every donation, no matter how small, makes a difference.
                </p>
              </div>
              <div>
                <div className="rounded-full bg-blue-100 text-blue-600 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Complete Donation</h3>
                <p className="text-gray-600">
                  Fill in your details and complete the secure donation process. You'll receive a receipt via email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Make a Difference Today</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your support helps us create better opportunities for current and future students.
            Together, we can build a stronger educational foundation.
          </p>
          <a href="#active-campaigns">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Donate Now
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}