import { useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Alumni } from "@/types";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Check, 
  MoreVertical, 
  Search, 
  Trash2, 
  Plus,
  Eye,
  PencilIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminAlumniPage() {
  const { getAlumniList, updateAlumni, deleteAlumni } = useApi();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const alumniList = await getAlumniList();
        setAlumni(alumniList);
        setFilteredAlumni(alumniList);
      } catch (error) {
        console.error("Error fetching alumni:", error);
        toast.error("Failed to load alumni data");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [getAlumniList]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setFilteredAlumni(alumni);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = alumni.filter(a => 
      a.name.toLowerCase().includes(searchLower) ||
      a.email.toLowerCase().includes(searchLower) ||
      a.batch.includes(searchTerm) ||
      (a.currentCompany && a.currentCompany.toLowerCase().includes(searchLower))
    );
    
    setFilteredAlumni(filtered);
  };

  const handleVerify = async (id: string) => {
    try {
      await updateAlumni(id, { isVerified: true });
      toast.success("Alumni verified successfully");
      
      // Update local state
      setAlumni(prev => prev.map(a => 
        a.id === id ? { ...a, isVerified: true } : a
      ));
      setFilteredAlumni(prev => prev.map(a => 
        a.id === id ? { ...a, isVerified: true } : a
      ));
    } catch (error) {
      console.error("Error verifying alumni:", error);
      toast.error("Failed to verify alumni");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this alumni? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteAlumni(id);
      toast.success("Alumni deleted successfully");
      
      // Update local state
      setAlumni(prev => prev.filter(a => a.id !== id));
      setFilteredAlumni(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error deleting alumni:", error);
      toast.error("Failed to delete alumni");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alumni Management</h1>
        <Link to="/admin/alumni/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Alumni
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search alumni..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-sm text-gray-500">
          {filteredAlumni.length} of {alumni.length} alumni
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading alumni data...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlumni.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No alumni found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlumni.map((alumnus) => (
                  <TableRow key={alumnus.id}>
                    <TableCell className="font-medium">{alumnus.name}</TableCell>
                    <TableCell>{alumnus.batch}</TableCell>
                    <TableCell>{alumnus.email}</TableCell>
                    <TableCell>{alumnus.currentCompany || "-"}</TableCell>
                    <TableCell>
                      {alumnus.isVerified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                      )}
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
                          <DropdownMenuItem onClick={() => navigate(`/alumni/${alumnus.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/alumni/edit/${alumnus.id}`)}>
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {!alumnus.isVerified && (
                            <DropdownMenuItem onClick={() => handleVerify(alumnus.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Verify
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(alumnus.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}