import { useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Feedback } from "@/types";
import { toast } from "sonner";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminFeedbackPage() {
  const { getFeedbackList, approveFeedback, deleteFeedback } = useApi();
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const feedbackList = await getFeedbackList();
        setAllFeedback(feedbackList);
        setFilteredFeedback(feedbackList);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast.error("Failed to load feedback data");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [getFeedbackList]);

  useEffect(() => {
    // Filter based on tab and search term
    let filtered = [...allFeedback];
    
    // Apply tab filter
    if (activeTab === "pending") {
      filtered = filtered.filter(f => !f.isApproved);
    } else if (activeTab === "approved") {
      filtered = filtered.filter(f => f.isApproved);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.alumniName.toLowerCase().includes(searchLower) ||
        (f.text && f.text.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredFeedback(filtered);
  }, [allFeedback, activeTab, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is done in useEffect
  };

  const handleApproveFeedback = async (id: string) => {
    try {
      await approveFeedback(id);
      toast.success("Feedback approved successfully");
      
      // Update local state
      setAllFeedback(prev => prev.map(f => 
        f.id === id ? { ...f, isApproved: true } : f
      ));
    } catch (error) {
      console.error("Error approving feedback:", error);
      toast.error("Failed to approve feedback");
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteFeedback(id);
      toast.success("Feedback deleted successfully");
      
      // Update local state
      setAllFeedback(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedback Management</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "pending" | "approved")}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All ({allFeedback.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({allFeedback.filter(f => !f.isApproved).length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({allFeedback.filter(f => f.isApproved).length})</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSearch} className="flex max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-[200px] sm:w-[300px]"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <TabsContent value="all" className="mt-0">
          {renderFeedbackList(filteredFeedback, loading)}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-0">
          {renderFeedbackList(
            filteredFeedback.filter(f => !f.isApproved),
            loading
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-0">
          {renderFeedbackList(
            filteredFeedback.filter(f => f.isApproved),
            loading
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderFeedbackList(feedbackList: Feedback[], isLoading: boolean) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feedback data...</p>
          </div>
        </div>
      );
    }

    if (feedbackList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-2">No feedback found</p>
            <p className="text-sm text-gray-400">
              {searchTerm ? "Try adjusting your search" : "No feedback in this category yet"}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbackList.map(feedback => (
          <FeedbackCard 
            key={feedback.id} 
            feedback={feedback} 
            isAdmin 
            onApprove={handleApproveFeedback}
            onDelete={handleDeleteFeedback}
          />
        ))}
      </div>
    );
  }
}