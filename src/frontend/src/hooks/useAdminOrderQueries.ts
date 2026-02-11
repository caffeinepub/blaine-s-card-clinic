import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { OrderStatus } from '../backend';

export function useCreateOrder() {
  const { actor } = useActor();
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
          throw new Error('You do not have permission to create orders. Please log in as an administrator.');
        }
        throw new Error('Failed to create order. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
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
          throw new Error('You do not have permission to update order status. Please log in as an administrator.');
        }
        if (error.message?.includes('not found')) {
          throw new Error('Order not found. Please check the tracking number and try again.');
        }
        throw new Error('Failed to update order status. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, OrderStatus]>>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        const orders = await actor.examineTrackingNumbers();
        return orders;
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You do not have permission to view orders. Please log in as an administrator.');
        }
        throw new Error('Failed to retrieve orders. Please try again.');
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCheckIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;

      try {
        const isAdmin = await actor.isCallerAdmin();
        return isAdmin;
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
