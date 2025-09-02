"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languagesWithFlag } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageSwitchProps {
  defaultValue?: string;
  className?: string;
}

export default function LanguageSwitch({
  defaultValue = "en",
  className,
}: LanguageSwitchProps) {
  const [currentValue, setCurrentValue] = useState(defaultValue);

  const handleValueChange = (value: string) => {
    setCurrentValue(value);
  };

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn(
          "w-36 bg-transparent border-gray-600 text-gray-400 hover:text-white cursor-pointer",
          className
        )}
      >
        <Globe />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="bg-t-p border-gray-600">
        <SelectGroup>
          {languagesWithFlag.map((item) => (
            <SelectItem
              key={item.code}
              value={item.code}
              className={cn(
                "text-t-m hover:text-white cursor-pointer hover:bg-[#2a2a2a]",
                item.code === currentValue && "bg-[#2a2a2a] text-white"
              )}
            >
              {item.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
