import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface confirmModalState {
  id: string | null;
  show: "open" | "close" | "confirm";
}

interface ConfirmationModaltype {
  title: string;
  message?: string | ReactNode;
  loading?: boolean;
  confirmText: string;
  confirmModal: confirmModalState;
  setConfirmModal: React.Dispatch<React.SetStateAction<confirmModalState>>;
  handleConfirmAction: () => void;
  type?: string;
  children?: ReactNode;
  disableConfirm?: boolean;
}

export const ConfirmationDialog = (props: ConfirmationModaltype) => {
  const {
    title,
    message,
    loading,
    confirmText,
    confirmModal,
    setConfirmModal,
    handleConfirmAction,
    type,
    children,
    disableConfirm,
  } = props;
  const handleCancel = () => {
    setConfirmModal((prevState) => ({
      ...prevState,
      id: null,
      show: "close",
    }));
  };

  return (
    <AlertDialog open={confirmModal?.show === "open"}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {children && (
            <div className="flex justify-center py-4">{children}</div>
          )}
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={disableConfirm}
            onClick={handleConfirmAction}
          >
            { disableConfirm ? <Loader2 className="animate-spin" /> : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};