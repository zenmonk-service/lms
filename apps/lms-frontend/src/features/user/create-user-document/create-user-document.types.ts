export interface CreateUserDocumentPayload {
  org_uuid: string;
  user_uuid: string;
  document_name: string;
  document_number?: string;
  file_url: string;
  file_urls?: string[];
  metadata?: Record<string, string | string[]>;
}
