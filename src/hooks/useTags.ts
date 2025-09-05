

// src/hooks/useTags.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi } from '@/lib/api-client';
import { Tag, CreateTagRequest } from '@/types';
import { toast } from 'react-hot-toast';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await tagApi.getAll();
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch tags');
      }
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTagRequest) => {
      const response = await tagApi.create(data);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create tag');
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateTagRequest> }) => {
      const response = await tagApi.update(id, data);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update tag');
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await tagApi.delete(id);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete tag');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}