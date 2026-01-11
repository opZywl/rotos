"use client";

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setUserRole } from '@/lib/actions/user.action';
import { usePathname } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface Props {
  userId: string;
  currentRole: string;
}

const RoleManagement = ({ userId, currentRole }: Props) => {
  const pathname = usePathname();

  const handleRoleChange = async (newRole: string) => {
    try {
      await setUserRole({
        userId,
        role: newRole,
        path: pathname,
      });

      toast({
        title: `Role updated to ${newRole}`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error updating role',
        description: 'You do not have permission or a server error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      <p className="body-medium text-dark400_light700">Change Role:</p>
      <Select onValueChange={handleRoleChange} defaultValue={currentRole}>
        <SelectTrigger className="w-[140px] border-none bg-light-800 dark:bg-dark-300 text-dark100_light900">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent className="bg-light-900 dark:bg-dark-300 text-dark100_light900 border-none">
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="moderator">Moderator</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleManagement;
