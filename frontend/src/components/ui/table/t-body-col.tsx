import { ReactNode, memo } from 'react';
import clsx from 'clsx';

interface ITBodyColProps {
  children?: ReactNode;
  description?: string;
  quantity?: number;
  className?: string;
}

const TBodyColComponent = ({
  children,
  description,
  quantity,
  className,
}: ITBodyColProps) => {
  return (
    <td className={clsx('px-6 py-4 text-sm font-poppins text-gray-700', className)}>
      <div className="font-medium text-gray-900">
        {children}
      </div>
      {description && (
        <p className="text-gray-600 text-xs mt-1 font-poppins">
          {description}
        </p>
      )}
      {quantity !== undefined && (
        <p className="text-gray-600 ml-1 text-xs font-poppins font-semibold">
          <strong>({quantity})</strong>
        </p>
      )}
    </td>
  );
};

TBodyColComponent.displayName = 'TBodyCol';

export const TBodyCol = memo(TBodyColComponent);
