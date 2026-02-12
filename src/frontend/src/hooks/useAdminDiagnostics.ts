import { useQuery } from '@tanstack/react-query';
import { useAdminActor } from './useAdminActor';

export function useAdminDiagnostics() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  return useQuery({
    queryKey: ['adminDiagnostics'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      return actor.getInitializationStatus();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
