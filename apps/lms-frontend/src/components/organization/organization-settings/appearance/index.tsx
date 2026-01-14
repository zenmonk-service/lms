import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/themes/theme-selector";
import { useState } from "react";
import { Control, Controller } from "react-hook-form";

interface AppearanceProps {
  control: Control<any>;
}

const Appearance = ({ control }: AppearanceProps) => {
  const [showMore, setShowMore] = useState(false);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Select a color palette and layout density that matches your corporate
          identity.
        </p>
      </div>

      <Controller
        name="theme"
        control={control}
        render={({ field }) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            role="radiogroup"
            aria-label="Theme"
          >
            <ThemeSelector field={field} number={showMore ? 12 : 6} />
          </div>
        )}
      />
      <Button
        type="button"
        variant="link"
        className="mt-4 p-0 w-full"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "Show Less" : "Show More"}
      </Button>
    </div>
  );
};

export default Appearance;
