import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface IHeadingProps {
  children: ReactNode;
  className?: string;
}

export const Heading = ({ children, className }: IHeadingProps) => {
  return <h1 className={cn("text-xl font-bold", className)}>{children}</h1>;
};
