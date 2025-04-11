
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary"></div>
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground font-medium mb-2">Page Not Found</p>
        <p className="text-muted-foreground mb-8">Sorry, we couldn't find the page you're looking for.</p>
        <Button 
          onClick={() => navigate('/')} 
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
