import AnswersTab from "@/components/shared/AnswersTab";
import ProfileLink from "@/components/shared/ProfileLink";
import QuestionTab from "@/components/shared/QuestionTab";
import Stats from "@/components/shared/Stats";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserInfo, getOrCreateUser } from "@/lib/actions/user.action";
import { getJoinedDate } from "@/lib/utils";
import { URLProps } from "@/types";
import { auth, SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoleManagement from "@/components/shared/RoleManagement";
import UserAdminActions from "@/components/shared/UserAdminActions";

export const metadata: Metadata = {
  title: "Profile",
  description: "Profile page",
};

const ProfileDetails = async ({ params, searchParams }: URLProps) => {
  const { userId: clerkId } = auth();
  const loggedInUserDoc = clerkId ? await getOrCreateUser({ userId: clerkId }) : null;
  const loggedInUser = loggedInUserDoc ? JSON.parse(JSON.stringify(loggedInUserDoc)) : null;
  
  const result = await getUserInfo({
    userId: params.id,
  });

  if (!result) notFound();

  const { user: userDoc, totalQuestions, totalAnswers, reputation, badgeCounts } = result;
  const user = JSON.parse(JSON.stringify(userDoc));

  const isAuthorizedToManage = loggedInUser?.role === 'admin';

  return (
    <div className="w-full">
      <div className="text-dark100_light900 mt-1 flex w-full flex-col px-6 pb-2 pt-4 sm:px-12">
        <h1 className="text-lg ">{user.name}</h1>
        <p className="text-variant">Stats - {reputation}</p>
      </div>
      <div className="flex-center relative h-[200px] w-full bg-dark-4/10 dark:bg-dark-3">
        <div className="flex min-w-11 items-center gap-1 sm:min-w-32">
          <Image
            src="/site-logo.svg"
            width={40}
            height={40}
            alt="Rotōs"
            className="invert-0 dark:invert max-sm:size-16 sm:size-20 md:size-24"
          />
          <p className=" font-spaceGrotesk font-bold text-dark-100 dark:text-light-900 max-sm:text-4xl sm:text-5xl md:text-6xl">
            Rotōs
          </p>
        </div>
        <div className="absolute bottom-[-30%] left-5">
          {clerkId === params.id ? (
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    // sets height and width for user profile button
                    avatarBox: "size-32 max-sm:size-28",
                  },
                  variables: {
                    colorPrimary: "#ff7000",
                  },
                }}
              />
            </SignedIn>
          ) : (
            <div className="size-[140px] overflow-hidden rounded-full">
              <Image
                src={user?.picture}
                alt="profile"
                width={140}
                height={140}
                className="size-full object-cover"
              />
            </div>
          )}
        </div>
        <SignedIn>
          {clerkId === user.clerkId && (
            <Link
              href="/profile/edit"
              className="absolute bottom-[-28%] right-6 "
            >
              <Button className="paragraph-medium light-border-2 text-dark300_light900 min-h-[46px]  rounded-full border px-6 py-3">
                Edit profile
              </Button>
            </Link>
          )}
        </SignedIn>
      </div>
      <div className="flex flex-col-reverse items-start justify-between px-6 pt-16 sm:flex-row sm:px-10">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{user.name}</h2>
            <div className="flex items-center gap-2">
              <p className="paragraph-regular text-dark200_light800">
                @{user.username}
              </p>
              <div className={`flex items-center justify-center rounded-lg border px-3 py-1 backdrop-blur-sm ${
                user.isBanned
                  ? 'border-yellow-500/30 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                  : user.role === 'admin' 
                  ? 'border-red-500/30 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : user.role === 'moderator' 
                  ? 'border-green-500/30 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                  : 'border-slate-500/30 bg-slate-500/10 shadow-[0_0_15px_rgba(203,213,225,0.2)]'
              }`}>
                <span className={`subtle-medium uppercase tracking-wider ${
                  user.isBanned
                    ? 'text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]'
                    : user.role === 'admin' 
                    ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' 
                    : user.role === 'moderator' 
                    ? 'text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]' 
                    : 'text-slate-300 drop-shadow-[0_0_5px_rgba(203,213,225,0.8)]'
                }`}>
                  {user.isBanned ? 'BANNED' : user.role}
                </span>
              </div>
            </div>
            {isAuthorizedToManage && user.clerkId !== clerkId && (
              <>
                <RoleManagement 
                  userId={user._id.toString()} 
                  currentRole={user.role} 
                />
                <UserAdminActions 
                  userId={user._id.toString()} 
                  clerkId={user.clerkId}
                  isBanned={user.isBanned || false}
                  banReason={user.banReason}
                  banExpiration={user.banExpiration}
                />
              </>
            )}
            <div className="mt-5 flex w-full flex-col items-start justify-start gap-3">
              <ProfileLink
                imgUrl="/assets/icons/calendar.svg"
                title={getJoinedDate(user.joinedAt)}
              />
              <div className="flex w-full flex-wrap gap-5">
                {user.portfolioWebsite && (
                  <ProfileLink
                    imgUrl="/assets/icons/link.svg"
                    href={user.portfolioWebsite}
                    title="Portfolio"
                  />
                )}
                {user.location && (
                  <ProfileLink
                    imgUrl="/assets/icons/location.svg"
                    title={user.location}
                  />
                )}
              </div>
            </div>
            {user.bio && (
              <p className="paragraph-regular text-dark400_light800 mt-6">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="light-border-2 text-dark100_light900 mx-auto mt-2 flex w-[90%] flex-col items-start justify-center border-t px-4 pt-5  ">
        <p className="">Total questions: {totalQuestions}</p>
        <p className="">Total answers: {totalAnswers}</p>
      </div>
      {/* User Stats */}
      <Stats badges={badgeCounts} />
      <div className="mt-10 flex gap-10 px-3 sm:px-10">
        <Tabs defaultValue="top-posts" className="flex-1">
          <TabsList className="background-light850_dark100 light-border-2 min-h-[42px] border py-2 mx-2">
            <TabsTrigger className="tab " value="top-posts">
              Top Posts
            </TabsTrigger>
            <TabsTrigger className="tab" value="answers">
              Answers
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="top-posts"
            className="mt-5 flex w-full flex-col gap-6"
          >
            <QuestionTab
              searchParams={searchParams}
              userId={user._id}
              clerkId={clerkId}
            />
          </TabsContent>
          <TabsContent
            value="answers"
            className="mt-5 flex w-full flex-col gap-6"
          >
            <AnswersTab
              searchParams={searchParams}
              userId={user._id}
              clerkId={clerkId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default ProfileDetails;
