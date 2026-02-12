import { useInternetIdentity } from './useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';

const ADMIN_ACTOR_QUERY_KEY = 'adminActor';

export function useAdminActor() {
  const { identity } = useInternetIdentity();

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ADMIN_ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity
        }
      };

      // Create actor with authenticated identity
      const actor = await createActorWithConfig(actorOptions);
      
      // Note: We don't call any secret-based initialization here
      // The backend will automatically grant admin to the first authenticated user
      // on their first backend call via initializeAccessControl()
      
      return actor;
    },
    staleTime: Infinity,
    enabled: true,
    retry: false,
  });

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    refetch: actorQuery.refetch,
  };
}
