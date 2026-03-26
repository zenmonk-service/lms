"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Briefcase,
  ExternalLink,
  FilePlus2,
  Loader2,
  Phone,
  Pencil,
  Undo2,
  Save,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useAppDispatch, useAppSelector } from "@/store";
import { getOrganizationRolesAction } from "@/features/role/role.action";
import { listOrganizationShiftsAction } from "@/features/shift/shift.action";
import { imageUploadAction } from "@/features/image-upload/image-upload.action";
import {
  createUserDocumentAction,
  deleteUserDocumentAction,
  listUserAction,
  listUserDocumentsAction,
  updateUserAction,
} from "@/features/user/user.action";
import { setCurrentUser, UserInterface } from "@/features/user/user.slice";
import Dashboard from "@/components/dashboard/dashboard";

const editUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or fewer"),
  email: z
    .string()
    .trim()
    .nonempty("Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address")
    .max(50, "Email must be 50 characters or fewer"),
  role: z.string().trim().min(1, "Role is required"),
  shift: z.string().trim().min(1, "Shift is required"),
  designation: z
    .string()
    .trim()
    .max(100, "Designation must be 100 characters or fewer")
    .optional(),
  marital_status: z
    .enum(["single", "married", "divorced", "widowed"])
    .optional(),
  employment_type: z.enum(["full_time", "intern", "contract"]).optional(),
  work_mode: z.enum(["office", "remote", "hybrid"]).optional(),
  work_branch: z
    .string()
    .trim()
    .max(100, "Branch must be 100 characters or fewer")
    .optional(),
  official_phone: z
    .string()
    .trim()
    .max(20, "Phone must be 20 characters or fewer")
    .refine((value) => !value || /^[0-9+\-\s()]*$/.test(value), {
      message: "Enter a valid phone number",
    })
    .optional(),
  emergency_contact_name: z
    .string()
    .trim()
    .max(100, "Emergency contact name must be 100 characters or fewer")
    .optional(),
  emergency_contact_relation: z
    .string()
    .trim()
    .max(50, "Relation must be 50 characters or fewer")
    .optional(),
  emergency_contact_phone: z
    .string()
    .trim()
    .max(20, "Phone must be 20 characters or fewer")
    .refine((value) => !value || /^[0-9+\-\s()]*$/.test(value), {
      message: "Enter a valid phone number",
    })
    .optional(),
  guardian_contact_name: z
    .string()
    .trim()
    .max(100, "Guardian contact name must be 100 characters or fewer")
    .optional(),
  guardian_contact_relation: z
    .string()
    .trim()
    .max(50, "Relation must be 50 characters or fewer")
    .optional(),
  guardian_contact_phone: z
    .string()
    .trim()
    .max(20, "Phone must be 20 characters or fewer")
    .refine((value) => !value || /^[0-9+\-\s()]*$/.test(value), {
      message: "Enter a valid phone number",
    })
    .optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface UserDetailPageProps {
  organizationUuid: string;
  userUuid: string;
}

interface UserDocument {
  uuid: string;
  document_name: string;
  document_type?: string | null;
  document_number?: string | null;
  file_url: string;
  file_urls?: string[] | null;
  metadata?: Record<string, string | string[]> | null;
  created_at?: string;
}

interface DocumentDraft {
  id: string;
  name: string;
  number: string;
  files: File[];
}

const DOCUMENT_NAME_MAX_LENGTH = 100;
const DOCUMENT_NUMBER_MAX_LENGTH = 100;

const createDocumentDraft = (): DocumentDraft => ({
  id: crypto.randomUUID(),
  name: "",
  number: "",
  files: [],
});

export default function UserDetailPage({
  organizationUuid,
  userUuid,
}: Readonly<UserDetailPageProps>) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { update } = useSession();

  const roles = useAppSelector((state) => state.rolesSlice.roles);
  const shifts = useAppSelector((state) => state.shiftSlice.shifts);
  const { pagination, currentUser } = useAppSelector(
    (state) => state.userSlice
  );

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [documentValidationErrors, setDocumentValidationErrors] = useState<
    Record<number, string>
  >({});
  const [addedDocumentIndices, setAddedDocumentIndices] = useState<Set<number>>(
    new Set()
  );
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [pendingDeletedDocumentUuids, setPendingDeletedDocumentUuids] =
    useState<string[]>([]);
  const [pendingCreatedDocumentDrafts, setPendingCreatedDocumentDrafts] =
    useState<DocumentDraft[]>([]);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [documentDrafts, setDocumentDrafts] = useState<DocumentDraft[]>([
    createDocumentDraft(),
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      shift: "",
      designation: "",
      marital_status: undefined,
      employment_type: undefined,
      work_mode: undefined,
      work_branch: "",
      official_phone: "",
      emergency_contact_name: "",
      emergency_contact_relation: "",
      emergency_contact_phone: "",
      guardian_contact_name: "",
      guardian_contact_relation: "",
      guardian_contact_phone: "",
    },
  });

  const userInitials = useMemo(() => {
    const fullName = selectedUser?.name || "User";
    return fullName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [selectedUser?.name]);

  const watchedRole = watch("role");
  const watchedShift = watch("shift");

  const normalizedRouteUserUuid = useMemo(() => {
    try {
      return decodeURIComponent(userUuid).trim().toLowerCase();
    } catch {
      return userUuid.trim().toLowerCase();
    }
  }, [userUuid]);

  const isSameUser = (user: Partial<UserInterface> & { uuid?: string }) => {
    const candidate = String(user.user_id || user.uuid || "")
      .trim()
      .toLowerCase();
    return candidate === normalizedRouteUserUuid;
  };

  const findUserByUuid = async () => {
    const limit = 50;
    let page = 1;

    while (page <= 200) {
      const result = await dispatch(
        listUserAction({
          org_uuid: organizationUuid,
          pagination: {
            page,
            limit,
            search: "",
          },
        })
      ).unwrap();

      const rows: UserInterface[] = result?.rows || [];
      const found = rows.find((user) => isSameUser(user));
      if (found) {
        return found;
      }

      const count = Number(result?.count || 0);
      const totalPages = count > 0 ? Math.ceil(count / limit) : 1;
      const noMoreRows = rows.length < limit;
      if (page >= totalPages || noMoreRows) {
        break;
      }
      page += 1;
    }

    return null;
  };

  const loadUserDocuments = async (employeeUuid: string) => {
    setIsDocumentsLoading(true);
    try {
      const response = await dispatch(
        listUserDocumentsAction({
          org_uuid: organizationUuid,
          user_uuid: employeeUuid,
        })
      ).unwrap();
      setDocuments(Array.isArray(response) ? response : []);
    } catch {
      setDocuments([]);
    } finally {
      setIsDocumentsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingUser(true);
      try {
        await Promise.all([
          dispatch(getOrganizationRolesAction({ org_uuid: organizationUuid })),
          dispatch(listOrganizationShiftsAction({ org_uuid: organizationUuid })),
        ]);

        const userFromList = await findUserByUuid();
        const activeUser = userFromList;

        if (activeUser) {
          setSelectedUser(activeUser);
          setPreviewImage(activeUser.image || "");
          reset({
            name: activeUser.name,
            email: activeUser.email,
            role: activeUser.role?.uuid || "",
            shift: activeUser.organization_shift?.uuid || "",
            designation: activeUser.designation || "",
            marital_status: activeUser.marital_status || undefined,
            employment_type: activeUser.employment_type || undefined,
            work_mode: activeUser.work_mode || undefined,
            work_branch: activeUser.work_branch || "",
            official_phone: activeUser.official_phone || "",
            emergency_contact_name: activeUser.emergency_contact_name || "",
            emergency_contact_relation:
              activeUser.emergency_contact_relation || "",
            emergency_contact_phone: activeUser.emergency_contact_phone || "",
            guardian_contact_name: activeUser.guardian_contact_name || "",
            guardian_contact_relation:
              activeUser.guardian_contact_relation || "",
            guardian_contact_phone: activeUser.guardian_contact_phone || "",
          });
          await loadUserDocuments(activeUser.user_id);
        }
      } catch {
        setSelectedUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchData();
  }, [organizationUuid, normalizedRouteUserUuid, dispatch, reset]);

  // Monitor form changes and track unsaved changes
  const formValues = watch();
  useEffect(() => {
    if (!selectedUser || !isEditing) {
      setHasUnsavedChanges(false);
      return;
    }

    const hasFormChanges =
      formValues.name !== selectedUser.name ||
      formValues.email !== selectedUser.email ||
      formValues.role !== (selectedUser.role?.uuid || "") ||
      formValues.shift !== (selectedUser.organization_shift?.uuid || "") ||
      formValues.designation !== (selectedUser.designation || "") ||
      formValues.marital_status !== (selectedUser.marital_status || undefined) ||
      formValues.employment_type !== (selectedUser.employment_type || undefined) ||
      formValues.work_mode !== (selectedUser.work_mode || undefined) ||
      formValues.work_branch !== (selectedUser.work_branch || "") ||
      formValues.official_phone !== (selectedUser.official_phone || "") ||
      formValues.emergency_contact_name !==
        (selectedUser.emergency_contact_name || "") ||
      formValues.emergency_contact_relation !==
        (selectedUser.emergency_contact_relation || "") ||
      formValues.emergency_contact_phone !==
        (selectedUser.emergency_contact_phone || "") ||
      formValues.guardian_contact_name !==
        (selectedUser.guardian_contact_name || "") ||
      formValues.guardian_contact_relation !==
        (selectedUser.guardian_contact_relation || "") ||
      formValues.guardian_contact_phone !==
        (selectedUser.guardian_contact_phone || "");

    const hasImageChanges = imageFile !== null || removeImage;
    const hasDocumentChanges =
      pendingDeletedDocumentUuids.length > 0 ||
      pendingCreatedDocumentDrafts.length > 0;

    setHasUnsavedChanges(hasFormChanges || hasImageChanges || hasDocumentChanges);
  }, [
    formValues,
    selectedUser,
    isEditing,
    imageFile,
    removeImage,
    pendingDeletedDocumentUuids,
    pendingCreatedDocumentDrafts,
  ]);

  // Warn user before page reload with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
      }
    };

    globalThis.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      globalThis.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Prevent navigation away with unsaved changes - catch all navigation attempts
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // Handle browser back/forward and history navigation
    const handlePopState = () => {
      const confirmLeave = globalThis.confirm(
        "⚠️ You have unsaved changes!\n\nIf you leave this page, your changes will be lost.\n\nAre you sure you want to leave?"
      );
      if (!confirmLeave) {
        globalThis.history.pushState(null, "", globalThis.location.href);
      }
    };

    // Handle all anchor link clicks
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement;

      if (link?.href && !link.href.includes("#")) {
        // Check if it's an internal link (not external)
        const isInternal =
          link.href.startsWith(globalThis.location.origin) ||
          link.href.startsWith("/");

        if (isInternal) {
          const confirmLeave = globalThis.confirm(
            "⚠️ You have unsaved changes!\n\nIf you leave this page, your changes will be lost.\n\nAre you sure you want to leave?"
          );
          if (!confirmLeave) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    globalThis.addEventListener("popstate", handlePopState);
    globalThis.addEventListener("click", handleLinkClick, true);

    return () => {
      globalThis.removeEventListener("popstate", handlePopState);
      globalThis.removeEventListener("click", handleLinkClick, true);
    };
  }, [hasUnsavedChanges]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setRemoveImage(false);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCancelEdit = () => {
    if (!selectedUser) return;

    setIsEditing(false);
    setPendingDeletedDocumentUuids([]);
    setPendingCreatedDocumentDrafts([]);
    setImageFile(null);
    setRemoveImage(false);
    setPreviewImage(selectedUser.image || "");
    setHasUnsavedChanges(false);

    reset({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role?.uuid || "",
      shift: selectedUser.organization_shift?.uuid || "",
      designation: selectedUser.designation || "",
      marital_status: selectedUser.marital_status || undefined,
      employment_type: selectedUser.employment_type || undefined,
      work_mode: selectedUser.work_mode || undefined,
      work_branch: selectedUser.work_branch || "",
      official_phone: selectedUser.official_phone || "",
      emergency_contact_name: selectedUser.emergency_contact_name || "",
      emergency_contact_relation: selectedUser.emergency_contact_relation || "",
      emergency_contact_phone: selectedUser.emergency_contact_phone || "",
      guardian_contact_name: selectedUser.guardian_contact_name || "",
      guardian_contact_relation: selectedUser.guardian_contact_relation || "",
      guardian_contact_phone: selectedUser.guardian_contact_phone || "",
    });
  };

  const handleProfileImageClick = () => {
    if (!isEditing) return;
    profileImageInputRef.current?.click();
  };

  const navigateWithUnsavedCheck = (path: string) => {
    if (hasUnsavedChanges) {
      const confirmLeave = globalThis.confirm(
        "⚠️ You have unsaved changes!\n\nIf you leave this page, your changes will be lost.\n\nAre you sure you want to leave?"
      );
      if (!confirmLeave) {
        return;
      }
    }
    router.push(path);
  };

  const addDocumentDraft = () => {
    setDocumentDrafts((prev) => [...prev, createDocumentDraft()]);
  };

  const removeDocumentDraft = (index: number) => {
    setDocumentDrafts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const removeQueuedDocumentDraft = (draftId: string) => {
    setPendingCreatedDocumentDrafts((prev) =>
      prev.filter((draft) => draft.id !== draftId)
    );
  };

  const editQueuedDocumentDraft = (draftId: string) => {
    const queuedDraft = pendingCreatedDocumentDrafts.find(
      (draft) => draft.id === draftId
    );

    if (!queuedDraft) return;

    const draftForEdit: DocumentDraft = {
      id: crypto.randomUUID(),
      name: queuedDraft.name,
      number: queuedDraft.number,
      files: queuedDraft.files,
    };

    setPendingCreatedDocumentDrafts((prev) =>
      prev.filter((draft) => draft.id !== draftId)
    );

    setDocumentDrafts((prev) => {
      const emptyDraftIndex = prev.findIndex(
        (draft) =>
          draft.name.trim().length === 0 &&
          draft.number.trim().length === 0 &&
          draft.files.length === 0
      );

      if (emptyDraftIndex === -1) {
        return [...prev, draftForEdit];
      }

      return prev.map((draft, index) =>
        index === emptyDraftIndex ? draftForEdit : draft
      );
    });
  };

  const updateDocumentDraft = (
    index: number,
    field: "name" | "number",
    value: string
  ) => {
    const maxLength =
      field === "name" ? DOCUMENT_NAME_MAX_LENGTH : DOCUMENT_NUMBER_MAX_LENGTH;

    const currentDraft = documentDrafts[index];
    if (!currentDraft) return;

    const nextDraft = {
      ...currentDraft,
      [field]: value.trimStart().slice(0, maxLength),
    };

    setDocumentDrafts((prev) =>
      prev.map((item, idx) => (idx === index ? nextDraft : item))
    );

    updateDocumentValidation(index, nextDraft);
  };

  const updateDocumentDraftFiles = (index: number, files: File[]) => {
    const currentDraft = documentDrafts[index];
    if (!currentDraft) return;

    const nextDraft = { ...currentDraft, files };

    setDocumentDrafts((prev) =>
      prev.map((item, idx) => (idx === index ? nextDraft : item))
    );

    updateDocumentValidation(index, nextDraft);
  };

  const validateDocumentDraft = (draft: DocumentDraft): string | null => {
    const trimmedName = draft.name.trim();
    const trimmedNumber = draft.number.trim();

    if (trimmedName.length === 0) {
      return "Document name is required";
    }

    if (trimmedName.length > DOCUMENT_NAME_MAX_LENGTH) {
      return `Document name must be at most ${DOCUMENT_NAME_MAX_LENGTH} characters`;
    }

    if (
      trimmedNumber.length > 0 &&
      trimmedNumber.length > DOCUMENT_NUMBER_MAX_LENGTH
    ) {
      return `Document number must be at most ${DOCUMENT_NUMBER_MAX_LENGTH} characters`;
    }

    if (draft.files.length === 0) {
      return "Please select at least one file";
    }

    return null;
  };

  const updateDocumentValidation = (index: number, draft: DocumentDraft) => {
    const error = validateDocumentDraft(draft);
    const hasAnyInput =
      draft.name.trim().length > 0 ||
      draft.number.trim().length > 0 ||
      draft.files.length > 0;

    if (error) {
      if (hasAnyInput) {
        setDocumentValidationErrors((prev) => {
          if (prev[index] === error) return prev;
          return {
            ...prev,
            [index]: error,
          };
        });
      } else {
        setDocumentValidationErrors((prev) => {
          if (!(index in prev)) return prev;
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
      return;
    }

    // Clear any previous errors
    setDocumentValidationErrors((prev) => {
      if (!(index in prev)) return prev;
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleAddDocumentToQueue = (index: number) => {
    const draft = documentDrafts[index];
    if (!draft) return;

    const error = validateDocumentDraft(draft);
    if (error) {
      setDocumentValidationErrors((prev) => ({
        ...prev,
        [index]: error,
      }));
      return;
    }

    // Add to pending queue
    const normalizedDraft: DocumentDraft = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      number: draft.number.trim(),
      files: draft.files,
    };

    setPendingCreatedDocumentDrafts((prev) => [...prev, normalizedDraft]);
    setAddedDocumentIndices((prev) => new Set([...prev, index]));

    // Show added status for 2 seconds then reset
    setTimeout(() => {
      setAddedDocumentIndices((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 2000);

    // Reset this draft
    setDocumentDrafts((prev) =>
      prev.map((item, idx) => (idx === index ? createDocumentDraft() : item))
    );
  };

  const handleDeleteDocument = (documentUuid: string) => {
    setDocumentToDelete(documentUuid);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      setPendingDeletedDocumentUuids((prev) => {
        if (prev.includes(documentToDelete)) return prev;
        return [...prev, documentToDelete];
      });
    }
    setDeleteConfirmOpen(false);
    setDocumentToDelete(null);
  };

  const recoverDeletedDocument = (documentUuid: string) => {
    setPendingDeletedDocumentUuids((prev) =>
      prev.filter((uuid) => uuid !== documentUuid)
    );
  };

  const onSubmit = async (values: EditUserFormData) => {
    if (!selectedUser) return;
    setIsSaving(true);

    try {
      let uploadedImageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResult: any = await dispatch(imageUploadAction(formData));
        if (uploadResult?.payload?.success) {
          uploadedImageUrl = uploadResult.payload.url;
        }
      }

      let imagePayload: { image?: string | null } = {};
      if (uploadedImageUrl) {
        imagePayload = { image: uploadedImageUrl };
      } else if (removeImage) {
        imagePayload = { image: null };
      }

      const updateResult = await dispatch(
        updateUserAction({
          user_uuid: selectedUser.user_id,
          org_uuid: organizationUuid,
          name: values.name,
          role: values.role,
          shift_uuid: values.shift,
          designation: values.designation?.trim() || null,
          marital_status: values.marital_status || null,
          employment_type: values.employment_type || null,
          work_mode: values.work_mode || null,
          work_branch: values.work_branch?.trim() || null,
          official_phone: values.official_phone?.trim() || null,
          emergency_contact_name:
            values.emergency_contact_name?.trim() || null,
          emergency_contact_relation:
            values.emergency_contact_relation?.trim() || null,
          emergency_contact_phone:
            values.emergency_contact_phone?.trim() || null,
          guardian_contact_name: values.guardian_contact_name?.trim() || null,
          guardian_contact_relation:
            values.guardian_contact_relation?.trim() || null,
          guardian_contact_phone:
            values.guardian_contact_phone?.trim() || null,
          ...imagePayload,
        })
      );

      if (!updateUserAction.fulfilled.match(updateResult)) {
        return;
      }

      if (pendingCreatedDocumentDrafts.length > 0) {
        for (const draft of pendingCreatedDocumentDrafts) {
          const uploadedUrls: string[] = [];

          for (const file of draft.files) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            const uploadResult: any = await dispatch(
              imageUploadAction(uploadFormData)
            );
            if (uploadResult?.payload?.success && uploadResult?.payload?.url) {
              uploadedUrls.push(uploadResult.payload.url);
            }
          }

          if (uploadedUrls.length === 0) {
            continue;
          }

          await dispatch(
            createUserDocumentAction({
              org_uuid: organizationUuid,
              user_uuid: selectedUser.user_id,
              document_name: draft.name,
              document_number: draft.number || undefined,
              file_url: uploadedUrls[0],
              file_urls: uploadedUrls,
              metadata: {
                uploaded_file_names: draft.files.map((file) => file.name),
              },
            })
          ).unwrap();
        }
      }

      if (pendingDeletedDocumentUuids.length > 0) {
        await Promise.allSettled(
          pendingDeletedDocumentUuids.map((documentUuid) =>
            dispatch(
              deleteUserDocumentAction({
                org_uuid: organizationUuid,
                user_uuid: selectedUser.user_id,
                document_uuid: documentUuid,
              })
            ).unwrap()
          )
        );

      }

      if (
        pendingCreatedDocumentDrafts.length > 0 ||
        pendingDeletedDocumentUuids.length > 0
      ) {
        await loadUserDocuments(selectedUser.user_id);
      }

      setPendingCreatedDocumentDrafts([]);
      setPendingDeletedDocumentUuids([]);

      const selectedRole = roles.find((role: any) => role.uuid === values.role);
      const selectedShift = shifts.find(
        (shift: any) => shift.uuid === values.shift
      );
      const nextImage = uploadedImageUrl || (removeImage ? "" : selectedUser.image);

      const updatedUser: UserInterface = {
        ...selectedUser,
        name: values.name,
        email: values.email,
        designation: values.designation?.trim() || null,
        marital_status: values.marital_status || null,
        employment_type: values.employment_type || null,
        work_mode: values.work_mode || null,
        work_branch: values.work_branch?.trim() || null,
        official_phone: values.official_phone?.trim() || null,
        emergency_contact_name: values.emergency_contact_name?.trim() || null,
        emergency_contact_relation:
          values.emergency_contact_relation?.trim() || null,
        emergency_contact_phone: values.emergency_contact_phone?.trim() || null,
        guardian_contact_name: values.guardian_contact_name?.trim() || null,
        guardian_contact_relation:
          values.guardian_contact_relation?.trim() || null,
        guardian_contact_phone: values.guardian_contact_phone?.trim() || null,
        role: {
          id: String(selectedUser.role?.id || ""),
          uuid: selectedRole?.uuid || selectedUser.role?.uuid || "",
          name: selectedRole?.name || selectedUser.role?.name || "",
          description:
            selectedRole?.description || selectedUser.role?.description || "",
        },
        organization_shift: {
          uuid: selectedShift?.uuid || selectedUser.organization_shift?.uuid || "",
          name: selectedShift?.name || selectedUser.organization_shift?.name || "",
          start_time:
            selectedShift?.start_time || selectedUser.organization_shift?.start_time || "",
          end_time:
            selectedShift?.end_time || selectedUser.organization_shift?.end_time || "",
          effective_hours:
            selectedShift?.effective_hours ||
            selectedUser.organization_shift?.effective_hours ||
            0,
        },
        image: nextImage,
      };

      setSelectedUser(updatedUser);
      setIsEditing(false);
      setImageFile(null);
      setRemoveImage(false);
      setPreviewImage(updatedUser.image || "");
      setHasUnsavedChanges(false);

      dispatch(
        listUserAction({
          org_uuid: organizationUuid,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            search: pagination.search,
          },
        })
      );

      if (currentUser?.user_id === selectedUser.user_id) {
        dispatch(setCurrentUser(updatedUser));
        await update({
          name: updatedUser.name,
          image: updatedUser.image || null,
          role: updatedUser.role,
          organization_shift: updatedUser.organization_shift,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="w-11/12 min-[1400px]:w-3/4 mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>User not found</CardTitle>
            <CardDescription>
              We could not find this user in the selected organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigateWithUnsavedCheck(`/${organizationUuid}/user-management`)}
            >
              <ArrowLeft />
              Back to User Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayedProfileImage = removeImage
    ? ""
    : previewImage || selectedUser.image || "";

  const visibleDocuments = documents.filter(
    (document) => !pendingDeletedDocumentUuids.includes(document.uuid)
  );

  const pendingDeletedDocuments = documents.filter((document) =>
    pendingDeletedDocumentUuids.includes(document.uuid)
  );

  const getDocumentFileUrls = (document: UserDocument): string[] => {
    if (document.file_urls && document.file_urls.length > 0) {
      return document.file_urls;
    }
    if (document.file_url) {
      return [document.file_url];
    }
    return [];
  };

  const getDocumentFileNames = (document: UserDocument): string[] => {
    const metadataValue = document.metadata?.uploaded_file_names;

    if (Array.isArray(metadataValue)) {
      return metadataValue.filter((name) => typeof name === "string");
    }

    if (typeof metadataValue === "string") {
      return metadataValue
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    }

    return [];
  };

  let documentsSection: ReactNode;
  if (isDocumentsLoading) {
    documentsSection = (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="ml-2 text-sm">Loading documents...</span>
      </div>
    );
  } else if (visibleDocuments.length === 0) {
    documentsSection = (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No documents uploaded yet.
      </div>
    );
  } else {
    documentsSection = (
      <div className="grid gap-3">
        {visibleDocuments.map((document) => {
          const fileUrls = getDocumentFileUrls(document);
          const fileNames = getDocumentFileNames(document);
          const metadataEntries = Object.entries(document.metadata || {}).filter(
            ([key]) => key !== "uploaded_file_names"
          );

          return (
            <div
              key={document.uuid}
              className="h-full rounded-xl border border-border/70 bg-card/80 p-4 space-y-3 shadow-xs transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold tracking-tight" style={{wordBreak:"break-word"}}>
                    {document.document_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{wordBreak:"break-word"}}>
                    {document.document_number || "No document number"}
                  </p>
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleDeleteDocument(document.uuid)}
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              {fileUrls.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Attached files
                  </p>
                  <div className="flex flex-col gap-2">
                  {fileUrls.map((url, index) => (
                    <a
                      key={`${document.uuid}-file-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex w-fit max-w-full items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-sm break-all"
                    >
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span>{fileNames[index] || `View file ${index + 1}`}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100" />
                    </a>
                  ))}
                  </div>
                </div>
              )}

              {metadataEntries.length > 0 && (
                <div className="grid gap-1 rounded-md bg-muted/50 p-2.5 text-xs">
                  {metadataEntries.map(([key, value]) => (
                    <p key={`${document.uuid}-${key}`}>
                      <span className="font-medium">{key}:</span>{" "}
                      {Array.isArray(value) ? value.join(", ") : value}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="relative w-11/12 min-[1400px]:w-3/4 mx-auto py-7 space-y-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="details">User Details</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="leaves">Leaves</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="rounded-2xl border border-border/40 bg-linear-to-br from-card to-card/95 p-7 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar
                      className={`h-24 w-24 rounded-2xl border-3 border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                        isEditing ? "cursor-pointer" : ""
                      }`}
                      onClick={handleProfileImageClick}
                    >
                      <AvatarImage
                        src={displayedProfileImage}
                        alt={selectedUser.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-lg font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>

                    {isEditing && Boolean(displayedProfileImage) && (
                      <Button
                        type="button"
                        variant="destructive"
                        className="absolute -right-1 -top-1 size-5 rounded-full p-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          setImageFile(null);
                          setRemoveImage(true);
                          setPreviewImage("");
                        }}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    )}

                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept="image/*"
                      disabled={!isEditing}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                      {selectedUser.name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1.5 font-medium">
                      {selectedUser.email}
                    </p>
                    {isEditing && (
                      <p className="mt-2 text-xs text-muted-foreground italic">
                        💡 Click profile image to upload a new photo
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium hover:bg-primary/15 transition-colors"
                      >
                        <Shield className="mr-1 h-3.5 w-3.5" />
                        {selectedUser.role?.name || "No role"}
                      </Badge>
                      <Badge
                        variant={selectedUser.is_active ? "default" : "outline"}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                          selectedUser.is_active
                            ? "bg-green-100/80 text-green-700 border-green-300/50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-700/30"
                            : "bg-slate-100/80 text-slate-600 border-slate-300/50 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-700/30"
                        }`}
                      >
                        {selectedUser.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        className="rounded-lg px-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="rounded-lg shadow-lg hover:shadow-xl px-6 bg-linear-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 transition-all"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="animate-spin mr-2" />
                        ) : (
                          <Save className="mr-2" />
                        )}
                        Save changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="rounded-lg shadow-lg hover:shadow-xl px-6 bg-linear-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/80 transition-all"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="mr-2" />
                      Edit profile
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="lg:col-span-2 border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Profile information</CardTitle>
                  <CardDescription>
                    View and update user details for this workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/60 dark:bg-slate-900/40 rounded-lg p-1 border border-border/30">
                      <TabsTrigger
                        value="basic"
                        className="rounded-md font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Basic & Employment
                      </TabsTrigger>
                      <TabsTrigger
                        value="contact"
                        className="rounded-md font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Contact
                      </TabsTrigger>
                      <TabsTrigger
                        value="documents"
                        className="rounded-md font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Documents
                      </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: BASIC & EMPLOYMENT DETAILS */}
                    <TabsContent value="basic" className="space-y-4">
                      <div className="rounded-2xl border border-border/40 bg-linear-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/30 dark:to-slate-900/20 p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-base font-bold text-foreground">
                            Basic details
                          </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input
                              {...register("name")}
                              disabled={!isEditing}
                              placeholder="Enter full name"
                            />
                            {errors.name && (
                              <FieldError>{errors.name.message}</FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input
                              {...register("email")}
                              disabled
                              placeholder="Enter email"
                            />
                            {errors.email && (
                              <FieldError>{errors.email.message}</FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel>Role</FieldLabel>
                            <Select
                              value={watchedRole}
                              disabled={!isEditing}
                              onValueChange={(value) =>
                                setValue("role", value, {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles?.map((role: any) => (
                                  <SelectItem key={role.uuid} value={role.uuid}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.role && (
                              <FieldError>{errors.role.message}</FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel>Shift</FieldLabel>
                            <Select
                              value={watchedShift}
                              disabled={!isEditing}
                              onValueChange={(value) =>
                                setValue("shift", value, {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select shift" />
                              </SelectTrigger>
                              <SelectContent>
                                {shifts?.map((shift: any) => (
                                  <SelectItem
                                    key={shift.uuid}
                                    value={shift.uuid}
                                  >
                                    {shift.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.shift && (
                              <FieldError>{errors.shift.message}</FieldError>
                            )}
                          </Field>
                        </div>

                        <div className="border-t border-border/40 pt-7 mt-7">
                          <div className="mb-5 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-950/30">
                              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-base font-bold text-foreground">
                              Employment details
                            </p>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field>
                              <FieldLabel>Designation / Job Title</FieldLabel>
                              <Input
                                {...register("designation")}
                                disabled={!isEditing}
                                placeholder="e.g. Senior Software Engineer"
                              />
                              {errors.designation && (
                                <FieldError>
                                  {errors.designation.message}
                                </FieldError>
                              )}
                            </Field>

                            <Field>
                              <FieldLabel>Marital Status</FieldLabel>
                              <Select
                                value={watch("marital_status") || ""}
                                disabled={!isEditing}
                                onValueChange={(value) =>
                                  setValue(
                                    "marital_status",
                                    value as
                                      | "single"
                                      | "married"
                                      | "divorced"
                                      | "widowed",
                                    { shouldValidate: true },
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select marital status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single">Single</SelectItem>
                                  <SelectItem value="married">
                                    Married
                                  </SelectItem>
                                  <SelectItem value="divorced">
                                    Divorced
                                  </SelectItem>
                                  <SelectItem value="widowed">
                                    Widowed
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.marital_status && (
                                <FieldError>
                                  {errors.marital_status.message}
                                </FieldError>
                              )}
                            </Field>

                            <Field>
                              <FieldLabel>Employment Type</FieldLabel>
                              <Select
                                value={watch("employment_type") || ""}
                                disabled={!isEditing}
                                onValueChange={(value) =>
                                  setValue(
                                    "employment_type",
                                    value as
                                      | "full_time"
                                      | "intern"
                                      | "contract",
                                    { shouldValidate: true },
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select employment type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="full_time">
                                    Full-time
                                  </SelectItem>
                                  <SelectItem value="intern">Intern</SelectItem>
                                  <SelectItem value="contract">
                                    Contract
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.employment_type && (
                                <FieldError>
                                  {errors.employment_type.message}
                                </FieldError>
                              )}
                            </Field>

                            <Field>
                              <FieldLabel>Work Location Mode</FieldLabel>
                              <Select
                                value={watch("work_mode") || ""}
                                disabled={!isEditing}
                                onValueChange={(value) =>
                                  setValue(
                                    "work_mode",
                                    value as "office" | "remote" | "hybrid",
                                    { shouldValidate: true },
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select work mode" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="office">Office</SelectItem>
                                  <SelectItem value="remote">Remote</SelectItem>
                                  <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.work_mode && (
                                <FieldError>
                                  {errors.work_mode.message}
                                </FieldError>
                              )}
                            </Field>

                            <Field>
                              <FieldLabel>Work Branch</FieldLabel>
                              <Input
                                {...register("work_branch")}
                                disabled={!isEditing}
                                placeholder="e.g. Bangalore HQ"
                              />
                              {errors.work_branch && (
                                <FieldError>
                                  {errors.work_branch.message}
                                </FieldError>
                              )}
                            </Field>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* TAB 2: CONTACT DETAILS */}
                    <TabsContent value="contact" className="space-y-4">
                      <div className="rounded-2xl border border-border/40 bg-linear-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/30 dark:to-slate-900/20 p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-100/50 dark:bg-green-950/30">
                            <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-base font-bold text-foreground">
                            Contact information
                          </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field>
                            <FieldLabel>Official Phone Number</FieldLabel>
                            <Input
                              {...register("official_phone")}
                              disabled={!isEditing}
                              placeholder="+91 98XXXXXXXX"
                            />
                            {errors.official_phone && (
                              <FieldError>
                                {errors.official_phone.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel>Emergency Contact Name</FieldLabel>
                            <Input
                              {...register("emergency_contact_name")}
                              disabled={!isEditing}
                              placeholder="Contact person name"
                            />
                            {errors.emergency_contact_name && (
                              <FieldError>
                                {errors.emergency_contact_name.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel>Emergency Contact Relation</FieldLabel>
                            <Input
                              {...register("emergency_contact_relation")}
                              disabled={!isEditing}
                              placeholder="e.g. Spouse / Father"
                            />
                            {errors.emergency_contact_relation && (
                              <FieldError>
                                {errors.emergency_contact_relation.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel>Emergency Contact Phone</FieldLabel>
                            <Input
                              {...register("emergency_contact_phone")}
                              disabled={!isEditing}
                              placeholder="+91 98XXXXXXXX"
                            />
                            {errors.emergency_contact_phone && (
                              <FieldError>
                                {errors.emergency_contact_phone.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel>Guardian Contact Name</FieldLabel>
                            <Input
                              {...register("guardian_contact_name")}
                              disabled={!isEditing}
                              placeholder="Guardian name"
                            />
                            {errors.guardian_contact_name && (
                              <FieldError>
                                {errors.guardian_contact_name.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel>Guardian Contact Relation</FieldLabel>
                            <Input
                              {...register("guardian_contact_relation")}
                              disabled={!isEditing}
                              placeholder="e.g. Mother / Father"
                            />
                            {errors.guardian_contact_relation && (
                              <FieldError>
                                {errors.guardian_contact_relation.message}
                              </FieldError>
                            )}
                          </Field>

                          <Field>
                            <FieldLabel>Guardian Contact Phone</FieldLabel>
                            <Input
                              {...register("guardian_contact_phone")}
                              disabled={!isEditing}
                              placeholder="+91 98XXXXXXXX"
                            />
                            {errors.guardian_contact_phone && (
                              <FieldError>
                                {errors.guardian_contact_phone.message}
                              </FieldError>
                            )}
                          </Field>
                        </div>
                      </div>
                    </TabsContent>

                    {/* TAB 3: DOCUMENTS */}
                    <TabsContent value="documents" className="space-y-4">
                      <div className="rounded-2xl border border-border/40 bg-linear-to-br from-slate-50/80 to-slate-50/40 dark:from-slate-900/30 dark:to-slate-900/20 p-6 space-y-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100/50 dark:bg-purple-950/30">
                            <FilePlus2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-base font-bold text-foreground">
                            Employee documents
                          </p>
                        </div>

                        {isEditing && (
                          <>
                            {(pendingCreatedDocumentDrafts.length > 0 ||
                              pendingDeletedDocumentUuids.length > 0) && (
                              <div className="rounded-lg border border-amber-300/50 bg-amber-50/70 px-3 py-2 text-xs text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-200">
                                Pending changes:{" "}
                                {pendingCreatedDocumentDrafts.length} new
                                document(s) and{" "}
                                {pendingDeletedDocumentUuids.length} delete(s).
                                These will be permanently applied only after
                                Save changes.
                              </div>
                            )}

                            {pendingCreatedDocumentDrafts.length > 0 && (
                              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10 p-3 space-y-2">
                                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                  Added documents (local queue)
                                </p>
                                <div className="space-y-2">
                                  {pendingCreatedDocumentDrafts.map(
                                    (queuedDoc) => (
                                      <div
                                        key={queuedDoc.id}
                                        className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200/60 bg-background/70 px-3 py-2 dark:border-emerald-800/40"
                                      >
                                        <div className="min-w-0 space-y-0.5">
                                          <p className="text-sm font-medium text-foreground truncate">
                                            {queuedDoc.name}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {queuedDoc.number?.trim()
                                              ? `No: ${queuedDoc.number.trim()} • `
                                              : ""}
                                            {queuedDoc.files.length} file(s)
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2 self-center">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 rounded-md px-3 text-xs"
                                            onClick={() =>
                                              editQueuedDocumentDraft(
                                                queuedDoc.id,
                                              )
                                            }
                                          >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 rounded-md px-3 text-xs"
                                            onClick={() =>
                                              removeQueuedDocumentDraft(
                                                queuedDoc.id,
                                              )
                                            }
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Remove
                                          </Button>
                                          <Badge className="shrink-0 rounded-full border border-emerald-300/70 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/40 dark:text-emerald-300">
                                            ✓ Added
                                          </Badge>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {pendingDeletedDocuments.length > 0 && (
                              <div className="rounded-xl border border-red-200/60 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/10 p-3 space-y-2">
                                <p className="text-xs font-semibold text-red-800 dark:text-red-300">
                                  Deleted documents (pending)
                                </p>
                                <div className="space-y-2">
                                  {pendingDeletedDocuments.map((deletedDoc) => (
                                    <div
                                      key={deletedDoc.uuid}
                                      className="flex items-start justify-between gap-3 rounded-lg border border-red-200/60 bg-background/70 px-3 py-2 dark:border-red-800/40"
                                    >
                                      <div className="min-w-0 space-y-0.5">
                                        <p className="text-sm font-medium text-foreground truncate">
                                          {deletedDoc.document_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {deletedDoc.document_number ||
                                            "No document number"}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 self-center">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-8 rounded-md px-3 text-xs"
                                          onClick={() =>
                                            recoverDeletedDocument(
                                              deletedDoc.uuid,
                                            )
                                          }
                                        >
                                          <Undo2 className="h-3.5 w-3.5" />
                                          Recover
                                        </Button>
                                        <Badge className="shrink-0 rounded-full border border-red-300/70 bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:border-red-700/60 dark:bg-red-900/40 dark:text-red-300">
                                          Deleted
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  Document entries
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg"
                                  onClick={addDocumentDraft}
                                >
                                  <FilePlus2 className="h-4 w-4" />
                                  Add document
                                </Button>
                              </div>

                              {documentDrafts.map((draft, index) => (
                                <div
                                  key={draft.id}
                                  className="rounded-xl border border-border/70 bg-card/90 p-3.5 space-y-3 shadow-xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium">
                                        Document {index + 1}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-md px-3 text-xs"
                                        onClick={() =>
                                          handleAddDocumentToQueue(index)
                                        }
                                      >
                                        <FilePlus2 className="h-4 w-4" />
                                        Add
                                      </Button>
                                      {documentDrafts.length > 1 && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-8 rounded-md px-3 text-xs"
                                          onClick={() =>
                                            removeDocumentDraft(index)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Remove
                                        </Button>
                                      )}
                                      {addedDocumentIndices.has(index) && (
                                        <Badge className="rounded-full border border-emerald-300/70 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/40 dark:text-emerald-300">
                                          ✓ Added
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {documentValidationErrors[index] && (
                                    <div className="rounded-lg bg-red-50/70 border border-red-200/50 dark:bg-red-950/20 dark:border-red-700/30 p-2.5">
                                      <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                                        {documentValidationErrors[index]}
                                      </p>
                                    </div>
                                  )}

                                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Field>
                                      <FieldLabel>Document Name</FieldLabel>
                                      <Input
                                        value={draft.name}
                                        onChange={(event) =>
                                          updateDocumentDraft(
                                            index,
                                            "name",
                                            event.target.value,
                                          )
                                        }
                                        maxLength={DOCUMENT_NAME_MAX_LENGTH}
                                        placeholder="e.g. Passport"
                                        className={
                                          documentValidationErrors[index]
                                            ? "border-red-500"
                                            : ""
                                        }
                                      />
                                    </Field>
                                    <Field>
                                      <FieldLabel>Document Number</FieldLabel>
                                      <Input
                                        value={draft.number}
                                        onChange={(event) =>
                                          updateDocumentDraft(
                                            index,
                                            "number",
                                            event.target.value,
                                          )
                                        }
                                        maxLength={DOCUMENT_NUMBER_MAX_LENGTH}
                                        placeholder="Number"
                                      />
                                    </Field>
                                    <Field className="md:col-span-2 lg:col-span-2">
                                      <FieldLabel>Upload Files</FieldLabel>
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,application/pdf"
                                        onChange={(event) =>
                                          updateDocumentDraftFiles(
                                            index,
                                            Array.from(
                                              event.target.files || [],
                                            ),
                                          )
                                        }
                                        className={`file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/15 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-10 w-full min-w-0 rounded-lg border bg-background/60 px-3 py-1.5 shadow-xs outline-none text-sm ${
                                          documentValidationErrors[index]
                                            ? "border-red-500"
                                            : ""
                                        }`}
                                      />
                                      {draft.files.length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                          {draft.files.length} file(s) selected
                                        </p>
                                      )}
                                    </Field>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {documentsSection}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Dashboard
              organization_uuid={organizationUuid}
              email={currentUser?.email || ""}
              targetUserId={selectedUser.user_id}
              targetUserName={selectedUser.name}
              targetUserEmail={selectedUser.email}
            />
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
           <div>leaves</div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone. The document will be permanently removed when you save
              changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
