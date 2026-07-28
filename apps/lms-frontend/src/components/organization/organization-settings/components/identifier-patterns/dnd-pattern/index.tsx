"use client";

import { useMemo, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CustomTokenDialog from "./custom-dialog";
import SortableItem from "./sortable-item";
import { OrgSettingsForm, PresetId, PRESETS, tokenCategories } from "@/components/organization/organization.types";
import { Fingerprint } from "lucide-react";
import { useFormContext, useController } from "react-hook-form";
import { cn } from "@/lib/utils";
import CounterTokenDialog from "./counter-dialog";

interface PatternToken {
  id: string;
  value: string;
}

let tokenCounter = 0;
const createToken = (value: string): PatternToken => ({
  id: `token-${Date.now()}-${tokenCounter++}`,
  value,
});

const COUNTER_TOKEN_REGEX = /^\{#(\d+)\}$/;

export function Pattern() {
  const { control } = useFormContext<OrgSettingsForm>();
  
  const {
    field: { value: fieldValue, onChange },
    fieldState: { error },
  } = useController({
    name: "employee_id_pattern_value",
    control,
  });
  
  const [selectedPreset, setSelectedPreset] = useState<PresetId>("custom");
  const [dialogTarget, setDialogTarget] = useState<"new" | { id: string; value: string } | null>(null);
  const [counterDialogTarget, setCounterDialogTarget] = useState<"new" | { id: string; base: number } | null>(null);
  const [items, setItems] = useState<PatternToken[]>(() => (fieldValue?.length ? fieldValue : []).map(createToken));
  
  const isCounterToken = (value: string) => COUNTER_TOKEN_REGEX.test(value);
  
  const getCounterBase = (value: string): number => {
    const match = COUNTER_TOKEN_REGEX.exec(value);
    return match ? Number.parseInt(match[1], 10) : 0;
  };

  const applyItems = (updater: (prev: PatternToken[]) => PatternToken[]) => {
    setItems((prev) => {
      const next = updater(prev);
      onChange(next.map((token) => token.value));
      return next;
    });
  };

  const handleSelectPreset = (presetId: PresetId) => {
    setSelectedPreset(presetId);
    if (presetId === "custom") return;

    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) applyItems(() => preset.tokens.map(createToken));
  };

  const handleRemove = (id: string) => {
    setSelectedPreset("custom");
    applyItems((prev) => prev.filter((token) => token.id !== id));
  };

  const handleAddToken = (value: string) => {
    setSelectedPreset("custom");
    applyItems((prev) => [...prev, createToken(value)]);
  };

  const handleEditToken = (id: string, value: string) => {
    setSelectedPreset("custom");
    applyItems((prev) =>
      prev.map((token) => (token.id === id ? { ...token, value } : token)),
    );
  };

  const handleAddCounter = (base: number) => {
    setSelectedPreset("custom");
    applyItems((prev) => [...prev, createToken(`{#${base}}`)]);
  };

  const handleEditCounter = (id: string, base: number) => {
    setSelectedPreset("custom");
    applyItems((prev) =>
      prev.map((token) => (token.id === id ? { ...token, value: `{#${base}}` } : token)),
    );
  };

  const handleReset = () => {
    setSelectedPreset("custom");
    applyItems(() => []);
  };

  const onEditRequest = (id: string) => {
    const token = items.find((t) => t.id === id);
    if (!token) return;

    if (isCounterToken(token.value)) {
      setCounterDialogTarget({ id: token.id, base: getCounterBase(token.value) });
    } else {
      setDialogTarget({ id: token.id, value: token.value });
    }
  };

  const generateSampleValue = (tokenValue: string): string => {
    const now = new Date();
    switch (tokenValue) {
      case "{YYYY}": return String(now.getFullYear());
      case "{YY}": return String(now.getFullYear()).slice(-2);
      case "{MM}": return String(now.getMonth() + 1).padStart(2, "0");
      case "{DD}": return String(now.getDate()).padStart(2, "0");
      case "{-}": return "-";
      case "{_}": return "_";
      case "{.}": return ".";
      default: return tokenValue;
    }
  };

  const buildSampleId = (items: PatternToken[], offset: number): string =>
    items
      .map((token) =>
        isCounterToken(token.value)
          ? String(getCounterBase(token.value) + offset)
          : generateSampleValue(token.value),
      )
      .join("");

  const [sampleIdOne, sampleIdTwo] = useMemo(
    () => [buildSampleId(items, 0), buildSampleId(items, 1)],
    [items],
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <p className="text-sm mb-3">Choose a starting point</p>
          <RadioGroup
            value={selectedPreset}
            onValueChange={(value) => handleSelectPreset(value as PresetId)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {PRESETS.map((preset) => (
              <Label
                key={preset.id}
                htmlFor={`preset-${preset.id}`}
                className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer ${
                  selectedPreset === preset.id
                    ? "border-primary bg-primary/10"
                    : "border-input"
                }`}
              >
                <RadioGroupItem value={preset.id} id={`preset-${preset.id}`} className="mt-1" />
                <div>
                  <div className="text-sm font-medium">{preset.label}</div>
                  <div className="text-xs text-muted-foreground tracking-wide">
                    {preset.preview}
                  </div>
                </div>
              </Label>
            ))}

            <Label
              htmlFor="preset-custom"
              className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer ${
                selectedPreset === "custom"
                  ? "border-primary bg-primary/10"
                  : "border-input"
              }`}
            >
              <RadioGroupItem value="custom" id="preset-custom" className="mt-1" />
              <div>
                <div className="text-sm font-medium">Custom</div>
                <div className="text-xs text-muted-foreground">
                  Build your own pattern below
                </div>
              </div>
            </Label>
          </RadioGroup>
        </div>

        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) return;
            setSelectedPreset("custom");
            applyItems((prev) => move(prev, event));
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                Active Pattern Sequence{" "}
                <span className="text-xs text-muted-foreground">
                  (Drag to reorder tokens)
                </span>
              </p>

              <Button
                size="sm"
                type="button"
                variant="link"
                className="text-destructive pr-0"
                onClick={handleReset}
              >
                Clear
              </Button>
            </div>

            <div>
              <div className={cn(
                "border border-dashed",
                error ? "border-2 border-destructive" : "border-accent-foreground",
                "rounded-lg py-4 px-2 flex flex-wrap flex-col sm:flex-row gap-3 bg-muted min-h-16"
                )}>
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground m-auto">
                    No tokens yet — pick a preset above or add tokens below.
                  </p>
                ) : (
                  items.map((token, index) => (
                    <SortableItem
                      key={token.id}
                      token={token}
                      index={index}
                      onRemove={handleRemove}
                      onEditRequest={onEditRequest}
                    />
                  ))
                )}
              </div>
              <p className="text-xs text-destructive mt-1">{error?.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tokens are concatenated left-to-right without automatic spaces.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-lg border divide-y">
                {Object.entries(tokenCategories).map(([category, tokenList]) => (
                  <div
                    key={category}
                    className="flex items-start flex-col lg:flex-row justify-between gap-3 lg:gap-6 p-4"
                  >
                    <div className="min-w-32">
                      <h4 className="text-sm font-medium capitalize">{category}</h4>
                      <p className="text-muted-foreground text-xs">Available tokens</p>
                    </div>

                    <div className="flex flex-1 flex-wrap gap-2 justify-end">
                      {tokenList.map((tokenValue) => (
                        <Button
                          size="sm"
                          key={tokenValue}
                          type="button"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            if (category === "custom") setDialogTarget("new");
                            else if (category === "counter") setCounterDialogTarget("new");
                            else handleAddToken(tokenValue);
                          }}
                        >
                          {tokenValue}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-card-foreground p-4">
                <div className="bg-accent rounded-sm p-4 flex flex-col gap-2 items-center relative">
                  <p className="text-xs">Generated id sample</p>
                  <div className="text-center">
                    <p className="text-xl font-bold tracking-wider">
                      {sampleIdOne || "—"}
                    </p>
                    <p className="text-lg font-semibold tracking-wider text-foreground/50">
                      {sampleIdTwo || ""}
                    </p>
                  </div>
                  <Fingerprint className="absolute left-4 -bottom-4" size={64} />
                </div>
              </div>
            </div>
          </div>
        </DragDropProvider>
      </div>

      <CustomTokenDialog
        target={dialogTarget}
        onClose={() => setDialogTarget(null)}
        onAdd={handleAddToken}
        onEdit={handleEditToken}
      />
      
      <CounterTokenDialog
        target={counterDialogTarget}
        onClose={() => setCounterDialogTarget(null)}
        onAdd={handleAddCounter}
        onEdit={handleEditCounter}
      />
    </>
  );
}