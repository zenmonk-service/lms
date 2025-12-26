import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import React from "react";
import { Control, Controller } from "react-hook-form";

const themeOptions = [
  { name: "Standard Orange", value: "#F97316" },
  { name: "Deep Indigo", value: "#4F46E5" },
  { name: "Forest Green", value: "#10B981" },
  { name: "Slate Gray", value: "#475569" },
  { name: "Royal Blue", value: "#2563EB" },
  { name: "Berry Pink", value: "#DB2777" },
];

interface AppearanceProps {
  control: Control<any>;
}

const Appearance = ({ control }: AppearanceProps) => {
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
            {themeOptions.map((option) => {
              const selected = field.value?.value === option.value;
              return (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => field.onChange(option)}
                  aria-pressed={selected}
                  className={`relative flex flex-col items-start p-5 rounded-3xl border-2 transition-all duration-300 text-left group overflow-hidden
                    ${
                      selected
                        ? "border-slate-900 shadow-lg"
                        : "border-slate-100 hover:border-slate-300 bg-slate-50/30"
                    }`}
                >
                  {selected && (
                    <div className="absolute top-4 right-4 z-10 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm">
                      <Check size={14} />
                    </div>
                  )}

                  <div className="w-full aspect-[4/3] rounded-2xl mb-4 overflow-hidden bg-white border border-slate-100 relative shadow-sm">
                    <div
                      className="absolute inset-x-0 top-0 h-4"
                      style={{ backgroundColor: option.value }}
                    />
                    <div className="mt-6 px-3 space-y-2">
                      <div className="h-2 w-1/2 rounded bg-slate-100" />
                      <div className="flex gap-2">
                        <div className="h-6 w-6 rounded bg-slate-50 border border-slate-100" />
                        <div
                          className="h-6 flex-1 rounded"
                          style={{ backgroundColor: `${option.value}15` }}
                        />
                      </div>
                      <div className="h-2 w-3/4 rounded bg-slate-50" />
                    </div>
                  </div>

                  <div className="z-10">
                    <h4 className="font-bold text-sm text-slate-900">
                      {option.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-tighter font-mono">
                      {option.value}
                    </p>
                  </div>

                  <div
                    className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-500"
                    style={{ backgroundColor: option.value }}
                  />
                </button>
              );
            })}
          </div>
        )}
      />
    </div>
  );
};

export default Appearance;
