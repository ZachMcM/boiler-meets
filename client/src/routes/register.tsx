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

const registrationSchema = z
  .object({
    email: z.string().regex(/^[a-zA-Z0-9._%+-]+@purdue\.edu$/, {
      message: "Email must be a valid Purdue email",
    }),
    name: z.string().min(1, { message: "Your name is required" }),
    username: z.string().min(1, { message: "Username is required" }),
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

type FormValues = z.infer<typeof registrationSchema>;

export const Route = createFileRoute("/register")({
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
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit({ email, name, username, password }: FormValues) {
    try {
      await authClient.signUp.email(
        {
          name: name,
          username: username,
          email: email,
          password: password,
          major: null,
          year: null,
          bio: null,
          birthdate: null,
          callbackURL: "/login",
        },
        {
          onError: ({ error }) => {
            if (error.status === 422) {
              toast.error("Email already taken, please use another");
            } else {
              toast.error(error.message || "Registration Failed");
            }
            setIsLoading(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            toast.success("Email sent. Please verify your account.");
            setIsLoading(false);
            router.navigate({ to: "/register_waiting" });
          },
        }
      );
    } catch (error) {
      toast.error("There was an error signing in, please try again.");
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
                Register For Account
              </h3>
              <p className="text-muted-foreground text-center text-xs">
                Create an account to meet your fellow Boilermakers
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
              <Controller
                control={form.control}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Name"
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
                name="name"
              />
              <Controller
                control={form.control}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label>Username</Label>
                    <Input
                      placeholder="Username"
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
                name="username"
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
                    <Label className="text-xs">
                      Must be 8 characters, and contain at least one letter and
                      number
                    </Label>
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
              <Controller
                control={form.control}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
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
                <p className="font-bold">Sign Up</p>
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
