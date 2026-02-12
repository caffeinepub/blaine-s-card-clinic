import { OrderStatus } from '../backend';

/**
 * Converts an OrderStatus enum value to a human-readable label
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.processing:
      return 'Processing';
    case OrderStatus.packageReceived:
      return 'Package Received';
    case OrderStatus.inspectionComplete:
      return 'First Inspection Complete';
    case OrderStatus.cleaningComplete:
      return 'Cleaning Complete';
    case OrderStatus.inPress:
      return 'Card in Press';
    case OrderStatus.finalTouches:
      return 'Final Touches Being Performed';
    case OrderStatus.shipped:
      return 'Shipped';
    case OrderStatus.delivered:
      return 'Delivered';
    default:
      return String(status);
  }
}
