"use client";

import React, { useState } from 'react';
import UserTagBadge from './UserTagBadge';
import { Button } from '../ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserTagForm from '../forms/UserTagForm';
import { deleteUserTag } from '@/lib/actions/user-tag.action';
import { usePathname } from 'next/navigation';
import { toast } from '../ui/use-toast';

interface Tag {
  _id: string;
  name: string;
  color: string;
}

interface Props {
  tags: Tag[];
}

const UserTagsList = ({ tags }: Props) => {
  const pathname = usePathname();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (tagId: string) => {
    setIsDeleting(tagId);
    try {
      await deleteUserTag({ tagId, path: pathname });
      toast({ title: "Tag deleted successfully" });
    } catch (error) {
      toast({ 
        title: "Error deleting tag", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (tags.length === 0) {
    return (
      <div className="flex-center min-h-[200px] flex-col rounded-xl border border-dashed border-light-700 p-8 text-center dark:border-dark-400">
        <p className="paragraph-regular text-dark400_light700">No User Tags created yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => (
        <div 
          key={tag._id}
          className="background-light900_dark300 light-border-2 flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <UserTagBadge name={tag.name} color={tag.color} />
            
            <div className="flex items-center gap-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="size-8 text-dark400_light700 hover:bg-light-800 dark:hover:bg-dark-400">
                    <Edit className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="background-light900_dark300 border-none sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-dark100_light900">Edit User Tag</DialogTitle>
                    <DialogDescription className="text-dark400_light700">
                      Change the name or color of the tag.
                    </DialogDescription>
                  </DialogHeader>
                  <UserTagForm type="Edit" tagData={tag} />
                </DialogContent>
              </Dialog>

              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => handleDelete(tag._id)}
                disabled={isDeleting === tag._id}
                className="size-8 text-red-500 hover:bg-red-500/10 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-light-500 uppercase tracking-widest font-bold">
            <span>Hex: {tag.color}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserTagsList;
