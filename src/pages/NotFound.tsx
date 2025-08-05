import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}