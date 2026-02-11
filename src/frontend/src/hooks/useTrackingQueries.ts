import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TrackingStateView } from '../backend';

export function useTrackPackage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<TrackingStateView | null, Error, string>({
    mutationFn: async (trackingCode: string) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        const result = await actor.getTrackingState(trackingCode);
        
        if (result === null) {
          throw new Error('Tracking code not found');
        }
        
        return result;
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('Tracking not found')) {
          throw new Error('Tracking code not found');
        }
        throw new Error('Failed to retrieve tracking information. Please try again.');
      }
    },
    // Store the result in the query cache for refetching
    onSuccess: (data, trackingCode) => {
      if (data) {
        queryClient.setQueryData(['tracking', trackingCode], data);
      }
    },
  });
}

// Helper hook to refetch tracking data for a specific tracking code
export function useRefetchTracking() {
  const queryClient = useQueryClient();

  return (trackingCode: string) => {
    queryClient.invalidateQueries({ queryKey: ['tracking', trackingCode] });
    queryClient.invalidateQueries({ queryKey: ['tracking'] });
  };
}
