import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { confirmAccountDeletion } from "@/endpoints";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/delete-account")({
  component: DeleteAccountConfirm,
});

function DeleteAccountConfirm() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get token from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid or missing confirmation token");
    }
  }, []);

  const handleConfirmDeletion = async () => {
    if (!token) {
      setError("No token provided");
      return;
    }

    setIsDeleting(true);
    try {
      await confirmAccountDeletion(token);

      // Sign out the user
      await authClient.signOut();

      toast.success("Your account has been deleted successfully.");

      // Redirect to login after a short delay
      setTimeout(() => {
        router.navigate({ to: "/login" });
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to delete account. The link may be expired.");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Confirm Account Deletion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <>
              <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
                {error}
              </div>
              <Button
                onClick={() => router.navigate({ to: "/dashboard" })}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-3 text-center">
                <p className="text-gray-600">
                  You are about to permanently delete your BoilerMeets account.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">
                    ⚠️ This action cannot be undone!
                  </p>
                  <p className="text-sm text-red-700">
                    All your data, matches, and messages will be permanently removed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDeletion}
                  variant="destructive"
                  className="flex-1"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}