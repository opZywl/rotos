import { getOrCreateUser } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Panel",
  description: "Moderation and administration panel",
};

const StaffPage = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const mongoUser = await getOrCreateUser({ userId });

  if (mongoUser.needsUsernameSetup) redirect("/onboarding");

  const isStaff = ["moderator", "admin", "owner"].includes(mongoUser.role);

  if (!isStaff) redirect("/");

  return (
    <div className="mt-10 px-6 sm:px-12">
      <h1 className="h1-bold text-dark100_light900">Staff Panel</h1>
      
      <div className="mt-10 flex flex-col gap-6">
        <div className="background-light900_dark300 light-border-2 rounded-xl border p-8 shadow-sm">
          <h2 className="h2-bold text-dark200_light900 mb-4">Welcome, Staff Member</h2>
          <p className="paragraph-regular text-dark400_light700">
            This is the restricted area for the Rotōs moderation team. 
            From here, you can manage content and maintain the community guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="background-light900_dark300 light-border-2 rounded-xl border p-6">
            <h3 className="h3-bold text-dark200_light900 mb-2">Content Moderation</h3>
            <p className="body-regular text-dark400_light700 mb-4">
              You have global permissions to edit and delete questions or answers that violate our terms.
            </p>
            <div className="text-sm font-medium text-blue-500">Active Status: MODERATOR</div>
          </div>

          <div className="background-light900_dark300 light-border-2 rounded-xl border p-6">
            <h3 className="h3-bold text-dark200_light900 mb-2">Pinning System</h3>
            <p className="body-regular text-dark400_light700 mb-4">
              Feature important discussions by pinning them to the top of the feed.
            </p>
            <div className="text-sm font-medium text-green-500">Active Status: ENABLED</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
