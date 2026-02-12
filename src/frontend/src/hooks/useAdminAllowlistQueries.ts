import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminActor } from './useAdminActor';
import { Principal } from '@dfinity/principal';

export function useGetAdminIds() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  return useQuery<Principal[]>({
    queryKey: ['adminIds'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminIds();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useAddAdminId() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error('Actor not available');
      
      // Validate and parse principal text
      let newAdminPrincipal: Principal;
      try {
        newAdminPrincipal = Principal.fromText(principalText.trim());
      } catch (error) {
        throw new Error('Invalid principal format. Please enter a valid Internet Identity principal.');
      }

      // Call backend to add the new admin
      try {
        await actor.addAdminId(newAdminPrincipal);
      } catch (error: any) {
        // Map backend errors to user-friendly messages
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only admins')) {
          throw new Error('You do not have permission to add admin principals. Only existing admins can add new admins.');
        }
        
        throw new Error(`Failed to add admin principal: ${errorMessage}`);
      }
    },
    onSuccess: () => {
      // Invalidate admin list to refresh
      queryClient.invalidateQueries({ queryKey: ['adminIds'] });
    },
  });
}
