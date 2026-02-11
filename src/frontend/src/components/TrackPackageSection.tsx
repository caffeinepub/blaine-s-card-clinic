import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, PackageCheck, Truck, CheckCircle2, Clock, AlertCircle, Shield, Info } from 'lucide-react';
import { useTrackPackage, useRefetchTracking } from '@/hooks/useTrackingQueries';
import {
  useIsCallerAdmin,
  useCreateTrackingState,
  useMarkPackageArrived,
  useAddRestorationStep,
  useCompleteRestorationStep,
  useMarkShipped,
} from '@/hooks/useTrackingAdmin';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

export function TrackPackageSection() {
  const [trackingCode, setTrackingCode] = useState('');
  const { mutate: trackPackage, data: trackingData, isPending, isError, error, reset } = useTrackPackage();
  const refetchTracking = useRefetchTracking();
  
  // Admin state
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const [adminTrackingCode, setAdminTrackingCode] = useState('');
  const [restorationLevel, setRestorationLevel] = useState('');
  const [stepDescription, setStepDescription] = useState('');
  const [stepIndex, setStepIndex] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // Admin mutations
  const createTracking = useCreateTrackingState();
  const markArrived = useMarkPackageArrived();
  const addStep = useAddRestorationStep();
  const completeStep = useCompleteRestorationStep();
  const markShipped = useMarkShipped();

  // Clear admin messages after 5 seconds
  useEffect(() => {
    if (adminError || adminSuccess) {
      const timer = setTimeout(() => {
        setAdminError(null);
        setAdminSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [adminError, adminSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      trackPackage(trackingCode.trim());
    }
  };

  const handleReset = () => {
    setTrackingCode('');
    reset();
  };

  const handleAdminAction = async (
    action: () => Promise<void>,
    successMessage: string
  ) => {
    setAdminError(null);
    setAdminSuccess(null);
    
    try {
      await action();
      setAdminSuccess(successMessage);
      
      // Refetch the tracking data if it's currently displayed
      if (trackingData && trackingData.trackingCode === adminTrackingCode) {
        setTimeout(() => {
          trackPackage(adminTrackingCode);
        }, 500);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setAdminError(errorMessage);
    }
  };

  const handleCreateTracking = () => {
    if (!adminTrackingCode.trim() || !restorationLevel) {
      setAdminError('Please enter a tracking code and select a restoration level');
      return;
    }
    handleAdminAction(
      () => createTracking.mutateAsync({ trackingCode: adminTrackingCode, restorationLevel }),
      'Tracking entry created successfully'
    );
  };

  const handleMarkArrived = () => {
    if (!adminTrackingCode.trim()) {
      setAdminError('Please enter a tracking code');
      return;
    }
    handleAdminAction(
      () => markArrived.mutateAsync(adminTrackingCode),
      'Package marked as arrived'
    );
  };

  const handleAddStep = () => {
    if (!adminTrackingCode.trim() || !stepDescription.trim()) {
      setAdminError('Please enter a tracking code and step description');
      return;
    }
    handleAdminAction(
      () => addStep.mutateAsync({ trackingCode: adminTrackingCode, description: stepDescription }),
      'Restoration step added successfully'
    ).then(() => setStepDescription(''));
  };

  const handleCompleteStep = () => {
    if (!adminTrackingCode.trim() || !stepIndex.trim()) {
      setAdminError('Please enter a tracking code and step index');
      return;
    }
    const index = parseInt(stepIndex, 10);
    if (isNaN(index) || index < 0) {
      setAdminError('Please enter a valid step index (0 or greater)');
      return;
    }
    handleAdminAction(
      () => completeStep.mutateAsync({ trackingCode: adminTrackingCode, index }),
      'Restoration step marked as complete'
    ).then(() => setStepIndex(''));
  };

  const handleMarkShipped = () => {
    if (!adminTrackingCode.trim()) {
      setAdminError('Please enter a tracking code');
      return;
    }
    handleAdminAction(
      () => markShipped.mutateAsync(adminTrackingCode),
      'Package marked as shipped'
    );
  };

  const getProgressPercentage = () => {
    if (!trackingData) return 0;
    
    let progress = 0;
    if (trackingData.arrived) progress += 25;
    
    const completedSteps = trackingData.steps.filter(s => s.completed).length;
    const totalSteps = trackingData.steps.length;
    if (totalSteps > 0) {
      progress += (completedSteps / totalSteps) * 50;
    }
    
    if (trackingData.shipped) progress = 100;
    
    return Math.round(progress);
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAuthenticated = !!identity;
  const showAdminPanel = isAuthenticated && isAdmin && !isAdminLoading;

  return (
    <section id="track-package" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-balance">
            Track Your <span className="text-primary">Order</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter your tracking code to see the status of your card restoration
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Status Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Order Status Guide
              </CardTitle>
              <CardDescription>
                Understanding your order's journey through our restoration process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Order Received</h4>
                  <p className="text-muted-foreground">
                    Your cards have arrived at our facility and are ready for restoration. Status shows as <Badge variant="secondary" className="inline-flex items-center gap-1 text-xs"><Clock className="h-3 w-3" />Pending</Badge> until arrival, then <Badge variant="default" className="inline-flex items-center gap-1 text-xs bg-primary"><CheckCircle2 className="h-3 w-3" />Complete</Badge> once received.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Restoration Process</h4>
                  <p className="text-muted-foreground">
                    Shows your selected service tier (Super Potion, Hyper Potion, or Max Potion) and individual restoration steps. Each step displays as <Badge variant="secondary" className="inline-flex items-center gap-1 text-xs"><Clock className="h-3 w-3" />Pending</Badge> while in progress and <Badge variant="default" className="inline-flex items-center gap-1 text-xs bg-primary"><CheckCircle2 className="h-3 w-3" />Complete</Badge> with timestamp when finished.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Shipped</h4>
                  <p className="text-muted-foreground">
                    Your restored cards are on their way back to you. Status shows as <Badge variant="secondary" className="inline-flex items-center gap-1 text-xs"><Clock className="h-3 w-3" />Pending</Badge> until shipped, then <Badge variant="default" className="inline-flex items-center gap-1 text-xs bg-primary"><CheckCircle2 className="h-3 w-3" />Complete</Badge> with the shipping date.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Tracking Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
              <CardDescription>
                Enter the tracking code provided when you submitted your cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking-code">Tracking Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tracking-code"
                      type="text"
                      placeholder="Enter your tracking code"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      disabled={isPending}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={isPending || !trackingCode.trim()}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isPending ? 'Searching...' : 'Track'}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Error State */}
              {isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error instanceof Error ? error.message : 'Tracking code not found. Please check and try again.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Tracking Results */}
              {trackingData && (
                <div className="space-y-6 animate-fade-in">
                  {/* Header with Reset */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Order Status</h3>
                      <p className="text-sm text-muted-foreground">
                        Tracking Code: <span className="font-mono">{trackingData.trackingCode}</span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Track Another
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{getProgressPercentage()}%</span>
                    </div>
                    <Progress value={getProgressPercentage()} className="h-2" />
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-4">
                    {/* Arrival Status */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <div className={`p-2 rounded-full ${trackingData.arrived ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Package className={`h-5 w-5 ${trackingData.arrived ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Order Received</h4>
                          {trackingData.arrived && (
                            <Badge variant="default" className="bg-primary">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                          {!trackingData.arrived && (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {trackingData.arrived 
                            ? 'Your cards have been received at our facility'
                            : 'Waiting for your cards to arrive'}
                        </p>
                      </div>
                    </div>

                    {/* Restoration Steps */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <div className={`p-2 rounded-full ${trackingData.steps.some(s => s.completed) ? 'bg-primary/10' : 'bg-muted'}`}>
                        <PackageCheck className={`h-5 w-5 ${trackingData.steps.some(s => s.completed) ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Restoration Process</h4>
                          <Badge variant="outline">
                            {trackingData.restorationLevel}
                          </Badge>
                        </div>
                        
                        {trackingData.steps.length > 0 ? (
                          <div className="space-y-2">
                            {trackingData.steps.map((step, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                {step.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className={step.completed ? 'text-foreground' : 'text-muted-foreground'}>
                                    {step.description}
                                  </p>
                                  {step.completed && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatTimestamp(step.timestamp)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Restoration steps will appear here once work begins
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Status */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <div className={`p-2 rounded-full ${trackingData.shipped ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Truck className={`h-5 w-5 ${trackingData.shipped ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Shipped</h4>
                          {trackingData.shipped && (
                            <Badge variant="default" className="bg-primary">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                          {!trackingData.shipped && (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {trackingData.shipped && trackingData.shippingTimestamp
                            ? `Shipped on ${formatTimestamp(trackingData.shippingTimestamp)}`
                            : 'Your cards will be shipped once restoration is complete'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Panel */}
          {showAdminPanel && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Admin: Update Order Status
                </CardTitle>
                <CardDescription>
                  Manage tracking states and update order progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Admin Messages */}
                {adminError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{adminError}</AlertDescription>
                  </Alert>
                )}
                {adminSuccess && (
                  <Alert className="border-primary bg-primary/5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary">{adminSuccess}</AlertDescription>
                  </Alert>
                )}

                {/* Tracking Code Input */}
                <div className="space-y-2">
                  <Label htmlFor="admin-tracking-code">Tracking Code</Label>
                  <Input
                    id="admin-tracking-code"
                    type="text"
                    placeholder="Enter tracking code to manage"
                    value={adminTrackingCode}
                    onChange={(e) => setAdminTrackingCode(e.target.value)}
                  />
                </div>

                <Separator />

                {/* Create Tracking Entry */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Create New Tracking Entry</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="restoration-level">Restoration Level</Label>
                      <Select value={restorationLevel} onValueChange={setRestorationLevel}>
                        <SelectTrigger id="restoration-level">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Super Potion">Super Potion ($5)</SelectItem>
                          <SelectItem value="Hyper Potion">Hyper Potion ($25)</SelectItem>
                          <SelectItem value="Max Potion">Max Potion ($50)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleCreateTracking}
                        disabled={createTracking.isPending || !adminTrackingCode.trim() || !restorationLevel}
                        className="w-full"
                      >
                        {createTracking.isPending ? 'Creating...' : 'Create Entry'}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Mark Package Arrived */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Mark Package Arrived</h4>
                  <Button
                    onClick={handleMarkArrived}
                    disabled={markArrived.isPending || !adminTrackingCode.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    {markArrived.isPending ? 'Updating...' : 'Mark as Arrived'}
                  </Button>
                </div>

                <Separator />

                {/* Add Restoration Step */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Add Restoration Step</h4>
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      <Label htmlFor="step-description">Step Description</Label>
                      <Input
                        id="step-description"
                        type="text"
                        placeholder="e.g., Initial cleaning completed"
                        value={stepDescription}
                        onChange={(e) => setStepDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleAddStep}
                        disabled={addStep.isPending || !adminTrackingCode.trim() || !stepDescription.trim()}
                        className="w-full sm:w-auto"
                      >
                        {addStep.isPending ? 'Adding...' : 'Add Step'}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Complete Restoration Step */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Complete Restoration Step</h4>
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      <Label htmlFor="step-index">Step Index (0-based)</Label>
                      <Input
                        id="step-index"
                        type="number"
                        min="0"
                        placeholder="e.g., 0 for first step"
                        value={stepIndex}
                        onChange={(e) => setStepIndex(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleCompleteStep}
                        disabled={completeStep.isPending || !adminTrackingCode.trim() || !stepIndex.trim()}
                        className="w-full sm:w-auto"
                      >
                        {completeStep.isPending ? 'Completing...' : 'Complete Step'}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Mark Shipped */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Mark Package Shipped</h4>
                  <Button
                    onClick={handleMarkShipped}
                    disabled={markShipped.isPending || !adminTrackingCode.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    {markShipped.isPending ? 'Updating...' : 'Mark as Shipped'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
