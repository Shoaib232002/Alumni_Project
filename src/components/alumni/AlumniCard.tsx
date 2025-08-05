import { Alumni } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  Linkedin, 
  Globe,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AlumniCardProps {
  alumni: Alumni;
  isCompact?: boolean;
}

export function AlumniCard({ alumni, isCompact = false }: AlumniCardProps) {
  // Add console log to debug the alumni data
  console.log('Alumni in card:', alumni);
  
  if (isCompact) {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-start p-4">
          <img 
            src={alumni.image || `https://ui-avatars.com/api/?name=${alumni.name}`}
            alt={alumni.name}
            className="rounded-full h-12 w-12 object-cover mr-4"
          />
          <div className="flex-1">
            <CardTitle className="text-lg">{alumni.name}</CardTitle>
            <CardDescription>
              <span className="flex items-center">
                <GraduationCap className="h-3 w-3 mr-1" />
                {alumni.batch} - {alumni.degree}
              </span>
              {alumni.currentCompany && (
                <span className="flex items-center mt-1">
                  <Building className="h-3 w-3 mr-1" />
                  {alumni.designation || 'Employee'} at {alumni.currentCompany}
                </span>
              )}
            </CardDescription>
          </div>
          <Link to={`/alumni/${alumni.id}`}>
            <Button variant="outline" size="sm">View Profile</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={alumni.image || `https://ui-avatars.com/api/?name=${alumni.name}`}
            alt={alumni.name}
            className="rounded-full h-16 w-16 object-cover"
          />
          <div>
            <CardTitle>{alumni.name}</CardTitle>
            <CardDescription>{alumni.degree || 'Graduate'}</CardDescription>
            <Badge variant="outline" className="mt-1">{alumni.batch} Batch</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alumni.currentCompany && (
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
            <span>{alumni.designation || 'Employee'} at {alumni.currentCompany}</span>
          </div>
        )}
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-gray-400" />
          <span>{alumni.email}</span>
        </div>
        {alumni.phone && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span>{alumni.phone}</span>
          </div>
        )}
        <div className="pt-3">
          <h4 className="text-sm font-medium mb-2">Professional Profiles</h4>
          <div className="flex flex-wrap gap-2">
            {alumni.linkedInProfile && (
              <a href={alumni.linkedInProfile} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Linkedin className="h-3.5 w-3.5 mr-1" />
                  LinkedIn
                </Button>
              </a>
            )}
            {alumni.naukriProfile && (
              <a href={alumni.naukriProfile} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  Naukri
                </Button>
              </a>
            )}
            {alumni.otherProfiles && Object.entries(alumni.otherProfiles).map(([key, value]) => (
              <a key={key} href={value} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  {key}
                </Button>
              </a>
            ))}
          </div>
        </div>
        {alumni.bio && (
          <div className="pt-3">
            <h4 className="text-sm font-medium mb-1">Bio</h4>
            <p className="text-sm text-gray-500">{alumni.bio}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-gray-50 py-3">
        <Link to={`/alumni/${alumni.id}`} className="w-full">
          <Button variant="default" className="w-full">View Full Profile</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}