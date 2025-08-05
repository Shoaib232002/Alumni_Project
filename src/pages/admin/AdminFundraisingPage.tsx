import { useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { FundraisingCampaign } from "@/types";
import { toast } from "sonner";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Search,
  Trash2,
  Eye,
  PencilIcon,
  Plus,
  Check,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

export default function AdminFundraisingPage() {
  const { getCampaignList, updateCampaign, deleteCampaign } = useApi();
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<FundraisingCampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const campaignList = await getCampaignList();
        setCampaigns(campaignList);
        setFilteredCampaigns(campaignList);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        toast.error("Failed to load campaign data");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [getCampaignList]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setFilteredCampaigns(campaigns);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = campaigns.filter(c => 
      c.title.toLowerCase().includes(searchLower) ||
      c.description.toLowerCase().includes(searchLower)
    );
    
    setFilteredCampaigns(filtered);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateCampaign(id, { isActive: !currentStatus });
      toast.success(`Campaign ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Update local state
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, isActive: !currentStatus } : c
      ));
      setFilteredCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, isActive: !currentStatus } : c
      ));
    } catch (error) {
      console.error("Error updating campaign status:", error);
      toast.error("Failed to update campaign status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteCampaign(id);
      toast.success("Campaign deleted successfully");
      
      // Update local state
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setFilteredCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fundraising Management</h1>
        <Link to="/admin/fundraising/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-sm text-gray-500">
          {filteredCampaigns.length} campaigns
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaign data...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No campaigns found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const percentComplete = Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100);
                  
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.title}</TableCell>
                      <TableCell>
                        <div className="w-full max-w-xs">
                          <div className="flex justify-between text-xs mb-1">
                            <span>${campaign.raised.toLocaleString()}</span>
                            <span>${campaign.goal.toLocaleString()}</span>
                          </div>
                          <Progress value={percentComplete} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{new Date(campaign.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(campaign.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={campaign.isActive}
                            onCheckedChange={() => handleToggleActive(campaign.id, campaign.isActive)}
                          />
                          {campaign.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/fundraising/${campaign.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/fundraising/edit/${campaign.id}`)}>
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleActive(campaign.id, campaign.isActive)}
                              className={campaign.isActive ? "text-amber-600" : "text-green-600"}
                            >
                              {campaign.isActive ? (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(campaign.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}