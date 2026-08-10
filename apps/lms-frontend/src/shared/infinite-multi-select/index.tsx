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
import { RefCallBack } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";

interface IProps<T> {
  value: string[];
  onValuesChange: (values: string[]) => void;
  data: T[];
  total: number;
  isLoading: boolean;
  onSearch: React.Dispatch<React.SetStateAction<string>>;
  onLoadMore: () => void;
  ref?: RefCallBack;
  placeholder?: string;
  ariaInvalid?: boolean;
  className?: string;
}

export const InfiniteMultiSelect = <
  T extends { user_id: string; name: string },
>({
  value,
  onValuesChange,
  data,
  total,
  isLoading,
  onSearch,
  onLoadMore,
  placeholder = "Select options",
  ref,
  ariaInvalid,
  className,
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
        search={{
          emptyMessage: "No match found.",
          placeholder: "Search...",
        }}
        onSearch={onSearch}
        isLoading={isLoading}
      >
        <MultiSelectGroup>
          <InfiniteScroll
            dataLength={data.length}
            next={onLoadMore}
            hasMore={data.length < total}
            loader={
              <LoaderCircle className="animate-spin mx-auto my-2 size-3" />
            }
            height={400}
            className="max-h-50"
          >
            {data.map((item) => (
              <MultiSelectItem value={item.user_id} key={item.user_id}>
                {item.name}
              </MultiSelectItem>
            ))}
          </InfiniteScroll>
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  );
};
