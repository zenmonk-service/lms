import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCallback, useRef, type ReactNode, type Ref } from "react";

interface IProps<T> {
  value: string[];
  onValuesChange: (values: string[]) => void;
  data: T[];
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  onSearch: React.Dispatch<React.SetStateAction<string>>;
  onLoadMore: () => void;
  getValue: (item: T) => string;
  getLabel: (item: T) => ReactNode;
  ref?: Ref<HTMLButtonElement>;
  placeholder?: string;
  "aria-invalid"?: boolean;
  className?: string;
  scrollHeight?: number;
}

export const InfiniteMultiSelect = <T,>({
  value,
  onValuesChange,
  data,
  total,
  isLoading,
  isLoadingMore,
  onSearch,
  onLoadMore,
  getValue,
  getLabel,
  placeholder = "Select options",
  ref,
  "aria-invalid": ariaInvalid,
  className,
  scrollHeight = 180,
}: IProps<T>) => {
  const loadingMoreRef = useRef(false);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const element = event.currentTarget;

      const distanceFromBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight;

      const isNearBottom = distanceFromBottom <= 30;
      const hasMore = data.length < total;

      if (
        !isNearBottom ||
        !hasMore ||
        isLoadingMore ||
        loadingMoreRef.current
      ) {
        return;
      }

      loadingMoreRef.current = true;

      Promise.resolve(onLoadMore()).finally(() => {
        loadingMoreRef.current = false;
      });
    },
    [data.length, total, isLoadingMore, onLoadMore],
  );

  return (
    <MultiSelect values={value} onValuesChange={onValuesChange}>
      <MultiSelectTrigger
        ref={ref}
        aria-invalid={ariaInvalid}
        className={cn("w-full max-w-full overflow-hidden", className)}
      >
        <MultiSelectValue
          overflowBehavior="cutoff"
          placeholder={placeholder}
          className="min-w-0"
        />
      </MultiSelectTrigger>

      <MultiSelectContent
        search={{
          emptyMessage: "No match found.",
          placeholder: "Search...",
        }}
        onSearch={onSearch}
        isLoading={isLoading}
      >
        <div
          style={{
            maxHeight: scrollHeight,
            overflowY: "auto",
          }}
          onScroll={handleScroll}
        >
          {data.map((item) => {
            const itemValue = getValue(item);

            return (
              <MultiSelectItem value={itemValue} key={itemValue}>
                {getLabel(item)}
              </MultiSelectItem>
            );
          })}

          {isLoadingMore && (
            <div className="space-y-1.5 px-2 py-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          )}
        </div>
      </MultiSelectContent>
    </MultiSelect>
  );
};
