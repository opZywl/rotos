"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupUsername, checkUsernameAvailable } from "@/lib/actions/user.action";
import { toast } from "../ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Loader, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const UsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

interface UsernameSetupProps {
  clerkId: string;
  currentUsername: string;
}

const UsernameSetup = ({ clerkId, currentUsername }: UsernameSetupProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof UsernameSchema>>({
    resolver: zodResolver(UsernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const username = form.watch("username");
  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    const checkAvailability = async () => {
      if (debouncedUsername && debouncedUsername.length >= 3) {
        setIsChecking(true);
        const result = await checkUsernameAvailable(debouncedUsername);
        setIsAvailable(result.available);
        setIsChecking(false);
      } else {
        setIsAvailable(null);
      }
    };

    checkAvailability();
  }, [debouncedUsername]);

  async function onSubmit(values: z.infer<typeof UsernameSchema>) {
    setIsSubmitting(true);
    try {
      const result = await setupUsername({
        clerkId,
        username: values.username,
      });

      if (result.error) {
        toast({
          icon: <X className="text-red-500" />,
          title: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          icon: <Check className="text-green-500" />,
          title: "Username set successfully!",
        });
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast({
        icon: <X className="text-red-500" />,
        title: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-9 flex w-full flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Choose your username <span className="text-red-600">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter username"
                    className="no-focus paragraph-regular light-border-2 background-light900_dark300 text-dark100_light900 min-h-[56px] border pr-10"
                    {...field}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking && (
                      <Loader className="size-5 animate-spin text-gray-400" />
                    )}
                    {!isChecking && isAvailable === true && (
                      <Check className="size-5 text-green-500" />
                    )}
                    {!isChecking && isAvailable === false && (
                      <X className="size-5 text-red-500" />
                    )}
                  </div>
                </div>
              </FormControl>
              {!isChecking && isAvailable === false && (
                <p className="text-sm text-red-500">Username is already taken</p>
              )}
              {!isChecking && isAvailable === true && (
                <p className="text-sm text-green-500">Username is available!</p>
              )}
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <p className="text-dark400_light800 text-sm">
          Your username will be visible to other users and used in your profile URL.
        </p>

        <div className="mt-4 flex justify-end">
          <Button
            disabled={isSubmitting || !isAvailable}
            type="submit"
            className="primary-gradient text-light900_dark100 w-fit"
          >
            {isSubmitting ? (
              <>
                <Loader className="text-light900_dark100 my-2 size-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UsernameSetup;
