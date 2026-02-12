import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogIn } from 'lucide-react';

interface AccessDeniedScreenProps {
  isAuthenticated?: boolean;
  onRetry?: () => void;
  onLogin?: () => void;
}

export function AccessDeniedScreen({ isAuthenticated = false, onRetry, onLogin }: AccessDeniedScreenProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          Access Denied
        </CardTitle>
        <CardDescription>
          {isAuthenticated 
            ? 'You do not have administrator permissions' 
            : 'Authentication required to access this area'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {isAuthenticated 
              ? 'This section is restricted to administrators only. You are logged in but not authorized as an admin. Please contact an existing administrator to be added to the admin list.'
              : 'Please log in with your Internet Identity to access the admin section.'}
          </AlertDescription>
        </Alert>
        
        {!isAuthenticated && onLogin && (
          <div className="flex justify-center">
            <Button onClick={onLogin} className="gap-2">
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </div>
        )}
        
        {isAuthenticated && onRetry && (
          <div className="flex justify-center">
            <Button onClick={onRetry} variant="outline">
              Retry Access Check
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
