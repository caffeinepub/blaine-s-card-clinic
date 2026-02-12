import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminActor } from './useAdminActor';
import { OrderStatus } from '../backend';

export function useCreateOrder() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation<OrderStatus, Error, string>({
    mutationFn: async (trackingNumber: string) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        const status = await actor.createOrder(trackingNumber);
        return status;
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to create orders. Please contact an administrator.');
        }
        throw new Error(error.message || 'Failed to create order');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation<OrderStatus, Error, { trackingNumber: string; newStatus: OrderStatus }>({
    mutationFn: async ({ trackingNumber, newStatus }) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        const status = await actor.updateTrackingNumberStatus(trackingNumber, newStatus);
        return status;
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to update order status. Please contact an administrator.');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Order not found. Please check the tracking number.');
        }
        throw new Error(error.message || 'Failed to update order status');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  return useQuery<Array<[string, OrderStatus]>, Error>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to the service');
      }

      try {
        const orders = await actor.examineTrackingNumbers();
        return orders;
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to view orders');
        }
        throw new Error(error.message || 'Failed to fetch orders');
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCheckIsAdmin() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  return useQuery<boolean, Error>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) {
        return false;
      }

      try {
        const isAdmin = await actor.isCallerAdmin();
        return isAdmin;
      } catch (error: any) {
        console.error('Admin check error:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useInitializeAccessControl() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        await actor.initializeAccessControl();
      } catch (error: any) {
        if (error.message?.includes('anonymous')) {
          throw new Error('Please log in to initialize admin access');
        }
        // If already initialized, this is not an error
        if (error.message?.includes('Already initialized') || error.message?.includes('already')) {
          return;
        }
        throw new Error(error.message || 'Failed to initialize access control');
      }
    },
    onSuccess: () => {
      // Invalidate admin status and diagnostics after initialization
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminDiagnostics'] });
    },
  });
}
