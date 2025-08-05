import { useEffect, useState } from "react";
import { useApi } from "@/contexts/ApiContext";
import { Alumni } from "@/types";
import { useSearchParams } from "react-router-dom";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AlumniPage() {
  const { getAlumniList } = useApi();
  const [searchParams, setSearchParams] = useSearchParams();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>(searchParams.get("batch") || "");
  const [selectedDegree, setSelectedDegree] = useState<string>("");
  const [degrees, setDegrees] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [viewMode, setViewMode] = useState<"card" | "compact">("compact");

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const alumniList = await getAlumniList();
        setAlumni(alumniList);
        
        // Extract unique batches, degrees and companies
        const uniqueBatches = [...new Set(alumniList.map(a => a.batch))].sort().reverse();
        const uniqueDegrees = [...new Set(alumniList.map(a => a.degree))].sort();
        const uniqueCompanies = [...new Set(
          alumniList
            .filter(a => a.currentCompany)
            .map(a => a.currentCompany as string)
        )].sort();
        
        setBatches(uniqueBatches);
        setDegrees(uniqueDegrees);
        setCompanies(uniqueCompanies);
        
        // Apply initial filtering if there's a batch in URL
        filterAlumni(alumniList, searchTerm, selectedBatch, selectedDegree, selectedCompany);
      } catch (error) {
        console.error("Error fetching alumni:", error);
      }
    };

    fetchAlumni();
  }, [getAlumniList, searchParams]);

  const filterAlumni = (
    alumniList: Alumni[], 
    search: string, 
    batch: string, 
    degree: string, 
    company: string
  ) => {
    let filtered = [...alumniList];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchLower) || 
        a.email.toLowerCase().includes(searchLower) ||
        (a.designation && a.designation.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by batch
    if (batch) {
      filtered = filtered.filter(a => a.batch === batch);
    }
    
    // Filter by degree
    if (degree) {
      filtered = filtered.filter(a => a.degree === degree);
    }
    
    // Filter by company
    if (company) {
      filtered = filtered.filter(a => a.currentCompany === company);
    }
    
    setFilteredAlumni(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterAlumni(alumni, searchTerm, selectedBatch, selectedDegree, selectedCompany);
    
    // Update URL params
    const params = new URLSearchParams();
    if (selectedBatch) params.set('batch', selectedBatch);
    setSearchParams(params);
  };

  const handleBatchChange = (value: string) => {
    setSelectedBatch(value);
    
    // Update URL and filter immediately
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('batch', value);
    } else {
      params.delete('batch');
    }
    setSearchParams(params);
    
    filterAlumni(alumni, searchTerm, value, selectedDegree, selectedCompany);
  };

  const handleDegreeChange = (value: string) => {
    setSelectedDegree(value);
    filterAlumni(alumni, searchTerm, selectedBatch, value, selectedCompany);
  };

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    filterAlumni(alumni, searchTerm, selectedBatch, selectedDegree, value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBatch("");
    setSelectedDegree("");
    setSelectedCompany("");
    setSearchParams({});
    filterAlumni(alumni, "", "", "", "");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Alumni Directory</h1>
          <p className="text-gray-600">
            Connect with {filteredAlumni.length} alumni from our institution
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Link to="/alumni/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Alumni
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filter Alumni</SheetTitle>
                <SheetDescription>
                  Filter the alumni directory by various criteria.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Batch</label>
                  <Select value={selectedBatch} onValueChange={handleBatchChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Batches</SelectItem>
                      {batches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch} Batch</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Degree</label>
                  <Select value={selectedDegree} onValueChange={handleDegreeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Degrees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Degrees</SelectItem>
                      {degrees.map(degree => (
                        <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Company</label>
                  <Select value={selectedCompany} onValueChange={handleCompanyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Companies</SelectItem>
                      {companies.map(company => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <div className="hidden md:flex space-x-2">
            <Button 
              variant={viewMode === "compact" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewMode("compact")}
            >
              Compact
            </Button>
            <Button 
              variant={viewMode === "card" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewMode("card")}
            >
              Cards
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters - Desktop */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  placeholder="Search alumni..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <div>
                <label className="text-sm font-medium mb-1 block">Batch</label>
                <Select value={selectedBatch} onValueChange={handleBatchChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Batches</SelectItem>
                    {batches.map(batch => (
                      <SelectItem key={batch} value={batch}>{batch} Batch</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Degree</label>
                <Select value={selectedDegree} onValueChange={handleDegreeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Degrees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Degrees</SelectItem>
                    {degrees.map(degree => (
                      <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Company</label>
                <Select value={selectedCompany} onValueChange={handleCompanyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Companies</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Search - Mobile only */}
        <div className="md:hidden mb-4">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              placeholder="Search alumni..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Alumni List */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {filteredAlumni.length} alumni found
            </div>
            <div className="md:hidden flex space-x-2">
              <Button 
                variant={viewMode === "compact" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("compact")}
              >
                Compact
              </Button>
              <Button 
                variant={viewMode === "card" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("card")}
              >
                Cards
              </Button>
            </div>
          </div>

          {filteredAlumni.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No alumni found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : viewMode === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAlumni.map(alumni => (
                <AlumniCard key={alumni.id} alumni={alumni} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlumni.map(alumni => (
                <AlumniCard key={alumni.id} alumni={alumni} isCompact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}