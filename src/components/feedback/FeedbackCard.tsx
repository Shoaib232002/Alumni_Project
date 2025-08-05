import { Feedback } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, StarIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedbackCardProps {
  feedback: Feedback;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function FeedbackCard({ feedback, isAdmin = false, onApprove, onDelete }: FeedbackCardProps) {
  const date = new Date(feedback.createdAt);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{feedback.alumniName}</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex">
              {feedback.rating && Array.from({ length: 5 }).map((_, i) => (
                <StarIcon 
                  key={i} 
                  className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            {isAdmin && !feedback.isApproved && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Pending
              </Badge>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500 flex items-center mt-1">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {date.toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent>
        {feedback.text && (
          <div className="text-gray-700">
            <p className="text-sm">{feedback.text}</p>
          </div>
        )}
        {feedback.videoUrl && (
          <div className="mt-3">
            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
              <a 
                href={feedback.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Video className="h-8 w-8 mr-2" />
                <span>View Video Feedback</span>
              </a>
            </div>
          </div>
        )}
      </CardContent>
      
      {isAdmin && (
        <CardFooter className="border-t bg-gray-50 py-3 flex justify-end space-x-2">
          {!feedback.isApproved && onApprove && (
            <Button 
              size="sm" 
              variant="default" 
              onClick={() => onApprove(feedback.id)}
            >
              Approve
            </Button>
          )}
          {onDelete && (
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onDelete(feedback.id)}
            >
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}