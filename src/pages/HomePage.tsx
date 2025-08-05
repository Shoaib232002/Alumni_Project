import { useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Alumni, CollegeInfo } from "@/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, GraduationCap, HeartHandshake, MessageSquare } from "lucide-react";

export default function HomePage() {
  const { getCollegeInfo, getAlumniList, getActiveCampaigns, getApprovedFeedbacks } = useApi();
  const [collegeInfo, setCollegeInfo] = useState<CollegeInfo | null>(null);
  const [recentAlumni, setRecentAlumni] = useState<Alumni[]>([]);
  const [batches, setBatches] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch college info
        const info = await getCollegeInfo();
        setCollegeInfo(info);

        // Fetch alumni list
        const alumniList = await getAlumniList();
        // Get unique batches
        const uniqueBatches = [...new Set(alumniList.map(a => a.batch))].sort().reverse();
        setBatches(uniqueBatches);
        
        // Get recent alumni (first 4)
        setRecentAlumni(alumniList.slice(0, 4));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [getCollegeInfo, getAlumniList]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Welcome to {collegeInfo?.name || "Our"} Alumni Network
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-8">
              Reconnect with your classmates, stay updated with college events, and give back to your alma mater.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/alumni">
                <Button className="px-6">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Find Alumni
                </Button>
              </Link>
              <Link to="/feedback">
                <Button variant="outline" className="px-6">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Share Feedback
                </Button>
              </Link>
              <Link to="/fundraising">
                <Button variant="outline" className="px-6">
                  <HeartHandshake className="mr-2 h-5 w-5" />
                  Support Fundraisers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Navigation */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Browse Alumni by Batch</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {batches.map(batch => (
              <Link key={batch} to={`/alumni?batch=${batch}`}>
                <Button 
                  variant="outline" 
                  className="w-full bg-gray-50 hover:bg-gray-100"
                >
                  {batch} Batch
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Alumni */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Alumni</h2>
            <Link to="/alumni" className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentAlumni.map(alumni => (
              <AlumniCard key={alumni.id} alumni={alumni} />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">About Our Alumni Network</h2>
            <p className="text-gray-600 mb-6">
              Our alumni network connects graduates from {collegeInfo?.name || "our institution"} around the world.
              This platform helps alumni stay connected with each other and their alma mater, 
              share their experiences, and contribute to the growth of current students.
            </p>
            <Separator className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="font-bold mb-2">Connect</h3>
                <p className="text-sm text-gray-600">
                  Find and reconnect with your classmates and build your professional network.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Share</h3>
                <p className="text-sm text-gray-600">
                  Share your experiences and insights with the college community.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Support</h3>
                <p className="text-sm text-gray-600">
                  Support the next generation through donations, mentorship, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Alumni Community Today</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Are you an alumnus? Join our growing network to reconnect with classmates,
            receive updates, and participate in exclusive alumni events.
          </p>
          <Link to="/alumni/add">
            <Button className="px-8">
              Add Your Profile
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}