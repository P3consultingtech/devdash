import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred in this section.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || 'The requested page could not be loaded.';
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground max-w-md text-center">{message}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button onClick={() => navigate('/', { replace: true })}>Go to Dashboard</Button>
      </div>
    </div>
  );
}
