import UsernameSetup from "@/components/forms/UsernameSetup";
import { getOrCreateUser } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Complete your profile",
  description: "Set up your username to get started",
};

const OnboardingPage = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const mongoUser = await getOrCreateUser({ userId });

  // If user doesn't need setup, redirect to home
  if (!mongoUser.needsUsernameSetup) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2">
            <Image
              src="/site-logo.svg"
              width={40}
              height={40}
              alt="Rotōs"
              className="invert-0 dark:invert"
            />
            <h1 className="font-spaceGrotesk text-3xl font-bold text-dark-100 dark:text-light-900">
              Rotōs
            </h1>
          </div>
          <h2 className="h2-bold text-dark100_light900 mb-2">
            Welcome! Let&apos;s set up your profile
          </h2>
          <p className="text-dark400_light800">
            Choose a unique username to identify yourself in the community
          </p>
        </div>

        <div className="card-wrapper light-border-2 rounded-lg border p-6">
          <UsernameSetup
            clerkId={userId}
            currentUsername={mongoUser.username}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
