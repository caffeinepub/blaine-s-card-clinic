import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, AlertCircle, Loader2, UserPlus, Shield } from 'lucide-react';
import { useGetAdminIds, useAddAdminId } from '@/hooks/useAdminAllowlistQueries';

export function AdminPrincipalManagementSection() {
  const [newPrincipalText, setNewPrincipalText] = useState('');
  const { data: adminIds, isLoading: loadingAdmins, error: loadError } = useGetAdminIds();
  const addAdminMutation = useAddAdminId();

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrincipalText.trim()) {
      addAdminMutation.mutate(newPrincipalText.trim(), {
        onSuccess: () => {
          setNewPrincipalText('');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Admin Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Admin Principal
          </CardTitle>
          <CardDescription>
            Grant admin access to another Internet Identity principal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-principal">Principal ID</Label>
              <Input
                id="new-principal"
                type="text"
                placeholder="Enter principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
                value={newPrincipalText}
                onChange={(e) => setNewPrincipalText(e.target.value)}
                disabled={addAdminMutation.isPending}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The user must provide their principal ID from their Internet Identity login
              </p>
            </div>
            <Button
              type="submit"
              disabled={addAdminMutation.isPending || !newPrincipalText.trim()}
              className="w-full"
            >
              {addAdminMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Admin...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </>
              )}
            </Button>
          </form>

          {addAdminMutation.isSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Admin principal added successfully. They now have full admin access.
              </AlertDescription>
            </Alert>
          )}

          {addAdminMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {addAdminMutation.error instanceof Error
                  ? addAdminMutation.error.message
                  : 'Failed to add admin principal. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Admins List Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Admin Principals
          </CardTitle>
          <CardDescription>
            List of all principals with admin access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAdmins && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {loadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load admin list. Please refresh the page.
              </AlertDescription>
            </Alert>
          )}

          {!loadingAdmins && !loadError && adminIds && adminIds.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No admin principals found</p>
            </div>
          )}

          {!loadingAdmins && !loadError && adminIds && adminIds.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Principal ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminIds.map((principal, index) => (
                    <TableRow key={principal.toString()}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {principal.toString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
