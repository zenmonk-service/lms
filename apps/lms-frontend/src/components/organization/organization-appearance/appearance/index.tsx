import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Title from "@/shared/typography/title";
import { ThemeSelector } from "@/themes/theme-selector";
import { Loader2Icon, Save } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

interface AppearanceProps {
  className?: string;
  isLoading?: boolean;
}

const Appearance = ({ className, isLoading }: AppearanceProps) => {
  const { control, formState } = useFormContext();
  return (
    <div className={cn("", className)}>
      <Title
        title={{
          text: "Appearance",
          className: "",
        }}
        description={{
          text: "Customize the look and feel of your LMS to align with your organization's branding and style preferences.",
          className: "",
        }}
        className=""
        button={
          <Button
            type="submit"
            size={"sm"}
            disabled={isLoading || !formState.isDirty}
          >
            {isLoading ? <Loader2Icon className="animate-spin" /> : <Save />}
            Save changes
          </Button>
        }
      />

      <Controller
        name="theme"
        control={control}
        render={({ field }) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            role="radiogroup"
            aria-label="Theme"
          >
            <ThemeSelector field={field} />
          </div>
        )}
      />
    </div>
  );
};

export default Appearance;
