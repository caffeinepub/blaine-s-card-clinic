import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TrackingStateView, OrderStatus } from '../backend';

interface TrackingResult {
  trackingState: TrackingStateView | null;
  orderStatus: OrderStatus | null;
}

export function useTrackPackage() {
  const { actor } = useActor();

  return useMutation<TrackingResult, Error, string>({
    mutationFn: async (trackingCode: string) => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please try again later.');
      }

      try {
        // Fetch both tracking state and order status
        const trackingState = await actor.getTrackingState(trackingCode);
        
        let orderStatus: OrderStatus | null = null;
        try {
          orderStatus = await actor.checkTrackingNumberStatus(trackingCode);
        } catch (error) {
          // Order status might not exist, that's okay
          orderStatus = null;
        }

        if (trackingState === null && orderStatus === null) {
          throw new Error('Tracking code not found');
        }

        return {
          trackingState,
          orderStatus,
        };
      } catch (error: any) {
        if (error.message?.includes('not found') || error.message?.includes('Tracking not found') || error.message?.includes('Order not found')) {
          throw new Error('Tracking code not found');
        }
        throw new Error('Failed to retrieve tracking information. Please try again.');
      }
    },
  });
}
