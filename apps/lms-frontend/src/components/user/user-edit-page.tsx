"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Pencil, Save, Shield, X, Camera, Upload, Scan, Edit as EditIcon, Trash2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAppDispatch, useAppSelector } from "@/store";
import { getOrganizationRolesAction } from "@/features/role/role.action";
import { listOrganizationShiftsAction } from "@/features/shift/shift.action";
import { imageUploadAction } from "@/features/image-upload/image-upload.action";
import {
  createUserDocumentAction,
  deleteUserDocumentAction,
  getOrganizationUserAction,
  listUserAction,
  updateUserAction,
} from "@/features/user/user.action";
import { setCurrentUser, UserInterface } from "@/features/user/user.slice";
import Dashboard from "@/components/dashboard/dashboard";
import LeaveRequest from "../leave-request";
import UserEditPageProfileTabs from "./user-edit-page-profile-tabs";
import UserEditPageDocumentsTab from "./user-edit-page-documents-tab";
import {
  createDocumentDraft,
  DOCUMENT_NAME_MAX_LENGTH,
  DOCUMENT_NUMBER_MAX_LENGTH,
  editUserSchema,
  type DocumentDraft,
  type EditUserFormData,
  type UserDetailPageProps,
} from "./user-edit-page.types";
import { hasPermissions } from "@/lib/haspermissios";


export default function UserDetailPage({
  organizationUuid,
  userUuid,
}: Readonly<UserDetailPageProps>) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { update } = useSession();

  const roles = useAppSelector((state) => state.rolesSlice.roles);
  const shifts = useAppSelector((state) => state.shiftSlice.shifts);
  const { currentUser ,selectedUser  } = useAppSelector(
    (state) => state.userSlice,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [documentValidationErrors, setDocumentValidationErrors] = useState<
    Record<number, { name?: string; files?: string }>
  >({});
  const [documentValidationAttempted, setDocumentValidationAttempted] = useState<
    Set<number>
  >(new Set());
  const [addedDocumentIndices, setAddedDocumentIndices] = useState<Set<number>>(
    new Set(),
  );
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [pendingDeletedDocumentUuids, setPendingDeletedDocumentUuids] =
    useState<string[]>([]);
  const [pendingCreatedDocumentDrafts, setPendingCreatedDocumentDrafts] =
    useState<DocumentDraft[]>([]);
  const [documentDrafts, setDocumentDrafts] = useState<DocumentDraft[]>([
    createDocumentDraft(),
  ]);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );

  // Photo modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [wantsToChangeImage, setWantsToChangeImage] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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



  useEffect(() => {
    const fetchData = async () => {
        await Promise.all([
          dispatch(getOrganizationRolesAction({ org_uuid: organizationUuid })),
          dispatch(
            listOrganizationShiftsAction({ org_uuid: organizationUuid }),
          ),
        ]);
        const activeUser = selectedUser;

        if (activeUser) {
          setPreviewImage(activeUser.image || "");
          reset({
            name: activeUser.name,
            email: activeUser.email,
            role: activeUser.role?.uuid || "",
            shift: activeUser.organization_shift?.uuid || "",
            marital_status: activeUser.personal_information?.marital_status || undefined,
            employment_type: activeUser.personal_information?.employment_type || undefined,
            work_mode: activeUser.personal_information?.work_mode || undefined,
            work_branch: activeUser.personal_information?.work_branch || "",
            official_phone: activeUser.personal_information?.official_phone || "",
            emergency_contact_name: activeUser.personal_information?.emergency_contact_name || "",
            emergency_contact_relation:
              activeUser.personal_information?.emergency_contact_relation || "",
            emergency_contact_phone: activeUser.personal_information?.emergency_contact_phone || "",
            guardian_contact_name: activeUser.personal_information?.guardian_contact_name || "",
            guardian_contact_relation:
              activeUser.personal_information?.guardian_contact_relation || "",
            guardian_contact_phone: activeUser.personal_information?.guardian_contact_phone || "",
          });
        }
    };

    fetchData();
  }, [organizationUuid, reset ,selectedUser]);

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
      formValues.marital_status !==
        (selectedUser.personal_information?.marital_status || undefined) ||
      formValues.employment_type !==
        (selectedUser.personal_information?.employment_type || undefined) ||
      formValues.work_mode !== (selectedUser.personal_information?.work_mode || undefined) ||
      formValues.work_branch !== (selectedUser.personal_information?.work_branch || "") ||
      formValues.official_phone !== (selectedUser.personal_information?.official_phone || "") ||
      formValues.emergency_contact_name !==
        (selectedUser.personal_information?.emergency_contact_name || "") ||
      formValues.emergency_contact_relation !==
        (selectedUser.personal_information?.emergency_contact_relation || "") ||
      formValues.emergency_contact_phone !==
        (selectedUser.personal_information?.emergency_contact_phone || "") ||
      formValues.guardian_contact_name !==
        (selectedUser.personal_information?.guardian_contact_name || "") ||
      formValues.guardian_contact_relation !==
        (selectedUser.personal_information?.guardian_contact_relation || "") ||
      formValues.guardian_contact_phone !==
        (selectedUser.personal_information?.guardian_contact_phone || "");

    const hasImageChanges = imageFile !== null || removeImage;
    const hasDocumentChanges =
      pendingDeletedDocumentUuids.length > 0 ||
      pendingCreatedDocumentDrafts.length > 0;

    setHasUnsavedChanges(
      hasFormChanges || hasImageChanges || hasDocumentChanges,
    );
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
        "⚠️ You have unsaved changes!\n\nIf you leave this page, your changes will be lost.\n\nAre you sure you want to leave?",
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
            "⚠️ You have unsaved changes!\n\nIf you leave this page, your changes will be lost.\n\nAre you sure you want to leave?",
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

  useEffect(() => {
    if (!hasInitialFetch && userUuid && organizationUuid) {
      setIsLoadingUser(true);
      dispatch(getOrganizationUserAction({ user_uuid: userUuid, org_uuid: organizationUuid })).finally(() => {
        setIsLoadingUser(false);
      });
      setHasInitialFetch(true);
    }
  }, [userUuid, organizationUuid, dispatch, hasInitialFetch]);


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
      marital_status: selectedUser.personal_information?.marital_status || undefined,
      employment_type: selectedUser.personal_information?.employment_type || undefined,
      work_mode: selectedUser.personal_information?.work_mode || undefined,
      work_branch: selectedUser.personal_information?.work_branch || "",
      official_phone: selectedUser.personal_information?.official_phone || "",
      emergency_contact_name: selectedUser.personal_information?.emergency_contact_name || "",
      emergency_contact_relation: selectedUser.personal_information?.emergency_contact_relation || "",
      emergency_contact_phone: selectedUser.personal_information?.emergency_contact_phone || "",
      guardian_contact_name: selectedUser.personal_information?.guardian_contact_name || "",
      guardian_contact_relation: selectedUser.personal_information?.guardian_contact_relation || "",
      guardian_contact_phone: selectedUser.personal_information?.guardian_contact_phone || "",
    });
  };

  const handleProfileImageClick = () => {
    if (!isEditing) return;
    setIsPhotoModalOpen(true);
  };

  // Camera and photo handling functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
        setShowCamera(false);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowCamera(true);
    startCamera();
  };

  const removePhoto = () => {
    setCapturedImage(null);
    setShowCamera(false);
    stopCamera();
  };

  const handlePhotoModalClose = () => {
    stopCamera();
    setIsPhotoModalOpen(false);
    setShowCamera(false);
    setCapturedImage(null);
    setWantsToChangeImage(false);
    setRemoveExistingImage(false);
  };

  const handleConfirmPhoto = () => {
    if (capturedImage) {
      // Convert base64 data URL to File object
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "captured-photo.jpg", {
            type: "image/jpeg",
          });
          setImageFile(file);
          setRemoveImage(false);
          setPreviewImage(capturedImage);
          handlePhotoModalClose();
        })
        .catch((error) => {
          console.error("Error converting image to file:", error);
        });
    }
  };

  const navigateWithUnsavedCheck = (path: string) => {
    if (hasUnsavedChanges) {
      const confirmLeave = globalThis.confirm(
        "⚠️ You have unsaved changes!\n\nIf you leave this page, your changes will be lost.\n\nAre you sure you want to leave?",
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
      prev.filter((draft) => draft.id !== draftId),
    );
  };

  const editQueuedDocumentDraft = (draftId: string) => {
    const queuedDraft = pendingCreatedDocumentDrafts.find(
      (draft) => draft.id === draftId,
    );

    if (!queuedDraft) return;

    const draftForEdit: DocumentDraft = {
      id: crypto.randomUUID(),
      name: queuedDraft.name,
      number: queuedDraft.number,
      files: queuedDraft.files,
    };

    setPendingCreatedDocumentDrafts((prev) =>
      prev.filter((draft) => draft.id !== draftId),
    );

    setDocumentDrafts((prev) => {
      const emptyDraftIndex = prev.findIndex(
        (draft) =>
          draft.name.trim().length === 0 &&
          draft.number.trim().length === 0 &&
          draft.files.length === 0,
      );

      if (emptyDraftIndex === -1) {
        return [...prev, draftForEdit];
      }

      return prev.map((draft, index) =>
        index === emptyDraftIndex ? draftForEdit : draft,
      );
    });
  };

  const updateDocumentDraft = (
    index: number,
    field: "name" | "number",
    value: string,
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
      prev.map((item, idx) => (idx === index ? nextDraft : item)),
    );

    if (documentValidationAttempted.has(index)) {
      const error = validateDocumentDraft(nextDraft);
      
      if (error) {
        setDocumentValidationErrors((prev) => ({
          ...prev,
          [index]: error,
        }));
      } else {
        setDocumentValidationErrors((prev) => {
          if (!(index in prev)) return prev;
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    }
  };

  const updateDocumentDraftFiles = (index: number, files: File[]) => {
    const currentDraft = documentDrafts[index];
    if (!currentDraft) return;

    const nextDraft = { 
      ...currentDraft, 
      files: files && files.length > 0 ? files : [] 
    };

    setDocumentDrafts((prev) =>
      prev.map((item, idx) => (idx === index ? nextDraft : item)),
    );

    if (documentValidationAttempted.has(index)) {
      const error = validateDocumentDraft(nextDraft);
      
      if (error) {
        setDocumentValidationErrors((prev) => ({
          ...prev,
          [index]: error,
        }));
      } else {
        setDocumentValidationErrors((prev) => {
          if (!(index in prev)) return prev;
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    }
  };

  const validateDocumentDraft = (draft: DocumentDraft): { name?: string; files?: string } | null => {
    const trimmedName = draft.name.trim();
    const trimmedNumber = draft.number.trim();
    const errors: { name?: string; files?: string } = {};

    if (trimmedName.length === 0) {
      errors.name = "Document name is required";
    } else if (trimmedName.length > DOCUMENT_NAME_MAX_LENGTH) {
      errors.name = `Document name must be at most ${DOCUMENT_NAME_MAX_LENGTH} characters`;
    }

    if (
      trimmedNumber.length > 0 &&
      trimmedNumber.length > DOCUMENT_NUMBER_MAX_LENGTH
    ) {
      errors.name = `Document number must be at most ${DOCUMENT_NUMBER_MAX_LENGTH} characters`;
    }

    if (draft.files.length === 0) {
      errors.files = "Please select at least one file";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleAddDocumentToQueue = (index: number) => {
    const draft = documentDrafts[index];
    if (!draft) return;

    // Mark this draft as attempted (enable validation on field change)
    setDocumentValidationAttempted((prev) => new Set([...prev, index]));

    const error = validateDocumentDraft(draft);
    if (error) {
      setDocumentValidationErrors((prev) => ({
        ...prev,
        [index]: error,
      }));
      return;
    }

    setDocumentValidationErrors((prev) => {
      if (!(index in prev)) return prev;
      const next = { ...prev };
      delete next[index];
      return next;
    });

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
      prev.map((item, idx) => (idx === index ? createDocumentDraft() : item)),
    );

    // Clear validation attempted flag for this index so next document validates on Add click
    setDocumentValidationAttempted((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
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
      prev.filter((uuid) => uuid !== documentUuid),
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
          marital_status: values.marital_status || null,
          employment_type: values.employment_type || null,
          work_mode: values.work_mode || null,
          work_branch: values.work_branch?.trim() || null,
          official_phone: values.official_phone?.trim() || null,
          emergency_contact_name: values.emergency_contact_name?.trim() || null,
          emergency_contact_relation:
            values.emergency_contact_relation?.trim() || null,
          emergency_contact_phone:
            values.emergency_contact_phone?.trim() || null,
          guardian_contact_name: values.guardian_contact_name?.trim() || null,
          guardian_contact_relation:
            values.guardian_contact_relation?.trim() || null,
          guardian_contact_phone: values.guardian_contact_phone?.trim() || null,
          ...imagePayload,
        }),
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
              imageUploadAction(uploadFormData),
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
            }),
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
              }),
            ).unwrap(),
          ),
        );
      }

      setPendingCreatedDocumentDrafts([]);
      setPendingDeletedDocumentUuids([]);

      const selectedRole = roles.find((role: any) => role.uuid === values.role);
      const selectedShift = shifts.find(
        (shift: any) => shift.uuid === values.shift,
      );
      const nextImage =
        uploadedImageUrl || (removeImage ? "" : selectedUser.image);

      const updatedUser = {
        ...selectedUser,
        name: values.name,
        email: values.email,
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
          uuid:
            selectedShift?.uuid || selectedUser.organization_shift?.uuid || "",
          name:
            selectedShift?.name || selectedUser.organization_shift?.name || "",
          start_time:
            selectedShift?.start_time ||
            selectedUser.organization_shift?.start_time ||
            "",
          end_time:
            selectedShift?.end_time ||
            selectedUser.organization_shift?.end_time ||
            "",
          effective_hours:
            selectedShift?.effective_hours ||
            selectedUser.organization_shift?.effective_hours ||
            0,
        },
        image: nextImage,
      };

      setIsEditing(false);
      setImageFile(null);
      setRemoveImage(false);
      setPreviewImage(updatedUser.image || "");
      setHasUnsavedChanges(false);

      dispatch(
        getOrganizationUserAction({
          org_uuid: organizationUuid,
          user_uuid: userUuid,
        }),
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
      <div className="">
        <div className="w-11/12 min-[1400px]:w-3/4 mx-auto py-7 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="mb-2">
                <TabsTrigger value="details">User Details</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                {hasPermissions(
                  "leave_request_management",
                  "read",
                  currentUserRolePermissions,
                  currentUser?.email,
                ) && <TabsTrigger value="leaves">Leaves</TabsTrigger>}
              </TabsList>
              <Button variant="link" disabled>
                Back
              </Button>
            </div>

            <TabsContent value="details" className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-7 space-y-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <Skeleton className="h-24 w-24 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-52" />
                      <Skeleton className="h-4 w-64" />
                      <div className="flex gap-2 pt-1">
                        <Skeleton className="h-6 w-24 rounded-lg" />
                        <Skeleton className="h-6 w-20 rounded-lg" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </div>

              <div className="grid gap-6">
                <Card className="lg:col-span-2 border border-border">
                  <CardHeader>
                    <CardTitle>Profile information</CardTitle>
                    <CardDescription>
                      View and update user details for this workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList>
                        <TabsTrigger value="basic">
                          Basic & Employment
                        </TabsTrigger>
                        <TabsTrigger value="contact">Contact</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                      </TabsList>

                      <UserEditPageProfileTabs
                        isLoading
                        isEditing={false}
                        register={register}
                        errors={errors}
                        watchedRole=""
                        watchedShift=""
                        maritalStatus=""
                        employmentType=""
                        workMode=""
                        roles={[]}
                        shifts={[]}
                        onRoleChange={() => {}}
                        onShiftChange={() => {}}
                        onMaritalStatusChange={() => {}}
                        onEmploymentTypeChange={() => {}}
                        onWorkModeChange={() => {}}
                      />

                      <UserEditPageDocumentsTab
                        isLoading
                        isEditing={false}
                        visibleDocuments={[]}
                        pendingDeletedDocuments={[]}
                        pendingCreatedDocumentDrafts={[]}
                        pendingDeletedDocumentUuids={[]}
                        documentDrafts={[]}
                        documentValidationErrors={{}}
                        addedDocumentIndices={new Set()}
                        addDocumentDraft={() => {}}
                        removeDocumentDraft={() => {}}
                        handleAddDocumentToQueue={() => {}}
                        handleDeleteDocument={() => {}}
                        recoverDeletedDocument={() => {}}
                        editQueuedDocumentDraft={() => {}}
                        removeQueuedDocumentDraft={() => {}}
                        updateDocumentDraft={() => {}}
                        updateDocumentDraftFiles={() => {}}
                      />
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
            </TabsContent>

            <TabsContent value="leaves" className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
            </TabsContent>
          </Tabs>
        </div>
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
              onClick={() =>
                navigateWithUnsavedCheck(`/${organizationUuid}/user-management`)
              }
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

  const visibleDocuments = selectedUser?.documents?.filter(
    (document) => !pendingDeletedDocumentUuids.includes(document.uuid),
  );

  const pendingDeletedDocuments = selectedUser?.documents?.filter((document) =>
    pendingDeletedDocumentUuids.includes(document.uuid),
  );

  return (
    <div className="bg-background">
      <div className="relative w-11/12 min-[1400px]:w-3/4 mx-auto py-7 space-y-6">
        <Tabs defaultValue="details" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="mb-2">
              <TabsTrigger value="details">User Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              {hasPermissions(
                  "leave_request_management",
                  "read",
                  currentUserRolePermissions,
                  currentUser?.email,
                ) &&  <TabsTrigger value="leaves">Leaves</TabsTrigger>}
            </TabsList>
            <Button variant="link" onClick={() => router.back()}>
              Back
            </Button>
          </div>
          <TabsContent value="details" className="space-y-6">
            <div className="rounded-lg border border-border p-7 bg-card">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar
                      className={`h-24 w-24 rounded-2xl transition-all duration-300 ${
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
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="space-y-1">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold leading-none" style={{ wordBreak: "break-word" }}>
                        {selectedUser.name}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground italic">
                        💡 Click profile image to upload a new photo
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        <Shield />
                        {selectedUser.role?.name || "No role"}
                      </Badge>
                      <Badge
                        variant={
                          selectedUser.is_active ? "success" : "destructive"
                        }
                      >
                        {selectedUser.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button
                        variant={"default"}
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Save />
                        )}
                        Save changes
                      </Button>
                    </>
                  ) : (
                    hasPermissions(
                      "user_management",
                      "update",
                      currentUserRolePermissions,
                      currentUser?.email,
                    ) && (
                      <Button
                        variant="default"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil />
                        Edit profile
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="lg:col-span-2 border border-border rounded-lg shadow-none">
                <CardHeader>
                  <CardTitle>Profile information</CardTitle>
                  <CardDescription>
                    View and update user details for this workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic">
                    <TabsList className="w-full">
                      <TabsTrigger value="basic">
                        Basic & Employment
                      </TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <UserEditPageProfileTabs
                      isEditing={isEditing}
                      register={register}
                      errors={errors}
                      watchedRole={watchedRole}
                      watchedShift={watchedShift}
                      maritalStatus={watch("marital_status") || ""}
                      employmentType={watch("employment_type") || ""}
                      workMode={watch("work_mode") || ""}
                      roles={roles}
                      shifts={shifts}
                      onRoleChange={(value) =>
                        setValue("role", value, { shouldValidate: true })
                      }
                      onShiftChange={(value) =>
                        setValue("shift", value, { shouldValidate: true })
                      }
                      onMaritalStatusChange={(value) =>
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
                      onEmploymentTypeChange={(value) =>
                        setValue(
                          "employment_type",
                          value as "full_time" | "intern" | "contract",
                          { shouldValidate: true },
                        )
                      }
                      onWorkModeChange={(value) =>
                        setValue(
                          "work_mode",
                          value as "office" | "remote" | "hybrid",
                          { shouldValidate: true },
                        )
                      }
                    />

                    <UserEditPageDocumentsTab
                      isEditing={isEditing}
                      visibleDocuments={visibleDocuments}
                      pendingDeletedDocuments={pendingDeletedDocuments}
                      pendingCreatedDocumentDrafts={
                        pendingCreatedDocumentDrafts
                      }
                      pendingDeletedDocumentUuids={pendingDeletedDocumentUuids}
                      documentDrafts={documentDrafts}
                      documentValidationErrors={documentValidationErrors}
                      addedDocumentIndices={addedDocumentIndices}
                      addDocumentDraft={addDocumentDraft}
                      removeDocumentDraft={removeDocumentDraft}
                      handleAddDocumentToQueue={handleAddDocumentToQueue}
                      handleDeleteDocument={handleDeleteDocument}
                      recoverDeletedDocument={recoverDeletedDocument}
                      editQueuedDocumentDraft={editQueuedDocumentDraft}
                      removeQueuedDocumentDraft={removeQueuedDocumentDraft}
                      updateDocumentDraft={updateDocumentDraft}
                      updateDocumentDraftFiles={updateDocumentDraftFiles}
                    />
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

          {hasPermissions(
            "leave_request_management",
            "read",
            currentUserRolePermissions,
            currentUser?.email,
          ) && (
            <TabsContent value="leaves" className="space-y-6">
              <LeaveRequest isView={true} userUUId={selectedUser.user_id} />
            </TabsContent>
          )}
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

      {/* Photo Upload/Capture Modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={handlePhotoModalClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Face Photo</DialogTitle>
            <DialogDescription>
              Capture or upload a photo for facial recognition attendance tracking (Optional)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Show existing image in edit mode */}
            {selectedUser?.image && !wantsToChangeImage && !capturedImage && (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border-2 border-border shadow-md">
                  <img
                    src={selectedUser.image}
                    alt="User face"
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                    <Camera size={12} />
                    CURRENT PHOTO
                  </div>
                </div>
                <div className="w-full flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary"
                    onClick={() => setWantsToChangeImage(true)}
                  >
                    <EditIcon className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
              
                </div>
              </div>
            )}

            {/* Show capture/upload options when creating, changing photo, or no photo exists */}
            {(!selectedUser?.image || wantsToChangeImage) &&
              !capturedImage &&
              !showCamera && (
                <div className="space-y-3">
                  {wantsToChangeImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setWantsToChangeImage(false);
                        setRemoveExistingImage(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel Change
                    </Button>
                  )}
                  {removeExistingImage && !capturedImage && (
                    <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/30">
                      Current photo will be removed when you save changes.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary h-20 flex-col gap-1"
                      onClick={() => {
                        setShowCamera(true);
                        startCamera();
                      }}
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-sm font-semibold">Capture Photo</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary h-20 flex-col gap-1"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setCapturedImage(
                                event.target?.result as string,
                              );
                              setRemoveExistingImage(false);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      <span className="text-sm font-semibold">Upload Photo</span>
                    </Button>
                  </div>
                </div>
              )}

            {/* Camera View */}
            {showCamera && (
              <div className="relative rounded-xl overflow-hidden border-2 border-primary bg-black shadow-xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video object-cover"
                />
                {isCameraActive && (
                  <>
                    <div className="absolute inset-x-8 top-1/2 h-0.5 bg-primary shadow-[0_0_15px_hsl(var(--primary))] animate-pulse" />
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                      <Scan size={12} className="animate-pulse" />
                      CAMERA ACTIVE
                    </div>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="bg-background/90 hover:bg-background shadow-lg"
                    onClick={() => {
                      setShowCamera(false);
                      stopCamera();
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    onClick={capturePhoto}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Capture
                  </Button>
                </div>
              </div>
            )}

            {/* Captured Image */}
            {capturedImage && (
              <div className="relative rounded-xl overflow-hidden border-2 border-green-500/50 group shadow-md">
                <img
                  src={capturedImage}
                  alt="Captured face"
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="shadow-lg"
                    onClick={removePhoto}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
                <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                  <Scan size={12} />
                  FACE CAPTURED
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-md border border-border">
            📸 Capture or upload a face photo for facial recognition attendance tracking.
          </p>

          <div className="flex gap-3 justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePhotoModalClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmPhoto}
              disabled={!capturedImage}
            >
              <Save className="w-4 h-4 mr-2" />
              Use This Photo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
