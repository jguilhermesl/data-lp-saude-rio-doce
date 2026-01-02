import { Heading } from "./ui/heading";
import { Paragraph } from "./ui/paragraph";
import { Switch } from "./ui/switch";

interface IFormSwitchFieldProps {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description: string;
}

export const FormSwitchField = ({
  isChecked,
  onCheckedChange,
  label,
  description,
}: IFormSwitchFieldProps) => {
  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Heading className="text-base font-medium">{label}</Heading>
        <Paragraph className="text-muted-foreground">{description}</Paragraph>
      </div>
      <div>
        <Switch checked={isChecked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
};
