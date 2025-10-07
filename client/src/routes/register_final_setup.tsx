import { authClient, fetchUserSession } from "@/lib/auth-client";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query";

const basicInfoSchema = z.object({
  major: z.string().min(1, { message: "Major is required" }),
  year: z.string().min(1, { message: "School year is required" }),
  birthdate: z.date().min(new Date('1900-01-01T00:00:00Z'), { message: "Birthdate is required" }).max(new Date()),
  bio: z.string()
})

type FormValues = z.infer<typeof basicInfoSchema>;

export const Route = createFileRoute("/register_final_setup")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
        major: "",
        year: "",
        bio: "",
        birthdate: new Date('1899-01-01T00:00:00Z')
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit({ major, year, bio, birthdate }: FormValues) {
    try {
      await authClient.updateUser(
        {
          major: major,
          year: year,
          birthdate: birthdate,
          bio: bio,
        },
        {
          onError: ({ error }) => {
            toast.error(
              error.message || "User Update Failed"
            );
            toast.error(error.message)
            setIsLoading(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: async () => {
            await queryClient.invalidateQueries(["session"]);
            await queryClient.refetchQueries(['session']);
            toast.success("Welcome to BoilerMeets!");
            setIsLoading(false);
            router.navigate( {to: "/dashboard"} )
          },
        }
      )
    } catch (error) {
      toast.error("There was an error, please try again.");
    }
  }

  const { isPending } = authClient.useSession();

  const [open, setOpen] = useState(false);

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
              <h3 className="text-center font-semibold text-xl">
                Finish Your Account
              </h3>
              <p className="text-muted-foreground text-center text-xs">
                Write a little about yourself
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
                    <Label>Major</Label>
                    <Input
                      placeholder="What Is Your Major at Purdue?"
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
                name="major"
              />
              <Controller
                control={form.control}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label>Year</Label>
                    <Select onValueChange={onChange}>
                      <SelectTrigger className="w-1/3 justify-between font-normal" onBlur={onBlur} onChange={onChange}>
                        <SelectValue placeholder="Student Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Freshman">Freshman</SelectItem>
                        <SelectItem value="Sophomore">Sophomore</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                    {error && (
                      <p className="text-destructive">{error.message}</p>
                    )}
                  </div>
                )}
                name="year"
              />
              <Controller
                control={form.control}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="date">Date of Birth</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild onBlur={onBlur}>
                        <Button
                          variant="outline"
                          id="date"
                          className="w-1/3 justify-between font-normal"
                        >
                          {value && value > new Date("1900-01-01") ? value.toLocaleDateString() : "Select date"}
                          <ChevronDownIcon className="size-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={value}
                          onSelect={onChange}
                          captionLayout="dropdown"
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    {error && (
                      <p className="text-destructive">{error.message}</p>
                    )}
                  </div>
                )}
                name="birthdate"
              />
              <Controller
                control={form.control}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label>Bio</Label>
                    <Label className="text-xs">Give a brief explanation about yourself</Label>
                    <Input
                      placeholder="Bio"
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
                name="bio"
              />
              <Button
                size="lg"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isPending || isLoading}
                className="flex-row gap-2 items-center"
              >
                <p className="font-bold">Finish Account Creation!</p>
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