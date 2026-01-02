import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface IParagraphProps {
  children: ReactNode;
  className?: string;
}

export const Paragraph = ({ children, className }: IParagraphProps) => {
  return <h1 className={cn("text-sm", className)}>{children}</h1>;
};
