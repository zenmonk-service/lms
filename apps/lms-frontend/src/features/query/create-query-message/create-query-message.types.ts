export interface CreateQueryMessagePayload {
  org_uuid: string;
  query_uuid: string;
  data: {
    content: string;
    message_type?: string;
    attachment_id?: string;
    attachment?: {
      file_name: string;
      file_url: string;
      meta_data?: {
        type?: string;
        size?: number;
      };
    };
  };
}
