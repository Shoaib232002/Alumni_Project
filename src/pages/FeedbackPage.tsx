import { useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Feedback } from "@/types";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

export default function FeedbackPage() {
  const { getApprovedFeedbacks, addFeedback } = useApi();
  const { currentUser } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState({
    alumniName: currentUser?.name || "",
    alumniId: currentUser?.id || "",
    text: "",
    videoUrl: "",
    rating: "5"
  });

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const fetchedFeedbacks = await getApprovedFeedbacks();
        setFeedbacks(fetchedFeedbacks);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        toast.error("Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [getApprovedFeedbacks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleRatingChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      rating: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.alumniName.trim()) errors.push("Name is required");
    if (!formData.text.trim() && !formData.videoUrl.trim()) {
      errors.push("Please provide either a text feedback or a video URL");
    }
    if (formData.videoUrl && !/^https?:\/\/\S+$/.test(formData.videoUrl)) {
      errors.push("Video URL is invalid");
    }
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Submit feedback
      await addFeedback({
        ...formData,
        rating: parseInt(formData.rating)
      });
      
      toast.success("Thank you for your feedback! It will be reviewed by an administrator.");
      
      // Reset form and close dialog
      setFormData({
        alumniName: currentUser?.name || "",
        alumniId: currentUser?.id || "",
        text: "",
        videoUrl: "",
        rating: "5"
      });
      setShowFeedbackDialog(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Alumni Feedback</h1>
          <p className="text-gray-600">
            Read what our alumni have to say about their experiences
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
            <DialogTrigger asChild>
              <Button>Share Your Experience</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Share Your Alumni Experience</DialogTitle>
                <DialogDescription>
                  Share your thoughts, experiences, and memories about your time at the college.
                  Your feedback will be reviewed before being published.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alumniName">Your Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="alumniName"
                    name="alumniName"
                    placeholder="Enter your name"
                    value={formData.alumniName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text">Your Feedback</Label>
                  <Textarea
                    id="text"
                    name="text"
                    placeholder="Share your experience..."
                    value={formData.text}
                    onChange={handleChange}
                    className="h-32"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video Link (Optional)</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    placeholder="https://example.com/your-video"
                    value={formData.videoUrl}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500">
                    You can share a link to a video hosted on YouTube, Vimeo, etc.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Overall Rating <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.rating}
                    onValueChange={handleRatingChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                      <SelectItem value="4">4 - Very Good</SelectItem>
                      <SelectItem value="3">3 - Good</SelectItem>
                      <SelectItem value="2">2 - Fair</SelectItem>
                      <SelectItem value="1">1 - Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feedback...</p>
          </div>
        </div>
      ) : feedbacks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-medium mb-2">No Feedback Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share your experience with us!</p>
            <Button onClick={() => setShowFeedbackDialog(true)}>
              Share Your Experience
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {/* Featured feedback */}
          {feedbacks.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Featured Feedback</h2>
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-6 pb-6">
                  <FeedbackCard feedback={feedbacks[0]} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* All feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.slice(1).map(feedback => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}