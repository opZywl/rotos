"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { assignUserTags } from "@/lib/actions/user-tag.action";
import { usePathname } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Settings2, Check } from "lucide-react";

interface Tag {
  _id: string;
  name: string;
  color: string;
}

interface Props {
  userId: string;
  userTagIds: string[];
  allTags: Tag[];
}

const ManageUserTags = ({ userId, userTagIds, allTags }: Props) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(userTagIds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await assignUserTags({
        userId,
        tagIds: selectedTags,
        path: pathname
      });
      toast({ title: "User tags updated successfully" });
      setIsOpen(false);
    } catch (error) {
      toast({ 
        title: "Error updating user tags", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-dark400_light700 hover:bg-light-800 dark:hover:bg-dark-300">
            <Settings2 className="size-4" />
            <span className="body-medium">Manage User Tags</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="background-light900_dark300 border-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-dark100_light900">Manage User Tags</DialogTitle>
            <DialogDescription className="text-dark400_light700">
              Select tags to assign to this user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {allTags.length === 0 ? (
              <p className="text-sm text-light-500 italic py-4 text-center">No tags available. Create them in Staff Panel.</p>
            ) : (
              allTags.map((tag) => (
                <div 
                  key={tag._id}
                  onClick={() => toggleTag(tag._id)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
                    selectedTags.includes(tag._id)
                      ? "border-blue-500/50 bg-blue-500/5"
                      : "border-light-700 bg-transparent dark:border-dark-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-3" 
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="body-medium text-dark200_light900">{tag.name}</span>
                  </div>
                  {selectedTags.includes(tag._id) && (
                    <Check className="size-4 text-blue-500" />
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="primary-gradient text-light900_dark100 min-h-[46px] w-full"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageUserTags;
