import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { type ReactNode, type Ref } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

interface IProps<T> {
  value: string[];
  onValuesChange: (values: string[]) => void;
  data: T[];
  total: number;
  isLoading: boolean;
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
  onSearch,
  onLoadMore,
  getValue,
  getLabel,
  placeholder = "Select options",
  ref,
  "aria-invalid": ariaInvalid,
  className,
  scrollHeight = 240,
}: IProps<T>) => {
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
        search={{ emptyMessage: "No match found.", placeholder: "Search..." }}
        onSearch={onSearch}
        isLoading={isLoading}
      >
        <MultiSelectGroup>
          <InfiniteScroll
            dataLength={data.length}
            next={onLoadMore}
            hasMore={data.length < total}
            loader={<LoaderCircle className="animate-spin mx-auto my-2 size-3" />}
            height={scrollHeight}
          >
            {data.map((item) => {
              const itemValue = getValue(item);
              return (
                <MultiSelectItem value={itemValue} key={itemValue}>
                  {getLabel(item)}
                </MultiSelectItem>
              );
            })}
          </InfiniteScroll>
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  );
};