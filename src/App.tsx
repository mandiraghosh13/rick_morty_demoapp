import { createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { CharacterList } from '@/components/CharacterList';
import { CharacterDetail } from '@/components/CharacterDetail';

// Create root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-gradient-space">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});

// Create index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search?.page) || 1,
    };
  },
  component: function IndexComponent() {
    const { page = 1 } = indexRoute.useSearch();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-portal bg-clip-text text-transparent">
            Rick & Morty Character Explorer
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore the multiverse and discover all your favorite characters
          </p>
        </div>
        
        <CharacterList currentPage={page} />
      </div>
    );
  },
});

// Create character detail route
const characterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/character/$characterId',
  component: function CharacterDetailComponent() {
    const { characterId } = characterRoute.useParams();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <CharacterDetail characterId={Number(characterId)} />
      </div>
    );
  },
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  characterRoute,
]);

// @ts-ignore - Skip TypeScript strict mode for router creation
const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;