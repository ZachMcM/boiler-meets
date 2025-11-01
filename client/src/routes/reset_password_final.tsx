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

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Za-z]/, {
        message: "Password must contain at least one letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Password and Confirmed Password must match" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Password and Confirmed Password must match",
        input: data.confirmPassword,
      });
    }
  });

type FormValues = z.infer<typeof resetSchema>;

export const Route = createFileRoute('/reset_password_final')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  
  async function onSubmit({password}: FormValues) {
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        throw new Error("No token");
      }
      await authClient.resetPassword({
        newPassword: password,
        token
      },
        {
          onError: ({ error }) => {
            toast.error(error.message || "Password Reset Failed");
            setIsLoading(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: async () => {
          //   try {await authClient.updateUser({
          //     lastPasswordReset: new Date()
          //   })
          //   console.log(Date())
          // } catch {
          //     console.log("ERROR", Date())
          //   }
            toast.success("Successfully Reset Password, log in when ready!");
            setIsLoading(false);
            router.navigate({ to: "/login" });
          },
        }
      );
    } catch (error) {
      toast.error("There was an error resetting your password, please try again.");
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
                Reset Your Password
              </h3>
              <p className="text-muted-foreground text-center text-xs">
                Rejoin your fellow Boilermakers
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
                    <Label>New Password</Label>
                    <Label className="text-xs">
                      Must be 8 characters, and contain at least one letter and
                      number
                    </Label>
                    <Input
                      type="password"
                      placeholder="New Password"
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
              <Controller
                control={form.control}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
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
                name="confirmPassword"
              />
              <Button
                size="lg"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isPending || isLoading}
                className="flex-row gap-2 items-center"
              >
                <p className="font-bold">Reset Password!</p>
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
