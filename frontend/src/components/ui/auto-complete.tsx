/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, useState, useEffect, useRef } from 'react';
import { memo } from 'react';
import clsx from 'clsx';
import { Spinner } from './spinner';
import { Line } from './line';

interface IAutoCompleteItemProps {
  suggestions: any[];
  handleClickItem?: (itemId: string) => void;
  isLoading?: boolean;
  isOpenSuggestions: boolean;
  renderKeys?: string[];
  renderItem?: (item: any) => React.ReactNode;
}

interface IAutoCompleteInputProps {
  setItem: Dispatch<SetStateAction<string>>;
  suggestions: any[];
  getItems: (value: string) => Promise<void>;
  value?: string;
  setValue?: Dispatch<SetStateAction<string>>;
  renderKeys?: string[];
  placeholder?: string;
  renderItem?: (item: any) => React.ReactNode;
  getDisplayValue?: (item: any) => string;
}

const AutoCompleteItem = memo(
  ({
    suggestions,
    handleClickItem = () => {},
    isLoading,
    isOpenSuggestions,
    renderKeys,
    renderItem,
  }: IAutoCompleteItemProps) => {
    return (
      <div
        className={clsx(
          'bg-white max-h-[200px] w-full overflow-auto rounded transition-all absolute z-50',
          {
            'h-0': !isOpenSuggestions,
            'border border-neutral-grey': isOpenSuggestions,
          },
        )}
      >
        <ul className="flex flex-1 flex-col gap-2 p-4">
          {isLoading ? (
            <Spinner />
          ) : (
            suggestions?.map((item, idx) => {
              return (
                <li
                  key={item.id || idx}
                  onClick={() => handleClickItem(item.id)}
                  className="text-neutral-grey font-poppins text-sm hover:underline hover:text-neutral-darkest cursor-pointer"
                >
                  {renderItem ? (
                    renderItem(item)
                  ) : (
                    <span className="truncate">
                      {renderKeys?.map((i) => item[i]).join(' | ')}
                    </span>
                  )}
                  <Line className="mt-2" />
                </li>
              );
            })
          )}
        </ul>
      </div>
    );
  },
);

export const AutoCompleteInput = ({
  setItem,
  suggestions,
  getItems,
  value,
  setValue,
  renderKeys,
  placeholder,
  renderItem,
  getDisplayValue,
}: IAutoCompleteInputProps) => {
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [autoCompleteValue, setAutoCompleteValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickProduct = (itemId: string) => {
    const itemFiltered = suggestions.find((p) => p.id == itemId);
    const formattedString = getDisplayValue
      ? getDisplayValue(itemFiltered)
      : renderKeys?.map((i) => itemFiltered[i]).join(' | ') || '';

    setAutoCompleteValue(formattedString);
    setValue && setValue(formattedString);
    setItem(itemFiltered.id);
    setOpenSuggestions(false);
  };

  const handleChange = (e: any) => {
    const inputValue = e.target.value;
    
    setAutoCompleteValue(inputValue);
    setValue && setValue(inputValue);
    setOpenSuggestions(true);
    
    // Call getItems immediately - filtering is done in parent
    getItems(inputValue);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        name="autocomplete"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[40px] text-sm"
        placeholder={placeholder || 'Digite algo'}
        onChange={handleChange}
        value={value ?? autoCompleteValue}
      />

      <AutoCompleteItem
        suggestions={suggestions}
        handleClickItem={handleClickProduct}
        // isLoading={isPlacePredictionsLoading}
        isOpenSuggestions={openSuggestions}
        renderKeys={renderKeys}
        renderItem={renderItem}
      />
    </div>
  );
};
