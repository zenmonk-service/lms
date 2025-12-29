"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEvents } from "@/context/events-context";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  deleteOrganizationEventAction,
  getOrganizationEventAction,
} from "@/features/organizations/organizations.action";
import { AlertCircle, LoaderCircle, Trash2 } from "lucide-react";

interface EventDeleteFormProps {
  id?: string;
  title?: string;
  color?: string;
}

export function EventDeleteForm({ id, title, color }: EventDeleteFormProps) {
  const { eventDeleteOpen, setEventDeleteOpen, setEventViewOpen } = useEvents();

  const { isLoading, currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const dispatch = useAppDispatch();

  async function onSubmit() {
    try {
      await dispatch(
        deleteOrganizationEventAction({
          org_uuid: currentOrganization.uuid,
          event_uuid: id,
        })
      );
      await dispatch(
        getOrganizationEventAction({ org_uuid: currentOrganization.uuid })
      );
      setEventDeleteOpen(false);
      setEventViewOpen(false);
      toast.success("Event deleted!");
    } catch (error) {
      toast.error("Failed to delete event.");
    }
  }

  return (
    <AlertDialog open={eventDeleteOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setEventDeleteOpen(true)}
          className="hover:bg-rose-50 hover:text-rose-500 transition-all duration-150"
        >
          <Trash2 />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="p-2">
          <AlertDialogTitle className="flex flex-col justify-between items-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-rose-100">
              <AlertCircle size={32} strokeWidth={2.5} />
            </div>

            <p className="text-xl font-black text-slate-900 mb-2 text-center">
              Delete event?
            </p>
            <p className="text-sm text-slate-500 text-center leading-relaxed max-w-50 font-medium">
              This action cannot be undone and will remove it from your
              schedule.
            </p>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setEventDeleteOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => onSubmit()}
            disabled={isLoading}
          >
            {isLoading ? <LoaderCircle className="animate-spin" /> : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
