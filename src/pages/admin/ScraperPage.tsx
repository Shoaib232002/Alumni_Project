import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, UserPlus, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ScrapedProfile {
  name: string;
  email: string;
  phone?: string;
  batch?: number;
  degree?: string;
  designation?: string;
  company?: string;
  location?: string;
  bio?: string;
  image?: string;
  linkedInProfile?: string;
  naukriProfile?: string;
  source: 'LinkedIn' | 'Naukri';
}

interface ScrapingMeta {
  source: string;
  keywords: string[];
  limit: number;
  count: number;
}

export default function ScraperPage() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState('');
  const [source, setSource] = useState<'linkedin' | 'naukri'>('linkedin');
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedProfiles, setScrapedProfiles] = useState<ScrapedProfile[]>([]);
  const [selectedTab, setSelectedTab] = useState('search');
  const [meta, setMeta] = useState<ScrapingMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not admin
  if (!currentUser || !isAdmin) {
    navigate('/');
    return null;
  }

  const handleScrape = async () => {
    if (!keywords) {
      toast.error('Please enter keywords to search');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMeta(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/scraper/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          keywords: keywords.split(',').map(k => k.trim()),
          source,
          limit: Number(limit)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape profiles');
      }

      setScrapedProfiles(data.profiles);
      
      // Store meta information if available
      if (data.meta) {
        setMeta(data.meta);
      }
      
      toast.success(`Found ${data.profiles.length} profiles`);
      setSelectedTab('results');
    } catch (error) {
      console.error('Scraping error:', error);
      setError(error instanceof Error ? error.message : 'Failed to scrape profiles');
      toast.error(error instanceof Error ? error.message : 'Failed to scrape profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAlumni = async (profile: ScrapedProfile) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/scraper/add-scraped-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409 || (data.error && data.error.includes('already exists'))) {
          toast.warning(`${profile.name} is already in the alumni database`);
          // Still remove from list since it's already in the database
          setScrapedProfiles(prev => prev.filter(p => p.email !== profile.email));
          return;
        }
        throw new Error(data.error || 'Failed to add alumni');
      }

      toast.success(data.message || `Added ${profile.name} as alumni`);
      
      // Remove from list
      setScrapedProfiles(prev => prev.filter(p => p.email !== profile.email));
    } catch (error) {
      console.error('Add alumni error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add alumni';
      toast.error(errorMessage);
      
      // If there are specific validation errors, show them
      if (error instanceof Error && (error as {cause?: {missingFields?: string[]}}).cause && typeof (error as {cause?: {missingFields?: string[]}}).cause === 'object') {
        const cause = (error as {cause?: {missingFields?: string[]}}).cause;
        if (cause.missingFields) {
          toast.error(`Missing required fields: ${cause.missingFields.join(', ')}`);
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Alumni Web Scraper</h1>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search for Alumni</CardTitle>
              <CardDescription>
                Search for potential alumni on LinkedIn and Naukri.com using keywords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  placeholder="college name, department, etc."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Example: "ABC College, Computer Science, 2015"
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={source}
                    onValueChange={(value: 'linkedin' | 'naukri') => setSource(value)}
                  >
                    <SelectTrigger id="source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="naukri">Naukri.com</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="limit">Result Limit</Label>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => setLimit(Number(value))}
                  >
                    <SelectTrigger id="limit">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 results</SelectItem>
                      <SelectItem value="10">10 results</SelectItem>
                      <SelectItem value="20">20 results</SelectItem>
                      <SelectItem value="50">50 results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleScrape} 
                disabled={isLoading || !keywords}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {scrapedProfiles.length} profiles found. {meta && `Searched ${meta.source} with ${meta.keywords.join(', ')} (${meta.count} total results).`} Add them as alumni to your database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : scrapedProfiles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No profiles found. Try a new search.</p>
                  <Button variant="outline" onClick={() => setSelectedTab('search')}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scrapedProfiles.map((profile) => (
                    <Card key={profile.email} className="overflow-hidden border-l-4" style={{
                      borderLeftColor: profile.source === 'LinkedIn' ? '#0077b5' : '#FF6200'
                    }}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`} 
                            alt={profile.name}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex-1 overflow-hidden">
                            <CardTitle className="text-lg truncate">{profile.name}</CardTitle>
                            <CardDescription className="truncate">
                              {profile.designation} {profile.company && `at ${profile.company}`}
                            </CardDescription>
                          </div>
                          <div className="flex-shrink-0 rounded-full bg-gray-100 p-1">
                            <img 
                              src={profile.source === 'LinkedIn' ? '/linkedin-icon.png' : '/naukri-icon.png'} 
                              alt={profile.source}
                              className="h-5 w-5"
                              onError={(e) => {
                                // Fallback if image doesn't exist
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${profile.source}&size=20`;
                              }}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Email:</span> 
                            <span className="text-gray-600 truncate max-w-[180px]">{profile.email}</span>
                          </div>
                          {profile.phone && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Phone:</span> 
                              <span className="text-gray-600">{profile.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Batch:</span> 
                            <span className="text-gray-600">{profile.batch || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Degree:</span> 
                            <span className="text-gray-600">{profile.degree || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Location:</span> 
                            <span className="text-gray-600">{profile.location || 'N/A'}</span>
                          </div>
                          {profile.bio && (
                            <div className="mt-2 text-gray-600 text-xs border-t pt-2 border-gray-100">
                              <p className="line-clamp-2">{profile.bio}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2 border-t border-gray-100">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(profile.source === 'LinkedIn' ? profile.linkedInProfile : profile.naukriProfile, '_blank')}
                        >
                          View on {profile.source}
                        </Button>
                        <Button 
                           size="sm"
                           onClick={() => handleAddAlumni(profile)}
                           disabled={false}
                           className={profile.source === 'LinkedIn' ? 'bg-[#0077b5] hover:bg-[#005885]' : ''}
                         >
                           {isLoading ? (
                             <>
                               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                               Adding...
                             </>
                           ) : (
                             <>
                               <UserPlus className="mr-2 h-4 w-4" />
                               Add as Alumni
                             </>
                           )}
                         </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedTab('search')}>
                Back to Search
              </Button>
              <Button variant="outline" onClick={() => setScrapedProfiles([])}>
                Clear Results
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}