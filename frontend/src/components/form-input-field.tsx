/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputHTMLAttributes, ReactNode } from "react";
import { Input } from "./ui/input";
import { Paragraph } from "./ui/paragraph";

interface IFormInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  onChange?: (e: any) => void;
  value?: string;
  iconRight?: ReactNode;
}

export const FormInputField = ({
  value,
  label,
  placeholder,
  description,
  className,
  onChange,
  iconRight,
  ...props
}: IFormInputFieldProps) => {
  return (
    <div className={className}>
      {label && <Paragraph className="font-medium">{label}</Paragraph>}
      <Input
        {...props}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        className="mt-2 mb-2"
        iconRight={iconRight}
      />
      {description && (
        <Paragraph className="text-xs text-muted-foreground">
          {description}
        </Paragraph>
      )}
    </div>
  );
};
