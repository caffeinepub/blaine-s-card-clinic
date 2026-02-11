import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserRole } from '../backend';

// Query to check if the current user is an admin
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Query to get the current user's role
export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation to create a new tracking state
export function useCreateTrackingState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trackingCode, restorationLevel }: { trackingCode: string; restorationLevel: string }) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }
      await actor.createTrackingState(trackingCode, restorationLevel);
    },
    onSuccess: () => {
      // Invalidate tracking queries to refresh any displayed tracking data
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
    },
  });
}

// Mutation to mark a package as arrived
export function useMarkPackageArrived() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackingCode: string) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }
      await actor.markPackageArrived(trackingCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
    },
  });
}

// Mutation to add a restoration step
export function useAddRestorationStep() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trackingCode, description }: { trackingCode: string; description: string }) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }
      await actor.addRestorationStep(trackingCode, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
    },
  });
}

// Mutation to complete a restoration step
export function useCompleteRestorationStep() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trackingCode, index }: { trackingCode: string; index: number }) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }
      await actor.completeRestorationStep(trackingCode, BigInt(index));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
    },
  });
}

// Mutation to mark a package as shipped
export function useMarkShipped() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackingCode: string) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }
      await actor.markShipped(trackingCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
    },
  });
}
