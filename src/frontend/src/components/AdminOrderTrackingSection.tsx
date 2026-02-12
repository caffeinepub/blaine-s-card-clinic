import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, AlertCircle, Loader2, Package, Truck, Search, Plus, Check } from 'lucide-react';
import {
  useGetTrackingStateAdmin,
  useMarkPackageArrived,
  useAddRestorationStep,
  useCompleteRestorationStep,
  useMarkShipped,
} from '@/hooks/useAdminTrackingManagementQueries';

export function AdminOrderTrackingSection() {
  const [trackingCode, setTrackingCode] = useState('');
  const [searchedCode, setSearchedCode] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');

  const { data: trackingState, isLoading, error } = useGetTrackingStateAdmin(searchedCode);
  const markArrivedMutation = useMarkPackageArrived();
  const addStepMutation = useAddRestorationStep();
  const completeStepMutation = useCompleteRestorationStep();
  const markShippedMutation = useMarkShipped();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      setSearchedCode(trackingCode.trim());
    }
  };

  const handleMarkArrived = () => {
    if (searchedCode) {
      markArrivedMutation.mutate(searchedCode);
    }
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchedCode && newStepDescription.trim()) {
      addStepMutation.mutate(
        { trackingCode: searchedCode, description: newStepDescription.trim() },
        {
          onSuccess: () => {
            setNewStepDescription('');
          },
        }
      );
    }
  };

  const handleCompleteStep = (index: number) => {
    if (searchedCode) {
      completeStepMutation.mutate({ trackingCode: searchedCode, index });
    }
  };

  const handleMarkShipped = () => {
    if (searchedCode) {
      markShippedMutation.mutate(searchedCode);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle>Order Tracking Management</CardTitle>
          <CardDescription>Search for a tracking code to view and update restoration progress</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking-code">Tracking Code</Label>
              <div className="flex gap-2">
                <Input
                  id="tracking-code"
                  type="text"
                  placeholder="Enter tracking code"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                />
                <Button type="submit" disabled={!trackingCode.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load tracking state. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Not Found State */}
      {searchedCode && !isLoading && !error && !trackingState && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tracking state found for code "{searchedCode}". Please check the tracking code or create a new tracking
            entry first.
          </AlertDescription>
        </Alert>
      )}

      {/* Tracking State Display */}
      {trackingState && (
        <>
          {/* Status Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Status: {trackingState.trackingCode}</CardTitle>
              <CardDescription>Current restoration progress and shipping status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Package Status</Label>
                  <div>
                    {trackingState.arrived ? (
                      <Badge variant="default" className="bg-green-600">
                        <Package className="h-3 w-3 mr-1" />
                        Arrived
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Arrived</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Restoration Level</Label>
                  <div>
                    <Badge variant="outline">{trackingState.restorationLevel}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Shipping Status</Label>
                  <div>
                    {trackingState.shipped ? (
                      <Badge variant="default" className="bg-blue-600">
                        <Truck className="h-3 w-3 mr-1" />
                        Shipped
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Shipped</Badge>
                    )}
                  </div>
                </div>
              </div>

              {trackingState.shippingTimestamp && (
                <div className="text-sm text-muted-foreground">
                  Shipped on: {formatTimestamp(trackingState.shippingTimestamp)}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkArrived}
                  disabled={trackingState.arrived || markArrivedMutation.isPending}
                >
                  {markArrivedMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <Package className="h-3 w-3 mr-1" />
                      Mark Arrived
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkShipped}
                  disabled={trackingState.shipped || markShippedMutation.isPending}
                >
                  {markShippedMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <Truck className="h-3 w-3 mr-1" />
                      Mark Shipped
                    </>
                  )}
                </Button>
              </div>

              {/* Mutation Errors */}
              {markArrivedMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {markArrivedMutation.error instanceof Error
                      ? markArrivedMutation.error.message
                      : 'Failed to mark as arrived'}
                  </AlertDescription>
                </Alert>
              )}

              {markShippedMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {markShippedMutation.error instanceof Error
                      ? markShippedMutation.error.message
                      : 'Failed to mark as shipped'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Restoration Steps Card */}
          <Card>
            <CardHeader>
              <CardTitle>Restoration Steps</CardTitle>
              <CardDescription>Manage restoration progress steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Step Form */}
              <form onSubmit={handleAddStep} className="space-y-2">
                <Label htmlFor="new-step">Add New Step</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-step"
                    type="text"
                    placeholder="Enter step description"
                    value={newStepDescription}
                    onChange={(e) => setNewStepDescription(e.target.value)}
                    disabled={addStepMutation.isPending}
                  />
                  <Button type="submit" disabled={!newStepDescription.trim() || addStepMutation.isPending}>
                    {addStepMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Step
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {addStepMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {addStepMutation.error instanceof Error
                      ? addStepMutation.error.message
                      : 'Failed to add restoration step'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Steps List */}
              {trackingState.steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No restoration steps added yet. Add steps to track progress.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Step</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trackingState.steps.map((step, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>{step.description}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTimestamp(step.timestamp)}
                          </TableCell>
                          <TableCell>
                            {step.completed ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="secondary">In Progress</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteStep(index)}
                              disabled={step.completed || completeStepMutation.isPending}
                            >
                              {completeStepMutation.isPending ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Completing...
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Complete
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {completeStepMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {completeStepMutation.error instanceof Error
                      ? completeStepMutation.error.message
                      : 'Failed to complete restoration step'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
