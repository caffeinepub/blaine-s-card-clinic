import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminActor } from './useAdminActor';
import { TrackingStateView } from '../backend';

export function useGetTrackingStateAdmin(trackingCode: string) {
  const { actor, isFetching: actorFetching } = useAdminActor();

  return useQuery<TrackingStateView | null, Error>({
    queryKey: ['adminTrackingState', trackingCode],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to the service');
      }

      try {
        const state = await actor.getTrackingState(trackingCode);
        return state;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch tracking state');
      }
    },
    enabled: !!actor && !actorFetching && !!trackingCode.trim(),
    retry: false,
  });
}

export function useMarkPackageArrived() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (trackingCode: string) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        await actor.markPackageArrived(trackingCode);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to mark packages as arrived.');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Tracking code not found.');
        }
        throw new Error(error.message || 'Failed to mark package as arrived');
      }
    },
    onSuccess: (_, trackingCode) => {
      queryClient.invalidateQueries({ queryKey: ['adminTrackingState', trackingCode] });
    },
  });
}

export function useAddRestorationStep() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { trackingCode: string; description: string }>({
    mutationFn: async ({ trackingCode, description }) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        await actor.addRestorationStep(trackingCode, description);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to add restoration steps.');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Tracking code not found.');
        }
        throw new Error(error.message || 'Failed to add restoration step');
      }
    },
    onSuccess: (_, { trackingCode }) => {
      queryClient.invalidateQueries({ queryKey: ['adminTrackingState', trackingCode] });
    },
  });
}

export function useCompleteRestorationStep() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { trackingCode: string; index: number }>({
    mutationFn: async ({ trackingCode, index }) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        await actor.completeRestorationStep(trackingCode, BigInt(index));
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to complete restoration steps.');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Tracking code not found.');
        }
        if (error.message?.includes('out of bounds')) {
          throw new Error('Invalid step index.');
        }
        throw new Error(error.message || 'Failed to complete restoration step');
      }
    },
    onSuccess: (_, { trackingCode }) => {
      queryClient.invalidateQueries({ queryKey: ['adminTrackingState', trackingCode] });
    },
  });
}

export function useMarkShipped() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (trackingCode: string) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        await actor.markShipped(trackingCode);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to mark packages as shipped.');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Tracking code not found.');
        }
        throw new Error(error.message || 'Failed to mark package as shipped');
      }
    },
    onSuccess: (_, trackingCode) => {
      queryClient.invalidateQueries({ queryKey: ['adminTrackingState', trackingCode] });
    },
  });
}
