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
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, AlertCircle, Package, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useCreateOrder, useUpdateOrderStatus, useGetAllOrders, useListAllOrders, useCheckIsAdmin, useInitializeAccessControl } from '@/hooks/useAdminOrderQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useAdminActor } from '@/hooks/useAdminActor';
import { useAdminDiagnostics } from '@/hooks/useAdminDiagnostics';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { AdminQuoteFormsSection } from './AdminQuoteFormsSection';
import { AdminOrderTrackingSection } from './AdminOrderTrackingSection';
import { AdminPrincipalManagementSection } from './AdminPrincipalManagementSection';
import { OrderStatus, CleaningType } from '../backend';
import { getOrderStatusLabel } from '@/utils/orderStatusLabel';

export function AdminOrderManagementSection() {
  const { identity, login } = useInternetIdentity();
  const { actor: adminActor, isFetching: actorFetching, refetch: refetchActor } = useAdminActor();
  const { data: isAdmin, isLoading: isCheckingAdmin, isFetched: isAdminFetched, refetch: refetchAdminStatus } = useCheckIsAdmin();
  const { data: diagnostics, refetch: refetchDiagnostics } = useAdminDiagnostics();
  const initializeAccessControl = useInitializeAccessControl();
  const [initializationState, setInitializationState] = useState<'idle' | 'initializing' | 'rechecking' | 'complete' | 'failed'>('idle');
  
  // Create Order form state
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [numberOfCards, setNumberOfCards] = useState('');
  const [cleaningType, setCleaningType] = useState<CleaningType | ''>('');
  
  // Update Status form state
  const [updateTrackingNumber, setUpdateTrackingNumber] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(OrderStatus.processing);

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrderStatus();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetAllOrders();
  const { data: allOrders, isLoading: allOrdersLoading, error: allOrdersError } = useListAllOrders();

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

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const isCreateFormValid = (): boolean => {
    return (
      newTrackingNumber.trim() !== '' &&
      customerName.trim() !== '' &&
      customerEmail.trim() !== '' &&
      isValidEmail(customerEmail) &&
      numberOfCards.trim() !== '' &&
      parseInt(numberOfCards) > 0 &&
      cleaningType !== ''
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreateFormValid()) {
      createOrderMutation.mutate(
        {
          trackingNumber: newTrackingNumber.trim(),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          numberOfCards: parseInt(numberOfCards),
          cleaningType: cleaningType as CleaningType,
        },
        {
          onSuccess: () => {
            // Clear all form fields
            setNewTrackingNumber('');
            setCustomerName('');
            setCustomerEmail('');
            setNumberOfCards('');
            setCleaningType('');
          },
        }
      );
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
    const label = getOrderStatusLabel(status);
    
    switch (status) {
      case OrderStatus.processing:
        return <Badge variant="secondary">{label}</Badge>;
      case OrderStatus.packageReceived:
        return <Badge variant="default" className="bg-amber-600">{label}</Badge>;
      case OrderStatus.inspectionComplete:
        return <Badge variant="default" className="bg-purple-600">{label}</Badge>;
      case OrderStatus.cleaningComplete:
        return <Badge variant="default" className="bg-cyan-600">{label}</Badge>;
      case OrderStatus.inPress:
        return <Badge variant="default" className="bg-indigo-600">{label}</Badge>;
      case OrderStatus.finalTouches:
        return <Badge variant="default" className="bg-pink-600">{label}</Badge>;
      case OrderStatus.shipped:
        return <Badge variant="default" className="bg-blue-600">{label}</Badge>;
      case OrderStatus.delivered:
        return <Badge variant="default" className="bg-green-600">{label}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  const getCleaningTypeLabel = (type: CleaningType): string => {
    switch (type) {
      case CleaningType.superPotion:
        return 'Super Potion';
      case CleaningType.hyperPotion:
        return 'Hyper Potion';
      case CleaningType.maxPotion:
        return 'Max Potion';
      default:
        return 'Unknown';
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
            Manage orders, quote forms, tracking, and admin access
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="orders">Create Order</TabsTrigger>
              <TabsTrigger value="update">Update Status</TabsTrigger>
              <TabsTrigger value="list">All Orders</TabsTrigger>
              <TabsTrigger value="quotes">Quote Forms</TabsTrigger>
              <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
              <TabsTrigger value="admins">Admin Access</TabsTrigger>
            </TabsList>

            {/* Create Order Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Order</CardTitle>
                  <CardDescription>
                    Enter customer details and order information to create a new order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-tracking">Tracking Number *</Label>
                        <Input
                          id="new-tracking"
                          type="text"
                          placeholder="Enter tracking number"
                          value={newTrackingNumber}
                          onChange={(e) => setNewTrackingNumber(e.target.value)}
                          disabled={createOrderMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customer-name">Customer Name *</Label>
                        <Input
                          id="customer-name"
                          type="text"
                          placeholder="Enter customer name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          disabled={createOrderMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customer-email">Customer Email *</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          placeholder="customer@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          disabled={createOrderMutation.isPending}
                        />
                        {customerEmail && !isValidEmail(customerEmail) && (
                          <p className="text-xs text-destructive">Please enter a valid email address</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="number-of-cards">Number of Cards *</Label>
                        <Input
                          id="number-of-cards"
                          type="number"
                          min="1"
                          placeholder="Enter number of cards"
                          value={numberOfCards}
                          onChange={(e) => setNumberOfCards(e.target.value)}
                          disabled={createOrderMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="cleaning-type">Cleaning Type *</Label>
                        <Select
                          value={cleaningType}
                          onValueChange={(value) => setCleaningType(value as CleaningType)}
                          disabled={createOrderMutation.isPending}
                        >
                          <SelectTrigger id="cleaning-type">
                            <SelectValue placeholder="Select cleaning type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CleaningType.superPotion}>Super Potion</SelectItem>
                            <SelectItem value={CleaningType.hyperPotion}>Hyper Potion</SelectItem>
                            <SelectItem value={CleaningType.maxPotion}>Max Potion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={createOrderMutation.isPending || !isCreateFormValid()}
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
                          <SelectItem value={OrderStatus.packageReceived}>Package Received</SelectItem>
                          <SelectItem value={OrderStatus.inspectionComplete}>First Inspection Complete</SelectItem>
                          <SelectItem value={OrderStatus.cleaningComplete}>Cleaning Complete</SelectItem>
                          <SelectItem value={OrderStatus.inPress}>Card in Press</SelectItem>
                          <SelectItem value={OrderStatus.finalTouches}>Final Touches Being Performed</SelectItem>
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
                    View and manage all orders in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allOrdersLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}

                  {allOrdersError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {allOrdersError instanceof Error
                          ? allOrdersError.message
                          : 'Failed to load orders'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {allOrders && allOrders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No orders found. Create your first order to get started.
                    </div>
                  )}

                  {allOrders && allOrders.length > 0 && (
                    <ScrollArea className="w-full">
                      <div className="min-w-[800px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tracking Number</TableHead>
                              <TableHead>Customer Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className="text-center">Cards</TableHead>
                              <TableHead>Cleaning Type</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allOrders.map(([trackingNumber, order]) => (
                              <TableRow key={trackingNumber}>
                                <TableCell className="font-mono text-sm">{trackingNumber}</TableCell>
                                <TableCell>{order.customerName || '-'}</TableCell>
                                <TableCell className="text-sm">{order.customerEmail || '-'}</TableCell>
                                <TableCell className="text-center">{order.numberOfCards.toString()}</TableCell>
                                <TableCell>{getCleaningTypeLabel(order.cleaningType)}</TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </ScrollArea>
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

            {/* Admin Access Tab */}
            <TabsContent value="admins">
              <AdminPrincipalManagementSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
