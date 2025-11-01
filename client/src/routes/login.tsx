import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, fetchUserSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Loader } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const signInSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormValues = z.infer<typeof signInSchema>;

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    if (context.currentUserData) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  async function onSubmit({ email, password }: FormValues) {
    try {
      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              toast.error("Please verify your email address");
            } else {
              toast.error(
                ctx.error.message || "Login failed, invalid email or password"
              );
            }
            setIsLoading(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: async () => {
            await queryClient.invalidateQueries({
              queryKey: ["session"],
            });
            await queryClient.refetchQueries({
              queryKey: ["session"],
            });
            toast.success("Successfully signed in");
            setIsLoading(false);
            router.navigate({ to: "/dashboard" });
          },
        }
      );
    } catch (error) {
      toast.error("There was an error signing in, please try again.");
    }
  }

  const { data: userData, isLoading: sessionPending } = useQuery({
    queryKey: ["session"],
    queryFn: fetchUserSession,
  });

  return (
    <div className="flex flex-1 justify-center items-center w-full h-full bg-gradient-to-br from-background from-30% to-primary">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className=" text-primary font-bold text-4xl">Boilermeets</h1>
          <p className="text-muted-foreground">
            Connect through conversations, not just photos
          </p>
        </div>
        <Card className="w-lg">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex flex-col">
              <h3 className="text-center font-semibold text-lg">
                Welcome back
              </h3>
              <p className="text-muted-foreground text-center text-xs">
                Sign in to continue your journey
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
              <Controller
                control={form.control}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="Password"
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
                name="password"
              />
              <Button
                size="lg"
                onClick={form.handleSubmit(onSubmit)}
                disabled={sessionPending || isLoading}
                className="flex-row gap-2 items-center"
              >
                Sign In
                {sessionPending ||
                  (isLoading && (
                    <Loader className="text-foreground animate-spin" />
                  ))}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  router.navigate({ to: "/register" });
                }}
                disabled={sessionPending || isLoading}
                className="flex-row gap-2 items-center"
              >
                Register For Account
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  router.navigate({ to: "/reset_password" });
                }}
                disabled={sessionPending || isLoading}
                className="flex-row gap-2 items-center text-gray-500"
              >
                Forgot Password?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
