"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  ExternalLink,
  FilePlus2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Pencil,
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
import { toastError } from "@/shared/toast/toast-error";

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
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [pendingDeletedDocumentUuids, setPendingDeletedDocumentUuids] =
    useState<string[]>([]);
  const [pendingCreatedDocumentDrafts, setPendingCreatedDocumentDrafts] =
    useState<DocumentDraft[]>([]);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [isDocumentSubmitting, setIsDocumentSubmitting] = useState(false);
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

  const addDocumentDraft = () => {
    setDocumentDrafts((prev) => [...prev, createDocumentDraft()]);
  };

  const removeDocumentDraft = (index: number) => {
    setDocumentDrafts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateDocumentDraft = (
    index: number,
    field: "name" | "number",
    value: string
  ) => {
    const maxLength =
      field === "name" ? DOCUMENT_NAME_MAX_LENGTH : DOCUMENT_NUMBER_MAX_LENGTH;

    setDocumentDrafts((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value.trimStart().slice(0, maxLength) } : item
      )
    );
  };

  const updateDocumentDraftFiles = (index: number, files: File[]) => {
    setDocumentDrafts((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, files } : item))
    );
  };

  const resetDocumentForm = () => {
    setDocumentDrafts([createDocumentDraft()]);
  };

  const hasSubmittableDocuments = documentDrafts.some(
    (draft) => draft.name.trim() && draft.files.length > 0
  );

  const handleAddDocument = async () => {
    if (!selectedUser || !hasSubmittableDocuments) return;

    const draftsToQueue = documentDrafts.filter(
      (draft) => draft.name.trim() && draft.files.length > 0
    );
    if (draftsToQueue.length === 0) return;

    setIsDocumentSubmitting(true);
    try {
      const normalizedDrafts: DocumentDraft[] = [];

      for (const draft of draftsToQueue) {
        const trimmedName = draft.name.trim();
        const trimmedNumber = draft.number.trim();

        if (trimmedName.length === 0 || trimmedName.length > DOCUMENT_NAME_MAX_LENGTH) {
          toastError(
            `Document name is required and must be at most ${DOCUMENT_NAME_MAX_LENGTH} characters.`
          );
          return;
        }

        if (
          trimmedNumber.length > 0 &&
          trimmedNumber.length > DOCUMENT_NUMBER_MAX_LENGTH
        ) {
          toastError(
            `Document number must be at most ${DOCUMENT_NUMBER_MAX_LENGTH} characters.`
          );
          return;
        }

        normalizedDrafts.push({
          id: crypto.randomUUID(),
          name: trimmedName,
          number: trimmedNumber,
          files: draft.files,
        });
      }

      if (normalizedDrafts.length > 0) {
        setPendingCreatedDocumentDrafts((prev) => [...prev, ...normalizedDrafts]);
      }

      resetDocumentForm();
    } finally {
      setIsDocumentSubmitting(false);
    }
  };

  const handleDeleteDocument = (documentUuid: string) => {
    setPendingDeletedDocumentUuids((prev) => {
      if (prev.includes(documentUuid)) return prev;
      return [...prev, documentUuid];
    });
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
              onClick={() => router.push(`/${organizationUuid}/user-management`)}
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
              className="rounded-xl border border-border/70 bg-card/80 p-4 space-y-3 shadow-xs transition-all hover:shadow-md hover:border-primary/30"
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
    <div className="relative overflow-hidden bg-linear-to-b from-background via-background to-muted/20">
      <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative w-11/12 min-[1400px]:w-3/4 mx-auto py-7 space-y-6">
      <div className="rounded-2xl border border-border/70 bg-linear-to-br from-card/95 via-card to-muted/60 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                className={`h-24 w-24 rounded-2xl border-2 border-primary/20 shadow-md ${
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
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {selectedUser.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">{selectedUser.email}</p>
              {isEditing && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Click profile image to upload a new photo.
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-md border border-border/60 bg-muted/70 px-2.5 py-1">
                  <Shield className="mr-1 h-3.5 w-3.5" />
                  {selectedUser.role?.name || "No role"}
                </Badge>
                <Badge
                  variant={selectedUser.is_active ? "default" : "outline"}
                  className="rounded-md px-2.5 py-1"
                >
                  {selectedUser.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" className="rounded-lg" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button className="rounded-lg shadow-sm" onClick={handleSubmit(onSubmit)} disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                  Save changes
                </Button>
              </>
            ) : (
              <Button className="rounded-lg shadow-sm" onClick={() => setIsEditing(true)}>
                <Pencil />
                Edit profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Profile information</CardTitle>
            <CardDescription>
              View and update user details for this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Basic details</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  {...register("name")}
                  disabled={!isEditing}
                  placeholder="Enter full name"
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  {...register("email")}
                  disabled
                  placeholder="Enter email"
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select
                  value={watchedRole}
                  disabled={!isEditing}
                  onValueChange={(value) =>
                    setValue("role", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
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
                {errors.role && <FieldError>{errors.role.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Shift</FieldLabel>
                <Select
                  value={watchedShift}
                  disabled={!isEditing}
                  onValueChange={(value) =>
                    setValue("shift", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts?.map((shift: any) => (
                      <SelectItem key={shift.uuid} value={shift.uuid}>
                        {shift.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shift && <FieldError>{errors.shift.message}</FieldError>}
              </Field>
            </div>

            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Employment details</p>
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
                    <FieldError>{errors.designation.message}</FieldError>
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
                        value as "single" | "married" | "divorced" | "widowed",
                        { shouldValidate: true }
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.marital_status && (
                    <FieldError>{errors.marital_status.message}</FieldError>
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
                        value as "full_time" | "intern" | "contract",
                        { shouldValidate: true }
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.employment_type && (
                    <FieldError>{errors.employment_type.message}</FieldError>
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
                        { shouldValidate: true }
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.work_mode && (
                    <FieldError>{errors.work_mode.message}</FieldError>
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
                    <FieldError>{errors.work_branch.message}</FieldError>
                  )}
                </Field>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Contact details</p>
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
                    <FieldError>{errors.official_phone.message}</FieldError>
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
                    <FieldError>{errors.emergency_contact_name.message}</FieldError>
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
                    <FieldError>{errors.emergency_contact_phone.message}</FieldError>
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
                    <FieldError>{errors.guardian_contact_name.message}</FieldError>
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
                    <FieldError>{errors.guardian_contact_phone.message}</FieldError>
                  )}
                </Field>
              </div>
            </div>

          
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Account summary</CardTitle>
            <CardDescription>Read-only user workspace metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>User ID</span>
            </div>
            <p className="font-medium break-all rounded-md bg-muted/40 px-2.5 py-1.5">{selectedUser.user_id}</p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Organization</span>
            </div>
            <p className="font-medium break-all rounded-md bg-muted/40 px-2.5 py-1.5">{organizationUuid}</p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <p className="font-medium break-all rounded-md bg-muted/40 px-2.5 py-1.5">{selectedUser.email}</p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Designation</span>
            </div>
            <p className="font-medium break-all rounded-md bg-muted/40 px-2.5 py-1.5">
              {selectedUser.designation || "-"}
            </p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Marital Status</span>
            </div>
            <p className="font-medium break-all rounded-md bg-muted/40 px-2.5 py-1.5 capitalize">
              {selectedUser.marital_status || "-"}
            </p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Work Location</span>
            </div>
            <p className="font-medium break-all rounded-md bg-muted/40 px-2.5 py-1.5">
              {[selectedUser.work_mode, selectedUser.work_branch]
                .filter(Boolean)
                .join(" • ") || "-"}
            </p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>Official Phone</span>
            </div>
            <p className="font-medium break-all rounded-md bg-muted/40 px-2.5 py-1.5">
              {selectedUser.official_phone || "-"}
            </p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Emergency Contact</span>
            </div>
            <p className="font-medium break-all rounded-md bg-muted/40 px-2.5 py-1.5">
              {selectedUser.emergency_contact_name || "-"}
              {selectedUser.emergency_contact_relation
                ? ` (${selectedUser.emergency_contact_relation})`
                : ""}
              {selectedUser.emergency_contact_phone
                ? ` • ${selectedUser.emergency_contact_phone}`
                : ""}
            </p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Guardian Contact</span>
            </div>
            <p className="font-medium break-all rounded-md bg-muted/40 px-2.5 py-1.5">
              {selectedUser.guardian_contact_name || "-"}
              {selectedUser.guardian_contact_relation
                ? ` (${selectedUser.guardian_contact_relation})`
                : ""}
              {selectedUser.guardian_contact_phone
                ? ` • ${selectedUser.guardian_contact_phone}`
                : ""}
            </p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined</span>
            </div>
            <p className="font-medium rounded-md bg-muted/40 px-2.5 py-1.5">
              {selectedUser.created_at
                ? new Date(selectedUser.created_at).toLocaleString()
                : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Employee documents
          </CardTitle>
          <CardDescription>
            Add documents now and permanently save them using Save changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && (
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-4">
              {(pendingCreatedDocumentDrafts.length > 0 ||
                pendingDeletedDocumentUuids.length > 0) && (
                <div className="rounded-lg border border-amber-300/50 bg-amber-50/70 px-3 py-2 text-xs text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-200">
                  Pending changes: {pendingCreatedDocumentDrafts.length} new
                  document(s) and {pendingDeletedDocumentUuids.length} delete(s).
                  These will be permanently applied only after Save changes.
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Document entries</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={addDocumentDraft}
                  >
                    <FilePlus2 className="h-4 w-4" />
                    Add another document
                  </Button>
                </div>

                {documentDrafts.map((draft, index) => (
                  <div
                    key={draft.id}
                    className="rounded-xl border border-border/70 bg-card/90 p-3.5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Document {index + 1}</p>
                      {documentDrafts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-md"
                          onClick={() => removeDocumentDraft(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Field>
                        <FieldLabel>Document Name</FieldLabel>
                        <Input
                          value={draft.name}
                          onChange={(event) =>
                            updateDocumentDraft(index, "name", event.target.value)
                          }
                          maxLength={DOCUMENT_NAME_MAX_LENGTH}
                          placeholder="e.g. Passport"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Document Number</FieldLabel>
                        <Input
                          value={draft.number}
                          onChange={(event) =>
                            updateDocumentDraft(index, "number", event.target.value)
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
                              Array.from(event.target.files || [])
                            )
                          }
                          className="file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/15 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-10 w-full min-w-0 rounded-lg border bg-background/60 px-3 py-1.5 shadow-xs outline-none text-sm"
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

              <div className="flex justify-end">
                <Button
                  className="rounded-lg shadow-sm"
                  type="button"
                  onClick={handleAddDocument}
                  disabled={isDocumentSubmitting || !hasSubmittableDocuments}
                >
                  {isDocumentSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FilePlus2 className="h-4 w-4" />
                  )}
                  Add to save queue
                </Button>
              </div>
            </div>
          )}

          {documentsSection}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
