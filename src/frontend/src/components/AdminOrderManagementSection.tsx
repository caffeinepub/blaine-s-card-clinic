import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Package, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useCreateOrder, useUpdateOrderStatus, useGetAllOrders, useCheckIsAdmin, useInitializeAccessControl } from '@/hooks/useAdminOrderQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useAdminActor } from '@/hooks/useAdminActor';
import { useAdminDiagnostics } from '@/hooks/useAdminDiagnostics';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { AdminQuoteFormsSection } from './AdminQuoteFormsSection';
import { AdminOrderTrackingSection } from './AdminOrderTrackingSection';
import { OrderStatus } from '../backend';

export function AdminOrderManagementSection() {
  const { identity, login } = useInternetIdentity();
  const { actor: adminActor, isFetching: actorFetching, refetch: refetchActor } = useAdminActor();
  const { data: isAdmin, isLoading: isCheckingAdmin, isFetched: isAdminFetched, refetch: refetchAdminStatus } = useCheckIsAdmin();
  const { data: diagnostics, refetch: refetchDiagnostics } = useAdminDiagnostics();
  const initializeAccessControl = useInitializeAccessControl();
  const [initializationState, setInitializationState] = useState<'idle' | 'initializing' | 'rechecking' | 'complete' | 'failed'>('idle');
  
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [updateTrackingNumber, setUpdateTrackingNumber] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(OrderStatus.processing);

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrderStatus();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetAllOrders();

  const isAuthenticated = !!identity;

  // Automatically try to initialize access control when authenticated but not admin
  useEffect(() => {
    if (isAuthenticated && isAdminFetched && !isAdmin && initializationState === 'idle' && adminActor) {
      setInitializationState('initializing');
      initializeAccessControl.mutate(undefined, {
        onSuccess: async () => {
          // After initialization, re-check admin status and diagnostics
          setInitializationState('rechecking');
          // Wait a moment for backend state to settle
          setTimeout(async () => {
            await Promise.all([
              refetchAdminStatus(),
              refetchDiagnostics()
            ]);
            setInitializationState('complete');
          }, 500);
        },
        onError: (error) => {
          console.error('Initialization error:', error);
          setInitializationState('failed');
        },
      });
    }
  }, [isAuthenticated, isAdminFetched, isAdmin, initializationState, adminActor, initializeAccessControl, refetchAdminStatus, refetchDiagnostics]);

  // Reset initialization state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setInitializationState('idle');
    }
  }, [isAuthenticated]);

  const handleRetryInitialization = async () => {
    setInitializationState('initializing');
    
    // Force actor recreation
    await refetchActor();
    
    // Try initialization again
    initializeAccessControl.mutate(undefined, {
      onSuccess: async () => {
        setInitializationState('rechecking');
        setTimeout(async () => {
          const [adminCheckResult] = await Promise.all([
            refetchAdminStatus(),
            refetchDiagnostics()
          ]);
          
          // Check if user is now admin
          if (adminCheckResult.data) {
            setInitializationState('complete');
          } else {
            // User is not admin, show access denied
            setInitializationState('complete');
          }
        }, 500);
      },
      onError: (error) => {
        console.error('Retry initialization error:', error);
        setInitializationState('failed');
      },
    });
  };

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

  // Show loading state while checking admin status or initializing
  const isResolvingAccess = actorFetching || isCheckingAdmin || (isAuthenticated && !isAdminFetched) || initializationState === 'initializing' || initializationState === 'rechecking';
  
  if (isResolvingAccess) {
    return (
      <section id="admin" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {initializationState === 'initializing' && (
              <p className="text-sm text-muted-foreground">Setting up admin access...</p>
            )}
            {initializationState === 'rechecking' && (
              <p className="text-sm text-muted-foreground">Verifying permissions...</p>
            )}
            {actorFetching && (
              <p className="text-sm text-muted-foreground">Connecting to service...</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Show error state with retry option if initialization failed
  if (initializationState === 'failed') {
    return (
      <section id="admin" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {initializeAccessControl.error instanceof Error
                  ? initializeAccessControl.error.message
                  : 'Unable to connect to the service. Please try again later.'}
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button
                onClick={handleRetryInitialization}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show access denied if not authenticated or confirmed not admin after initialization
  const shouldShowAccessDenied = !isAuthenticated || (isAuthenticated && initializationState === 'complete' && !isAdmin);
  
  if (shouldShowAccessDenied) {
    return (
      <section id="admin" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AccessDeniedScreen 
            isAuthenticated={isAuthenticated}
            onRetry={isAuthenticated ? handleRetryInitialization : undefined}
            onLogin={!isAuthenticated ? login : undefined}
          />
        </div>
      </section>
    );
  }

  return (
    <section id="admin" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-balance">
            Admin <span className="text-primary">Panel</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage orders, quote forms, and tracking
          </p>
          {isAdmin && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <ShieldCheck className="h-4 w-4" />
              <span>Admin access granted</span>
            </div>
          )}
          
          {/* Diagnostics info for authenticated users */}
          {isAuthenticated && diagnostics && (
            <div className="text-xs text-muted-foreground space-y-1 max-w-2xl mx-auto">
              <div className="font-mono bg-muted/50 rounded px-3 py-2 text-left">
                <div>Principal: {identity?.getPrincipal().toString()}</div>
                <div>Role: {diagnostics.callerRole}</div>
                <div>System Initialized: {diagnostics.isInitialized ? 'Yes' : 'No'}</div>
                <div>Is Admin: {diagnostics.callerIsAdmin ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="orders">Create Order</TabsTrigger>
              <TabsTrigger value="update">Update Status</TabsTrigger>
              <TabsTrigger value="list">All Orders</TabsTrigger>
              <TabsTrigger value="quotes">Quote Forms</TabsTrigger>
              <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
            </TabsList>

            {/* Create Order Tab */}
            <TabsContent value="orders">
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

            {/* All Orders Tab */}
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    View and manage all customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
                      No orders found. Create your first order to get started.
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
                              <TableCell className="font-medium">{trackingNumber}</TableCell>
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

            {/* Quote Forms Tab */}
            <TabsContent value="quotes">
              <AdminQuoteFormsSection />
            </TabsContent>

            {/* Order Tracking Tab */}
            <TabsContent value="tracking">
              <AdminOrderTrackingSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
