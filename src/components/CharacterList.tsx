import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useNavigate } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { Character } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ChevronLeft, ChevronRight, Share2, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CharacterListProps {
  currentPage: number;
}

const columnHelper = createColumnHelper<Character>();

const columns = [
  columnHelper.accessor('image', {
    header: 'Avatar',
    cell: (info) => (
      <img 
        src={info.getValue()} 
        alt={info.row.original.name}
        className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
      />
    ),
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => (
      <div className="font-semibold text-foreground">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const status = info.getValue();
      const variant = status === 'Alive' ? 'default' : status === 'Dead' ? 'destructive' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  }),
  columnHelper.accessor('species', {
    header: 'Species',
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('location.name', {
    header: 'Location',
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
];

export function CharacterList({ currentPage }: CharacterListProps) {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['characters', currentPage],
    queryFn: () => api.characters.getPage(currentPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const table = useReactTable({
    data: data?.results ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Characters refreshed",
        description: `Page ${currentPage} has been updated`,
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh character data",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (character: Character) => {
    navigate({ to: `/character/${character.id}` });
  };

  const handlePageChange = (newPage: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage.toString());
    window.history.pushState({}, '', url.toString());
    
    // Force a re-render by updating the URL without full page reload
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleShareLink = async () => {
    const currentUrl = `${window.location.origin}/?page=${currentPage}`;
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Link copied!",
        description: "Page link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load characters</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh and Share Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Characters</h2>
          {data && (
            <p className="text-muted-foreground">
              Showing {data.results.length} of {data.info.count} characters
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleShareLink}
            variant="outline"
            size="sm"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Page
          </Button>
          <Button 
            onClick={handleRefresh} 
            disabled={isFetching}
            variant="outline"
            className="portal-glow"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Character Table */}
      <Card className="border-border/50 shadow-deep">
        <CardHeader>
          <CardTitle className="text-portal-green">Interdimensional Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {isFetching && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Refreshing...</span>
                  </div>
                </div>
              )}
              <div className="rounded-md border border-border/30">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="px-4 py-3 text-left font-medium">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row.original)}
                        className="border-t border-border/30 hover:bg-muted/20 cursor-pointer transition-colors cosmic-shimmer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && (
        <div className="flex justify-between items-center">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!data.info.prev}
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {data.info.pages}
            </span>
          </div>
          
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!data.info.next}
            variant="outline"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}