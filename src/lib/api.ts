import { Character, CharacterResponse, Episode } from '@/types/api';

const BASE_URL = 'https://rickandmortyapi.com/api';

export const api = {
  characters: {
    getPage: async (page: number = 1): Promise<CharacterResponse> => {
      const response = await fetch(`${BASE_URL}/character?page=${page}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch characters: ${response.statusText}`);
      }
      return response.json();
    },
    
    getById: async (id: number): Promise<Character> => {
      const response = await fetch(`${BASE_URL}/character/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch character: ${response.statusText}`);
      }
      return response.json();
    }
  },
  
  episodes: {
    getByIds: async (ids: number[]): Promise<Episode[]> => {
      if (ids.length === 0) return [];
      const response = await fetch(`${BASE_URL}/episode/${ids.join(',')}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch episodes: ${response.statusText}`);
      }
      const data = await response.json();
      // API returns single object if only one ID, array if multiple
      return Array.isArray(data) ? data : [data];
    }
  }
};