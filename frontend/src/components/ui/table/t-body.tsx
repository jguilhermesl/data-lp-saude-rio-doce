import { ReactNode } from 'react';

interface ITBodyProps {
  children?: ReactNode;
}

export const TBody = ({ children }: ITBodyProps) => {
  return <tbody className="table-row-group truncate ">{children}</tbody>;
};
