import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoaderCircle } from "lucide-react";

interface IProps {
  open: boolean;
}

const WorkspaceModal = ({ open }: IProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-col items-center">
          <LoaderCircle className="w-12 h-12 text-primary animate-spin" />
          <AlertDialogTitle>Loading workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Please wait while we set up your environment.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WorkspaceModal;
