import { getOrCreateUser } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata } from "next";

import Link from "next/link";
import { ChevronRight, Tag } from "lucide-react";

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
  const isAdminOrOwner = ["admin", "owner"].includes(mongoUser.role);

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

        {isAdminOrOwner && (
          <div className="flex flex-col gap-4">
            <h2 className="h2-bold text-dark200_light900">Administration</h2>
            <Link 
              href="/staff/user-tags"
              className="background-light900_dark300 light-border-2 flex items-center justify-between rounded-xl border p-6 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Tag className="size-6" />
                </div>
                <div>
                  <h3 className="h3-bold text-dark200_light900">User Tags</h3>
                  <p className="body-regular text-dark400_light700">
                    Create and manage special tags for users.
                  </p>
                </div>
              </div>
              <ChevronRight className="size-6 text-dark400_light700 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        <h2 className="h2-bold text-dark200_light900 mt-4">Moderation Tools</h2>
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
