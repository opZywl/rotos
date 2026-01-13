"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createUserTag, updateUserTag } from "@/lib/actions/user-tag.action";
import { usePathname } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import UserTagBadge from "@/components/shared/UserTagBadge";

interface Props {
  type?: "Create" | "Edit";
  tagData?: {
    _id: string;
    name: string;
    color: string;
  };
  onSuccess?: () => void;
}

const UserTagForm = ({ type = "Create", tagData, onSuccess }: Props) => {
  const [name, setName] = useState(tagData?.name || "");
  const [color, setColor] = useState(tagData?.color || "#3b82f6");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (type === "Edit" && tagData) {
        await updateUserTag({
          tagId: tagData._id,
          name: name.trim(),
          color,
          path: pathname
        });
        toast({ title: "Tag updated successfully" });
      } else {
        await createUserTag({
          name: name.trim(),
          color,
          path: pathname
        });
        toast({ title: "Tag created successfully" });
        if (type === "Create") {
          setName("");
          setColor("#3b82f6");
        }
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({ 
        title: `Error ${type === "Edit" ? "updating" : "creating"} tag`,
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Label htmlFor="tagName" className="text-dark400_light800">Tag Name</Label>
        <Input 
          id="tagName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. VIP, OG, Supporter"
          className="background-light900_dark300 light-border-2 text-dark300_light700 no-focus"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tagColor" className="text-dark400_light800">Tag Color (RGB/Hex)</Label>
        <div className="flex items-center gap-4">
          <Input 
            id="tagColor"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-12 w-24 cursor-pointer border-none bg-transparent p-0"
          />
          <Input 
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#000000"
            className="background-light900_dark300 light-border-2 text-dark300_light700 no-focus flex-1"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label className="text-dark400_light800">Preview</Label>
        <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-light-700 dark:border-dark-400">
          {name ? (
            <UserTagBadge name={name} color={color} />
          ) : (
            <span className="text-xs text-light-500 italic">Enter a name to see preview</span>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="primary-gradient text-light900_dark100 min-h-[46px] w-full"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          type === "Create" ? "Create Tag" : "Update Tag"
        )}
      </Button>
    </form>
  );
};

export default UserTagForm;
