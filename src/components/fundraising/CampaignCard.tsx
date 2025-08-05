import { FundraisingCampaign } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

interface CampaignCardProps {
  campaign: FundraisingCampaign;
  isCompact?: boolean;
}

export function CampaignCard({ campaign, isCompact = false }: CampaignCardProps) {
  const percentComplete = Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100);
  const endDate = new Date(campaign.endDate);
  const today = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (isCompact) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base line-clamp-1">{campaign.title}</CardTitle>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> 
                {daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}
              </div>
            </div>
            {!campaign.isActive && (
              <Badge variant="outline" className="bg-gray-100">Inactive</Badge>
            )}
          </div>
          <div className="mt-3">
            <Progress value={percentComplete} className="h-2" />
            <div className="flex justify-between mt-2 text-xs">
              <span>${campaign.raised.toLocaleString()} raised</span>
              <span>{percentComplete}% of ${campaign.goal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {campaign.image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{campaign.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {campaign.description}
            </CardDescription>
          </div>
          {!campaign.isActive && (
            <Badge variant="outline" className="bg-gray-100">Inactive</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">{percentComplete}%</span>
          </div>
          <Progress value={percentComplete} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>${campaign.raised.toLocaleString()} raised</span>
            <span>Goal: ${campaign.goal.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" /> 
          {daysLeft > 0 
            ? `${daysLeft} days left (Ends ${endDate.toLocaleDateString()})`
            : `Campaign ended on ${endDate.toLocaleDateString()}`
          }
        </div>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 py-3">
        <div className="w-full flex space-x-2">
          <Link to={`/fundraising/${campaign.id}`} className="flex-1">
            <Button variant="default" className="w-full">
              View Details
            </Button>
          </Link>
          {campaign.isActive && (
            <Link to={`/fundraising/${campaign.id}/donate`} className="flex-1">
              <Button variant="outline" className="w-full">
                Donate
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}