'use client';

import { togglePinQuestion } from "@/lib/actions/question.action";
import { usePathname } from "next/navigation";
import { toast } from "../ui/use-toast";
import { Pin, PinOff } from "lucide-react";
import { useState } from "react";

interface Props {
  questionId: string;
  isPinned: boolean;
}

const QuestionPinAction = ({ questionId, isPinned }: Props) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const handlePin = async () => {
    setLoading(true);
    try {
      await togglePinQuestion({
        questionId: JSON.parse(questionId),
        path: pathname,
      });

      toast({
        title: isPinned ? "Question Unpinned" : "Question Pinned",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error pinning question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={handlePin}
      className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 transition-all ${
        isPinned 
          ? "bg-blue-500/10 border-blue-500/30 text-blue-500" 
          : "bg-light-800 dark:bg-dark-300 border-none text-dark400_light700 hover:bg-light-700 dark:hover:bg-dark-400"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isPinned ? (
        <PinOff className="size-4" />
      ) : (
        <Pin className="size-4" />
      )}
      <span className="subtle-medium uppercase tracking-wider">
        {isPinned ? "Unpin" : "Pin"}
      </span>
    </div>
  );
};

export default QuestionPinAction;