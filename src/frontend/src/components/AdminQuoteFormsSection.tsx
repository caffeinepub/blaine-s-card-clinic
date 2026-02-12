import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, AlertCircle, Loader2, Mail, User, MessageSquare } from 'lucide-react';
import { useListAllTickets, useUpdateTicketStatus } from '@/hooks/useAdminTicketQueries';

export function AdminQuoteFormsSection() {
  const { data: tickets, isLoading, error } = useListAllTickets();
  const updateStatusMutation = useUpdateTicketStatus();
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);

  const handleToggleStatus = (email: string, currentStatus: boolean) => {
    setUpdatingEmail(email);
    updateStatusMutation.mutate(
      { email, completed: !currentStatus },
      {
        onSettled: () => {
          setUpdatingEmail(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Forms</CardTitle>
          <CardDescription>View and manage submitted quote requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Forms</CardTitle>
          <CardDescription>View and manage submitted quote requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load quote forms. Please try again.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Forms</CardTitle>
          <CardDescription>View and manage submitted quote requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No quote forms submitted yet. Forms will appear here when customers submit requests.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Forms</CardTitle>
        <CardDescription>
          View and manage submitted quote requests ({tickets.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map(([email, ticket]) => (
                <TableRow key={email}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {ticket.formData.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm line-clamp-2">{ticket.formData.message}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.completed ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={ticket.completed ? 'outline' : 'default'}
                      onClick={() => handleToggleStatus(email, ticket.completed)}
                      disabled={updatingEmail === email}
                    >
                      {updatingEmail === email ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Updating...
                        </>
                      ) : ticket.completed ? (
                        'Mark Pending'
                      ) : (
                        'Mark Complete'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {updateStatusMutation.isError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {updateStatusMutation.error instanceof Error
                ? updateStatusMutation.error.message
                : 'Failed to update ticket status. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
