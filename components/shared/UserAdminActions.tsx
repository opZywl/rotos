"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { deleteUser, toggleBanUser } from '@/lib/actions/user.action';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  userId: string;
  clerkId: string;
  isBanned: boolean;
  banReason?: string;
  banExpiration?: Date | string;
}

const UserAdminActions = ({ userId, clerkId, isBanned, banReason: initialReason, banExpiration: initialExpiration }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [banReason, setBanReason] = useState(initialReason || "");
  const [banDuration, setBanDuration] = useState("0"); 

  // Calculate default duration based on initial expiration if editing
  React.useEffect(() => {
    if (initialExpiration) {
      const hours = Math.round((new Date(initialExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60));
      if (hours > 0) {
        // Find closest match in select options or just use the hours
        setBanDuration(hours.toString());
      } else {
        setBanDuration("0");
      }
    } else {
      setBanDuration("0");
    }
    setBanReason(initialReason || "");
  }, [initialExpiration, initialReason, isBanModalOpen]);

  const handleBanUser = async () => {
    try {
      let expirationDate: string | null = null;
      
      if (banDuration !== "0") {
        const date = new Date();
        date.setHours(date.getHours() + parseInt(banDuration));
        expirationDate = date.toISOString();
      }

      const result = await toggleBanUser({
        userId,
        path: pathname,
        banReason: banReason.trim() || "Violation of Community Guidelines",
        banExpiration: expirationDate || undefined,
        isBanned: true,
      });

      if (result.success) {
        toast({
          title: isBanned ? `Ban updated successfully` : `User banned successfully`,
          variant: 'default',
        });
        setIsBanModalOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: `Error processing ban`,
        variant: 'destructive',
      });
    }
  };

  const handleUnbanUser = async () => {
    try {
      await toggleBanUser({
        userId,
        path: pathname,
      });

      toast({
        title: `User unbanned successfully`,
        variant: 'default',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: `Error unbanning user`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser({
        clerkId,
      });

      toast({
        title: "User deleted successfully",
        variant: 'default',
      });
      
      setIsDeleteModalOpen(false);
      router.push('/community');
    } catch (error) {
      toast({
        title: "Error deleting user",
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mt-5 flex flex-wrap gap-4">
      {isBanned && (
        <Button 
          onClick={handleUnbanUser}
          className="paragraph-medium min-h-[46px] min-w-[150px] rounded-lg px-4 py-3 bg-green-500 text-white hover:bg-green-600"
        >
          Unban User
        </Button>
      )}

      <Dialog open={isBanModalOpen} onOpenChange={setIsBanModalOpen}>
        <DialogTrigger asChild>
          <Button className={`paragraph-medium min-h-[46px] min-w-[150px] rounded-lg px-4 py-3 text-white ${isBanned ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
            {isBanned ? 'Edit Ban' : 'Ban User'}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-light-900 dark:bg-dark-300 text-dark100_light900 border-none">
          <DialogHeader>
            <DialogTitle>{isBanned ? 'Edit Ban' : 'Ban User'}</DialogTitle>
            <DialogDescription className="text-light-500">
              Specify the reason and duration for this ban.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Ban</Label>
              <Input 
                id="reason" 
                placeholder="e.g. Violation of Community Guidelines" 
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="bg-light-800 dark:bg-dark-400 border-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Select onValueChange={setBanDuration} value={banDuration}>
                <SelectTrigger className="bg-light-800 dark:bg-dark-400 border-none">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-light-900 dark:bg-dark-300 text-dark100_light900 border-none">
                  <SelectItem value="0">Permanent</SelectItem>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="24">1 Day</SelectItem>
                  <SelectItem value="72">3 Days</SelectItem>
                  <SelectItem value="168">1 Week</SelectItem>
                  <SelectItem value="720">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBanUser} className="bg-red-500 text-white hover:bg-red-600">
              {isBanned ? 'Update Ban' : 'Confirm Ban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogTrigger asChild>
          <Button 
            className="paragraph-medium bg-red-500 text-white min-h-[46px] min-w-[150px] rounded-lg px-4 py-3 hover:bg-red-600"
          >
            Delete Profile
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-light-900 dark:bg-dark-300 text-dark100_light900 border-none">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Profile</DialogTitle>
            <DialogDescription className="text-light-500">
              Are you sure you want to delete this user? This action is permanent and will remove all their questions, answers, and data from the forum.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button 
              onClick={() => setIsDeleteModalOpen(false)} 
              className="bg-light-800 dark:bg-dark-400 text-dark100_light900 hover:bg-light-700 dark:hover:bg-dark-500"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteUser} 
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAdminActions;
