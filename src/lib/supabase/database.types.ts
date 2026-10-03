/** Phase 3 schema contract, maintained with the versioned migration and pgTAP tests. */
export type Database = {
  public: {
    Tables: {
      portal_settings: {
        Row: { singleton: boolean; timezone: string; created_at: string };
        Insert: { singleton?: boolean; timezone?: string; created_at?: string };
        Update: { singleton?: boolean; timezone?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
