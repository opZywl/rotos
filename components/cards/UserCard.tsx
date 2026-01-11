"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import UserDisplay from "../shared/UserDisplay";

interface Props {
  user: {
    _id: string;
    clerkId: string;
    name: string;
    username: string;
    picture: string;
    role: string;
  };
}

const UserCard = ({ user }: Props) => {
  const { userId } = useAuth();

  const cardContent = (
    <div className="background-light850_dark100 light-border-2 flex min-h-[260px] w-full flex-col items-center justify-center rounded-sm border hover:bg-zinc-200/10 dark:hover:bg-zinc-900/60 cursor-pointer">
      <div className="mb-3 size-[100px] overflow-hidden rounded-full">
        <Image
          src={user.picture}
          alt="user pfp"
          className="size-full object-cover"
          width={100}
          height={100}
        />
      </div>
      <div className="mt-4 text-center px-4">
        <UserDisplay 
          name={user.name} 
          role={user.role} 
          className="h3-bold text-dark200_light900 line-clamp-1"
        />
        <p className="body-regular text-variant mt-1">@{user.username}</p>
      </div>
    </div>
  );

  if (!userId) {
    return (
      <SignInButton mode="modal">
        {cardContent}
      </SignInButton>
    );
  }

  return (
    <Link href={`/profile/${user.clerkId}`}>
      {cardContent}
    </Link>
  );
};

export default UserCard;
