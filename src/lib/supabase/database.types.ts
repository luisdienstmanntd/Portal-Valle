/** Phase 3 schema contract, maintained with the versioned migration and pgTAP tests. */
export type Database = {
  public: {
    Tables: {
      portal_profiles: {
        Row: { id: string; role: "recepcao" | "gerencia" | "admin"; active: boolean; created_at: string };
        Insert: { id: string; role: "recepcao" | "gerencia" | "admin"; active?: boolean; created_at?: string };
        Update: { role?: "recepcao" | "gerencia" | "admin"; active?: boolean };
        Relationships: [];
      };
      portal_settings: {
        Row: { singleton: boolean; timezone: string; created_at: string };
        Insert: { singleton?: boolean; timezone?: string; created_at?: string };
        Update: { singleton?: boolean; timezone?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { portal_role: "recepcao" | "gerencia" | "admin" };
    CompositeTypes: { [_ in never]: never };
  };
};
