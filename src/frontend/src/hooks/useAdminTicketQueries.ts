import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminActor } from './useAdminActor';
import { Ticket } from '../backend';

export function useListAllTickets() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  return useQuery<Array<[string, Ticket]>, Error>({
    queryKey: ['adminTickets'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to the service');
      }

      try {
        const tickets = await actor.listAllTickets();
        return tickets;
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to view quote forms');
        }
        throw new Error(error.message || 'Failed to fetch quote forms');
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useUpdateTicketStatus() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { email: string; completed: boolean }>({
    mutationFn: async ({ email, completed }) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        await actor.updateTicketStatus(email, completed);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to update ticket status. Please contact an administrator.');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Ticket not found. Please check the email address.');
        }
        throw new Error(error.message || 'Failed to update ticket status');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
    },
  });
}
