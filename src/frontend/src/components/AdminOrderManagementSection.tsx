import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Package, Loader2 } from 'lucide-react';
import { useCreateOrder, useUpdateOrderStatus, useGetAllOrders, useCheckIsAdmin } from '@/hooks/useAdminOrderQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { OrderStatus } from '../backend';

export function AdminOrderManagementSection() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useCheckIsAdmin();
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [updateTrackingNumber, setUpdateTrackingNumber] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(OrderStatus.processing);

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrderStatus();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetAllOrders();

  const isAuthenticated = !!identity;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrackingNumber.trim()) {
      createOrderMutation.mutate(newTrackingNumber.trim(), {
        onSuccess: () => {
          setNewTrackingNumber('');
        },
      });
    }
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateTrackingNumber.trim()) {
      updateOrderMutation.mutate(
        {
          trackingNumber: updateTrackingNumber.trim(),
          newStatus: selectedStatus,
        },
        {
          onSuccess: () => {
            setUpdateTrackingNumber('');
            setSelectedStatus(OrderStatus.processing);
          },
        }
      );
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.processing:
        return <Badge variant="secondary">Processing</Badge>;
      case OrderStatus.shipped:
        return <Badge variant="default" className="bg-blue-600">Shipped</Badge>;
      case OrderStatus.delivered:
        return <Badge variant="default" className="bg-green-600">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Show loading state while checking admin status
  if (isCheckingAdmin) {
    return (
      <section id="admin" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <section id="admin" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AccessDeniedScreen />
        </div>
      </section>
    );
  }

  return (
    <section id="admin" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-balance">
            Admin <span className="text-primary">Order Management</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create and manage customer orders
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Order</TabsTrigger>
              <TabsTrigger value="update">Update Status</TabsTrigger>
              <TabsTrigger value="list">All Orders</TabsTrigger>
            </TabsList>

            {/* Create Order Tab */}
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Order</CardTitle>
                  <CardDescription>
                    Enter a tracking number to create a new order with initial status "Processing"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-tracking">Tracking Number</Label>
                      <Input
                        id="new-tracking"
                        type="text"
                        placeholder="Enter tracking number"
                        value={newTrackingNumber}
                        onChange={(e) => setNewTrackingNumber(e.target.value)}
                        disabled={createOrderMutation.isPending}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={createOrderMutation.isPending || !newTrackingNumber.trim()}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 mr-2" />
                          Create Order
                        </>
                      )}
                    </Button>
                  </form>

                  {createOrderMutation.isSuccess && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Order created successfully with status "Processing"
                      </AlertDescription>
                    </Alert>
                  )}

                  {createOrderMutation.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {createOrderMutation.error instanceof Error
                          ? createOrderMutation.error.message
                          : 'Failed to create order. Please try again.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Update Status Tab */}
            <TabsContent value="update">
              <Card>
                <CardHeader>
                  <CardTitle>Update Order Status</CardTitle>
                  <CardDescription>
                    Change the status of an existing order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleUpdateStatus} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="update-tracking">Tracking Number</Label>
                      <Input
                        id="update-tracking"
                        type="text"
                        placeholder="Enter tracking number"
                        value={updateTrackingNumber}
                        onChange={(e) => setUpdateTrackingNumber(e.target.value)}
                        disabled={updateOrderMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status-select">New Status</Label>
                      <Select
                        value={selectedStatus}
                        onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
                        disabled={updateOrderMutation.isPending}
                      >
                        <SelectTrigger id="status-select">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={OrderStatus.processing}>Processing</SelectItem>
                          <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                          <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      disabled={updateOrderMutation.isPending || !updateTrackingNumber.trim()}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {updateOrderMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Status'
                      )}
                    </Button>
                  </form>

                  {updateOrderMutation.isSuccess && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Order status updated successfully
                      </AlertDescription>
                    </Alert>
                  )}

                  {updateOrderMutation.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {updateOrderMutation.error instanceof Error
                          ? updateOrderMutation.error.message
                          : 'Failed to update order status. Please try again.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* List Orders Tab */}
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    View all orders and their current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  {ordersError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {ordersError instanceof Error
                          ? ordersError.message
                          : 'Failed to load orders. Please try again.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {orders && orders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No orders found. Create your first order in the "Create Order" tab.
                    </div>
                  )}

                  {orders && orders.length > 0 && (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tracking Number</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map(([trackingNumber, status]) => (
                            <TableRow key={trackingNumber}>
                              <TableCell className="font-mono">{trackingNumber}</TableCell>
                              <TableCell>{getStatusBadge(status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
