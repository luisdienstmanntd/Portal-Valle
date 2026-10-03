import type { Booking, Experience, Occurrence } from "@/modules/experiences/domain/model";
type Timestamps = { created_at: string; updated_at: string };
// Phase 5 has no direct client mutations; future writes must use atomic authorized RPCs.
type ReadTable<Row> = { Row: Row; Insert: never; Update: never; Relationships: [] };
type AuditRow = { id: string; actor_id: string | null; action: "INSERT" | "UPDATE" | "DELETE";
  entity_type: "experiences" | "experience_occurrences" | "experience_bookings"; entity_id: string;
  before: Record<string, string | number | boolean | null> | null;
  after: Record<string, string | number | boolean | null> | null; created_at: string };
/** Manual schema contract maintained with versioned migrations and pgTAP tests. */
export type Database = {
  public: {
    Tables: {
      experiences: ReadTable<Experience & Timestamps>;
      experience_occurrences: ReadTable<Occurrence & Timestamps>;
      experience_bookings: ReadTable<Booking & Timestamps>;
      audit_events: ReadTable<AuditRow>;
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
    Functions: {
      portal_save_occurrence: { Args: { p_request: string; p_command: Record<string, string | number> }; Returns: string };
      portal_save_booking: { Args: { p_request: string; p_command: Record<string, string | number> }; Returns: string };
      portal_pizza_save_occurrence: { Args: { p_request: string; p_command: Record<string, string | number> }; Returns: string };
      portal_pizza_save_booking: { Args: { p_request: string; p_command: Record<string, string | number> }; Returns: string };
    };
    Enums: { portal_role: "recepcao" | "gerencia" | "admin";
      experience_category: Experience["category"]; capacity_mode: Experience["capacity_mode"];
      occurrence_status: Occurrence["status"]; booking_status: Booking["status"];
      attendance_status: Booking["attendance_status"] };
    CompositeTypes: { [_ in never]: never };
  };
};
