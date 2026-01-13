import React from 'react';
import { getOrCreateUser } from "@/lib/actions/user.action";
import { getAllUserTags } from "@/lib/actions/user-tag.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import UserTagForm from "@/components/forms/UserTagForm";
import UserTagsList from "@/components/shared/UserTagsList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const UserTagsPage = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const mongoUser = await getOrCreateUser({ userId });
  if (mongoUser.needsUsernameSetup) redirect("/onboarding");

  const isAdminOrOwner = ["admin", "owner"].includes(mongoUser.role);
  if (!isAdminOrOwner) redirect("/staff");

  const tags = await getAllUserTags();

  return (
    <div className="mt-10 px-6 sm:px-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="h1-bold text-dark100_light900">User Tags</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="primary-gradient text-light900_dark100 min-h-[46px] px-4 py-3">
              <Plus className="mr-2 size-5" />
              Create New Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="background-light900_dark300 border-none sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-dark100_light900">Create User Tag</DialogTitle>
              <DialogDescription className="text-dark400_light700">
                Define a name and color for the new tag.
              </DialogDescription>
            </DialogHeader>
            <UserTagForm type="Create" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-10">
        <UserTagsList tags={JSON.parse(JSON.stringify(tags))} />
      </div>
    </div>
  );
};

export default UserTagsPage;
