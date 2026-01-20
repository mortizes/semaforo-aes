export type AeStatus = "disponible" | "ocupado";
export type AeMode = "presencial" | "remoto" | "off" | "vacaciones";

export interface AE {
  id: string;
  name: string;
  avatar_url: string | null;
  is_available: boolean;
  status: AeStatus;
  mode: AeMode;
  last_change_at: string;
  last_available_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatusLog {
  id: string;
  ae_id: string;
  is_available: boolean;
  status: AeStatus;
  mode: AeMode;
  changed_at: string;
}

export interface Database {
  public: {
    Tables: {
      aes: {
        Row: AE;
        Insert: Omit<AE, "id" | "created_at" | "updated_at" | "last_change_at">;
        Update: Partial<Omit<AE, "id" | "created_at">>;
      };
      status_logs: {
        Row: StatusLog;
        Insert: Omit<StatusLog, "id" | "changed_at">;
        Update: never;
      };
    };
    Enums: {
      ae_status: AeStatus;
      ae_mode: AeMode;
    };
  };
}
