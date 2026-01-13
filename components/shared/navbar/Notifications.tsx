"use client";

import React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Bell } from "lucide-react";
import { markNotificationAsRead } from "@/lib/actions/notification.action";
import { usePathname, useRouter } from "next/navigation";
import { getTimestamp } from "@/lib/utils";

interface Props {
  notifications: any[];
  unreadCount: number;
}

const Notifications = ({ notifications, unreadCount }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleNotificationClick = async (id: string, link?: string) => {
    await markNotificationAsRead({ notificationId: id, path: pathname });
    if (link) {
      router.push(link);
    }
  };

  return (
    <Menubar className="relative border-none bg-transparent shadow-none">
      <MenubarMenu>
        <MenubarTrigger className="relative cursor-pointer focus:bg-transparent data-[state=open]:bg-transparent">
          <Bell className="text-dark-100 dark:text-light-900" size={24} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </MenubarTrigger>
        <MenubarContent className="background-light850_dark100 light-border-2 absolute -right-12 mt-3 min-w-[300px] rounded border py-2 max-sm:min-w-[250px]">
          <h3 className="text-dark100_light900 px-4 py-2 font-bold">Notifications</h3>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <MenubarItem
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification._id, notification.link)}
                  className={`flex cursor-pointer flex-col items-start gap-1 px-4 py-3 focus:bg-zinc-200/40 dark:focus:bg-dark-4 ${
                    !notification.isRead ? "bg-primary-500/5" : ""
                  }`}
                >
                  <p className={`${!notification.isRead ? "font-semibold" : ""} text-dark100_light900 text-sm`}>
                    {notification.message}
                  </p>
                  <span className="text-dark400_light500 text-xs">
                    {getTimestamp(notification.createdAt)}
                  </span>
                </MenubarItem>
              ))
            ) : (
              <p className="text-dark100_light900 px-4 py-4 text-sm text-center">No notifications</p>
            )}
          </div>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default Notifications;
