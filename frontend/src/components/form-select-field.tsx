import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paragraph } from "./ui/paragraph";

interface IFormSelectFieldProps {
  label?: string;
  placeholder?: string;
  description?: string;
  onChange: (value: string) => void;
  value?: string;
  className?: string;
  choices: {
    value: string;
    label: string;
  }[];
}

export const FormSelectField = ({
  label,
  placeholder,
  description,
  onChange,
  value,
  choices,
  className,
}: IFormSelectFieldProps) => {
  return (
    <div className={className}>
      {label && <Paragraph className="font-medium">{label}</Paragraph>}
      <Select onValueChange={onChange} defaultValue={value}>
        <SelectTrigger className="my-2">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {choices.map((choice) => {
            return (
              <SelectItem key={choice.value} value={choice.value}>
                {choice.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {description && (
        <Paragraph className="text-xs text-muted-foreground">
          {description}
        </Paragraph>
      )}
    </div>
  );
};
