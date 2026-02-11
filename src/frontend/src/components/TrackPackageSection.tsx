import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, PackageCheck, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useTrackPackage } from '@/hooks/useTrackingQueries';
import { OrderStatus } from '../backend';

export function TrackPackageSection() {
  const [trackingCode, setTrackingCode] = useState('');
  const { mutate: trackPackage, data: trackingResult, isPending, isError, error, reset } = useTrackPackage();

  const trackingData = trackingResult?.trackingState;
  const orderStatus = trackingResult?.orderStatus;

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

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.processing:
        return (
          <Badge variant="secondary" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case OrderStatus.shipped:
        return (
          <Badge variant="default" className="bg-blue-600 text-sm">
            <Truck className="h-3 w-3 mr-1" />
            Shipped
          </Badge>
        );
      case OrderStatus.delivered:
        return (
          <Badge variant="default" className="bg-green-600 text-sm">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

        <div className="max-w-3xl mx-auto">
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
              {trackingResult && (
                <div className="space-y-6 animate-fade-in">
                  {/* Header with Reset */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Order Status</h3>
                      <p className="text-sm text-muted-foreground">
                        Tracking Code: <span className="font-mono">{trackingCode}</span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Track Another
                    </Button>
                  </div>

                  {/* Order Status Badge */}
                  {orderStatus && (
                    <div className="flex items-center gap-2 p-4 rounded-lg border bg-card">
                      <Package className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Current Order Status</p>
                      </div>
                      {getOrderStatusBadge(orderStatus)}
                    </div>
                  )}

                  {/* Progress Bar (only if tracking data exists) */}
                  {trackingData && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Restoration Progress</span>
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
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
