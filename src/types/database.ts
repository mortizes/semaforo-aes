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

export type Database = {
  public: {
    Tables: {
      aes: {
        Row: AE;
        Insert: Partial<AE> & { name: string };
        Update: Partial<AE>;
      };
      status_logs: {
        Row: StatusLog;
        Insert: Omit<StatusLog, "id" | "changed_at">;
        Update: Partial<StatusLog>;
      };
    };
    Enums: {
      ae_status: AeStatus;
      ae_mode: AeMode;
    };
  };
};
