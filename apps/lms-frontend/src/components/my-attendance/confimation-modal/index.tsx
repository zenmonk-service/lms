import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface confirmModalState {
  id: string | null;
  show: "open" | "close" | "confirm";
}

interface ConfirmationModaltype {
  open?: boolean;
  onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;
  handleConfirm?: () => void;
  description?: string;
  title?: string;
  message?: string | ReactNode;
  loading?: boolean;
  confirmText?: string;
  confirmModal?: confirmModalState;
  setConfirmModal?: React.Dispatch<React.SetStateAction<confirmModalState>>;
  handleConfirmAction?: () => void;
  type?: string;
  children?: ReactNode;
  disableConfirm?: boolean;
  isFaceRegistered?: boolean;
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
    isFaceRegistered = true,
  } = props;
  const handleCancel = () => {
    setConfirmModal?.((prevState) => ({
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
          {isFaceRegistered && (
            <AlertDialogDescription>{message}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
        <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          {isFaceRegistered && (
            <AlertDialogAction
              disabled={disableConfirm}
              onClick={handleConfirmAction}
            >
                {confirmText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
