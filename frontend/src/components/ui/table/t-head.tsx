import clsx from 'clsx';
import { Paragraph } from '../paragraph';

interface ITableHeadProps {
  className?: string;
  headers?: string[];
  showColumnSortButton?: string[];
  onSortItems?: (header: string) => void;
}

export const THead = ({
  className,
  headers,
  showColumnSortButton,
  onSortItems,
}: ITableHeadProps) => {
  return (
    <thead className="table-header-group shadow-inset-bottom rounded-lg w-full flex-1">
      <tr
        className={clsx(
          'text-left table-row align-middle sticky top-0 shadow-lg rounded-t-xl w-full flex-1 right-0',
          'bg-emerald-600 ',
          'border-b-4 border-emerald-700',
          className
        )}
      >
        {headers?.map((header, i) => (
          <th 
            key={i} 
            className="px-6 py-5 font-poppins font-bold text-base table-cell truncate first:rounded-tl-xl last:rounded-tr-xl"
          >
            <span className="flex items-center justify-between">
              <Paragraph className="flex text-white font-poppins font-semibold tracking-wide drop-shadow-md">
                {header}
              </Paragraph>

              {showColumnSortButton?.includes(header) && onSortItems && (
                <button className="text-white hover:text-emerald-100 transition-colors duration-200">
                  sort
                </button>
              )}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
};
