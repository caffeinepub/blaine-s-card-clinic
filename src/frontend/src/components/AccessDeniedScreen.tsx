import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export function AccessDeniedScreen() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          Access Denied
        </CardTitle>
        <CardDescription>
          You do not have permission to access this area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertDescription>
            This section is restricted to administrators only. Please contact the site administrator if you believe you should have access.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
