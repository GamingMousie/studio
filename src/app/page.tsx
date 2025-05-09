'use client';

import { useState } from 'react';
import { useWarehouse } from '@/contexts/WarehouseContext';
import TrailerCard from '@/components/trailer/TrailerCard';
import AddTrailerDialog from '@/components/trailer/AddTrailerDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListFilter, LayoutGrid, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TrailerStatus } from '@/types';

export default function HomePage() {
  const { trailers, deleteTrailer, updateTrailerStatus } = useWarehouse();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrailerStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredTrailers = trailers.filter(trailer => {
    const matchesSearch = trailer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trailer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trailer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const allStatuses: TrailerStatus[] = ['Docked', 'In-Transit', 'Empty', 'Loading', 'Unloading'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <h1 className="text-3xl font-bold text-foreground">Trailer Dashboard</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Trailer
        </Button>
      </div>

      <div className="p-4 bg-card rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TrailerStatus | 'all')}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {allStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
              <ListFilter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {filteredTrailers.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-lg shadow">
          <p className="text-xl text-muted-foreground">No trailers found.</p>
          <p className="text-muted-foreground">Try adjusting your search or filter, or add a new trailer.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredTrailers.map((trailer) => (
            <TrailerCard 
              key={trailer.id} 
              trailer={trailer} 
              viewMode={viewMode}
              onDelete={() => deleteTrailer(trailer.id)}
              onStatusChange={(newStatus) => updateTrailerStatus(trailer.id, newStatus)}
            />
          ))}
        </div>
      )}

      <AddTrailerDialog isOpen={isAddDialogOpen} setIsOpen={setIsAddDialogOpen} />
    </div>
  );
}
