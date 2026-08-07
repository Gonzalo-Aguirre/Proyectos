export interface WorkEnvironment {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_by_user_id: string | null;
  created_at: string;
}

export interface CreateEnvironmentInput {
  name: string;
  description?: string;
  created_by: string;
  created_by_user_id?: string | null;
}
