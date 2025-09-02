import { ToggleGroupOption } from "@/types/paramaters";
import { cn } from "@/lib/utils";

type ToggleValue = string | number;

interface ToggleGroupProps {
  options: ToggleGroupOption[];
  title: string;
  value?: ToggleValue;
  onChange?: (value: ToggleValue) => void;
}

export default function ToggleGroup({
  options,
  title,
  value,
  onChange,
}: ToggleGroupProps) {
  if (options.length > 4) {
    console.error("ToggleGroup 最多只能有 4 个选项");
    return null;
  }
  return (
    <div className="w-full">
      <label className="leading-12 font-bold text-sm block mb-3">{title}</label>

      <div className="flex gap-2 p-1 ">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              console.log("ToggleGroup clicked:", option.value);
              onChange?.(option.value);
            }}
            className={cn(
              "px-2 py-2 rounded-md text-sm font-medium flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer border-bd-p border hover:bg-primary/10 hover:border-primary",
              value === option.value &&
                "bg-primary/10 border-primary text-primary"
            )}
            type="button"
            title={option.label}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
