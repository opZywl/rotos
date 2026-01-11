import LeftSideBar from "@/components/shared/LeftSideBar";
import RightSideBar from "@/components/shared/RightSideBar";
import Navbar from "@/components/shared/navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import { auth } from "@clerk/nextjs";
import { getOrCreateUser } from "@/lib/actions/user.action";
import BannedOverlay from "@/components/shared/BannedOverlay";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();
  let mongoUser;

  if (userId) {
    const userDoc = await getOrCreateUser({ userId });
    mongoUser = JSON.parse(JSON.stringify(userDoc));
  }

  const isBanned = mongoUser?.isBanned && (!mongoUser?.banExpiration || new Date(mongoUser.banExpiration) > new Date());

  return (
    <main className="background-light850_dark100 relative mx-auto max-w-[86rem] font-spaceGrotesk">
      {isBanned && (
        <BannedOverlay 
          reason={mongoUser?.banReason} 
          expiration={mongoUser?.banExpiration} 
        />
      )}
      <div className={isBanned ? "pointer-events-none blur-[10px] select-none opacity-50 transition-all duration-500" : ""}>
        <Navbar />
        <div className="flex">
          <LeftSideBar />

          <section className="light-border flex min-h-screen  flex-1 flex-col border-r pb-6 pt-16 max-md:pb-14 ">
            <div className="w-full max-w-3xl font-spaceGrotesk">{children}</div>
          </section>

          <RightSideBar />
        </div>
        <Toaster />
      </div>
    </main>
  );
};

export default Layout;
