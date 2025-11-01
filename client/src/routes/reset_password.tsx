import { authClient } from "@/lib/auth-client";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";

const resetPasswordSchema = z
  .object({
    email: z.string().regex(/^[a-zA-Z0-9._%+-]+@purdue\.edu$/, {
      message: "Email must be a valid Purdue email",
    })
  });

type FormValues = z.infer<typeof resetPasswordSchema>;

export const Route = createFileRoute('/reset_password')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit({ email}: FormValues) {
    try {
      await authClient.requestPasswordReset(
        {
          email: email,
          redirectTo: "/reset_password",
        },
        {
          onError: ({ error }) => {
            if (error.status == 500) {
                toast.error("Password resets can only be done once per day!");
            } else {
                toast.error(error.message || "Password Reset Failed");
            }
            setIsLoading(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            toast.success("Email sent. Please go to it to reset your password.");
            setIsLoading(false);
            router.navigate({ to: "/register_waiting" });
          },
        }
      );
    } catch (error) {
      toast.error("There was an error sending the reset password email, please try again.");
    }
  }

  const { isPending } = authClient.useSession();

  return (
    <div className="flex flex-1 justify-center items-center w-full h-full bg-gradient-to-br from-background from-30% to-primary">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className=" text-primary font-bold text-4xl">Boilermeets</h1>
          <p className="text-muted-foreground">
            Connect through conversations, not just photos
          </p>
        </div>
        <Button
          asChild
          variant={"outline"}
          size="lg"
          disabled={isPending || isLoading}
          className="flex-row gap-2 items-center"
        >
          <Link to="/login" className="w-full flex items-center justify-center">
            <p className="font-bold">&lt; Back To Login</p>
            {isPending ||
              (isLoading && (
                <Loader className="text-foreground animate-spin" />
              ))}
          </Link>
        </Button>
        <Card className="w-lg">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex flex-col">
              <h3 className="text-center font-semibold text-xl">
                Password Reset
              </h3>
              <p className="text-muted-foreground text-center text-xs">
                Even the best of us forget things sometimes
              </p>
              <p className="text-muted-foreground text-center text-xs">
                Enter your email to send a password reset request.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Controller
                control={form.control}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label>Email</Label>
                    <Label className="text-xs">
                      Must be a valid @purdue.edu email
                    </Label>
                    <Input
                      placeholder="Email"
                      onBlur={onBlur}
                      onChange={onChange}
                      className={cn(error && "border-destructive")}
                      value={value}
                    />
                    {error && (
                      <p className="text-destructive">{error.message}</p>
                    )}
                  </div>
                )}
                name="email"
              />
              <Button
                size="lg"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isPending || isLoading}
                className="flex-row gap-2 items-center"
              >
                <p className="font-bold">Send Email</p>
                {isPending ||
                  (isLoading && (
                    <Loader className="text-foreground animate-spin" />
                  ))}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}