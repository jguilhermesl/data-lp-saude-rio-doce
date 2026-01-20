'use client';
import { ReactNode } from 'react';
import { THead } from './t-head';
import { TBody } from './t-body';
import { TBodyRow } from './t-body-row';
import { useInnerHeight } from '@/hooks/useInnerHeight';
import { TBodyCol } from './t-body-col';

interface ITableProps {
  headers: string[];
  showColumnSortButton?: string[];
  onSortItems?: (header: string) => void;
  children?: ReactNode;
  isSelectable?: boolean;
  tHeadClassName?: string;
}

export const Table = ({
  headers,
  showColumnSortButton,
  onSortItems,
  children,
  isSelectable = false,
  tHeadClassName,
}: ITableProps) => {
  const { height } = useInnerHeight();

  const customHeaders = isSelectable ? ['', ...headers] : headers;

  return (
    <div className="flex m-auto relative w-full rounded-lg shadow-2xl overflow-hidden">
      <div
        style={{
          maxHeight: height - 150,
        }}
        className="w-full overflow-x-auto"
      >
        <table className="table border-collapse w-full rounded-lg bg-white">
          <THead
            headers={customHeaders}
            showColumnSortButton={showColumnSortButton}
            onSortItems={onSortItems}
            className={tHeadClassName}
          />
          <TBody>{children}</TBody>
        </table>
      </div>
    </div>
  );
};

Table.Row = TBodyRow;
Table.Col = TBodyCol;
