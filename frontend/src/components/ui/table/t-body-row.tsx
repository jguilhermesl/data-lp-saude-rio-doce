/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import clsx from 'clsx';
import { ReactNode, memo } from 'react';

interface ITBodyRowProps {
  children?: ReactNode;
  isEven?: boolean;
  onSelectedRow?: {
    rowId: string;
    onChecked?: (rowId: string) => void;
  };
  onClick?: () => void;
  isPending?: boolean;
  isCompleted?: boolean;
}

const TBodyRowComponent = ({
  children,
  isEven,
  onSelectedRow,
  isPending,
  onClick,
  isCompleted,
}: ITBodyRowProps) => {
  return (
    <tr
      className={clsx(
        'w-full transition-all duration-200 hover:bg-emerald-50 hover:shadow-md border-b border-gray-100',
        {
          'bg-white': !isEven && !isPending,
          'bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-cyan-50/50': isEven && !isPending,
          'bg-orange-100': isPending,
          'opacity-50': isCompleted,
        }
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

TBodyRowComponent.displayName = 'TBodyRow';

export const TBodyRow = memo(TBodyRowComponent);
