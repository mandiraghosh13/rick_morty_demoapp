import { useQuery } from '@tanstack/react-query';
// @ts-ignore - Handle Link navigation
import { Link } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Tv, Users, Calendar } from 'lucide-react';

interface CharacterDetailProps {
  characterId: number;
}

export function CharacterDetail({ characterId }: CharacterDetailProps) {
  const { data: character, isLoading, error } = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => api.characters.getById(characterId),
  });

  // Extract episode IDs from URLs
  const episodeIds = character?.episode.map(url => {
    const id = url.split('/').pop();
    return id ? parseInt(id) : 0;
  }).filter(Boolean) ?? [];

  const { data: episodes } = useQuery({
    queryKey: ['episodes', episodeIds],
    queryFn: () => api.episodes.getByIds(episodeIds),
    enabled: episodeIds.length > 0,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-96 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-destructive/20">
          <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive mb-4">Character not found</p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Characters
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColor = {
    Alive: 'default',
    Dead: 'destructive',
    unknown: 'secondary'
  } as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Characters
        </Button>
      </div>

      {/* Character Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <Card className="border-border/50 shadow-deep overflow-hidden">
          <div className="relative">
            <img
              src={character.image}
              alt={character.name}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <Badge variant={statusColor[character.status]} className="text-sm">
                {character.status}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card className="border-border/50 shadow-deep">
          <CardHeader>
            <CardTitle className="text-3xl text-portal-green">{character.name}</CardTitle>
            <p className="text-muted-foreground text-lg">{character.species}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {character.type && (
              <div>
                <h4 className="font-semibold text-accent">Type</h4>
                <p className="text-muted-foreground">{character.type}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-accent flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Gender
              </h4>
              <p className="text-muted-foreground">{character.gender}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-accent flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Origin
              </h4>
              <p className="text-muted-foreground">{character.origin.name}</p>
            </div>

            <div>
              <h4 className="font-semibold text-accent flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Last Known Location
              </h4>
              <p className="text-muted-foreground">{character.location.name}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-accent flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Created
              </h4>
              <p className="text-muted-foreground">
                {new Date(character.created).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Episodes */}
      {episodes && episodes.length > 0 && (
        <Card className="border-border/50 shadow-deep">
          <CardHeader>
            <CardTitle className="flex items-center text-cosmic-purple">
              <Tv className="mr-2 h-5 w-5" />
              Episodes ({episodes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {episodes.map((episode) => (
                <Card key={episode.id} className="border-border/30 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {episode.episode}
                      </Badge>
                      <h5 className="font-semibold text-sm leading-tight">
                        {episode.name}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {episode.air_date}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}