import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface IProps {
  onCancel: () => void;
  disabled?: boolean;
}

const DeficitSummaryFooter = ({ onCancel, disabled }: IProps) => {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={disabled}>
        Save adjustments
      </Button>
    </DialogFooter>
  );
};

export default DeficitSummaryFooter;
