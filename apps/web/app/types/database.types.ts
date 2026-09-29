
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "aid_distributions": {
                  Row: {
                    "amount": number | null,"beneficiary_id": string,"created_at": string | null,"deleted_at": string | null,"distributed_by": string | null,"distribution_date": string,"id": string,"need_id": string | null,"notes": string | null,"organization_id": string,"proof_attachment_url": string | null,"type": string,"updated_at": string | null
                  }
                  Insert: {
                    "amount"?: number | null,"beneficiary_id": string,"created_at"?: string | null,"deleted_at"?: string | null,"distributed_by"?: string | null,"distribution_date": string,"id"?: string,"need_id"?: string | null,"notes"?: string | null,"organization_id": string,"proof_attachment_url"?: string | null,"type": string,"updated_at"?: string | null
                  }
                  Update: {
                    "amount"?: number | null,"beneficiary_id"?: string,"created_at"?: string | null,"deleted_at"?: string | null,"distributed_by"?: string | null,"distribution_date"?: string,"id"?: string,"need_id"?: string | null,"notes"?: string | null,"organization_id"?: string,"proof_attachment_url"?: string | null,"type"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "aid_distributions_beneficiary_id_fkey"
      columns: ["beneficiary_id"]
isOneToOne: false
      referencedRelation: "beneficiaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "aid_distributions_need_id_fkey"
      columns: ["need_id"]
isOneToOne: false
      referencedRelation: "beneficiary_needs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "aid_distributions_need_id_fkey"
      columns: ["need_id"]
isOneToOne: false
      referencedRelation: "need_schedule"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "aid_distributions_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "aid_distributions_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "public_org_stats"
      referencedColumns: ["org_id"]
    }
                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"created_at": string | null,"entity_id": string | null,"entity_type": string,"id": string,"metadata": Json | null,"org_id": string | null,"user_id": string | null
                  }
                  Insert: {
                    "action": string,"created_at"?: string | null,"entity_id"?: string | null,"entity_type": string,"id"?: string,"metadata"?: Json | null,"org_id"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "action"?: string,"created_at"?: string | null,"entity_id"?: string | null,"entity_type"?: string,"id"?: string,"metadata"?: Json | null,"org_id"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_org_id_fkey"
      columns: ["org_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "audit_logs_org_id_fkey"
      columns: ["org_id"]
isOneToOne: false
      referencedRelation: "public_org_stats"
      referencedColumns: ["org_id"]
    }
                  ]
                },"beneficiaries": {
                  Row: {
                    "address": string | null,"birth_date": string | null,"category": string | null,"city": string,"created_at": string | null,"created_by": string | null,"deleted_at": string | null,"employment_status": string | null,"family_size": number | null,"full_name": string,"gender": string | null,"health_conditions": string | null,"id": string,"monthly_income": number | null,"national_id": string | null,"notes": string | null,"organization_id": string,"phone": string | null,"status": string,"updated_at": string | null
                  }
                  Insert: {
                    "address"?: string | null,"birth_date"?: string | null,"category"?: string | null,"city": string,"created_at"?: string | null,"created_by"?: string | null,"deleted_at"?: string | null,"employment_status"?: string | null,"family_size"?: number | null,"full_name": string,"gender"?: string | null,"health_conditions"?: string | null,"id"?: string,"monthly_income"?: number | null,"national_id"?: string | null,"notes"?: string | null,"organization_id": string,"phone"?: string | null,"status"?: string,"updated_at"?: string | null
                  }
                  Update: {
                    "address"?: string | null,"birth_date"?: string | null,"category"?: string | null,"city"?: string,"created_at"?: string | null,"created_by"?: string | null,"deleted_at"?: string | null,"employment_status"?: string | null,"family_size"?: number | null,"full_name"?: string,"gender"?: string | null,"health_conditions"?: string | null,"id"?: string,"monthly_income"?: number | null,"national_id"?: string | null,"notes"?: string | null,"organization_id"?: string,"phone"?: string | null,"status"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "beneficiaries_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "beneficiaries_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "public_org_stats"
      referencedColumns: ["org_id"]
    }
                  ]
                },"beneficiary_attachments": {
                  Row: {
                    "beneficiary_id": string,"created_at": string | null,"deleted_at": string | null,"file_name": string,"file_size": number,"file_type": string,"file_url": string,"id": string,"organization_id": string,"uploaded_by": string | null
                  }
                  Insert: {
                    "beneficiary_id": string,"created_at"?: string | null,"deleted_at"?: string | null,"file_name": string,"file_size": number,"file_type": string,"file_url": string,"id"?: string,"organization_id": string,"uploaded_by"?: string | null
                  }
                  Update: {
                    "beneficiary_id"?: string,"created_at"?: string | null,"deleted_at"?: string | null,"file_name"?: string,"file_size"?: number,"file_type"?: string,"file_url"?: string,"id"?: string,"organization_id"?: string,"uploaded_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "beneficiary_attachments_beneficiary_id_fkey"
      columns: ["beneficiary_id"]
isOneToOne: false
      referencedRelation: "beneficiaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "beneficiary_attachments_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "beneficiary_attachments_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "public_org_stats"
      referencedColumns: ["org_id"]
    }
                  ]
                },"beneficiary_needs": {
                  Row: {
                    "beneficiary_id": string,"created_at": string | null,"deleted_at": string | null,"description": string | null,"end_date": string | null,"estimated_cost": number | null,"frequency": string,"id": string,"organization_id": string,"start_date": string | null,"status": string,"type": string,"updated_at": string | null,"urgency": string,"urgency_rank": number | null
                  }
                  Insert: {
                    "beneficiary_id": string,"created_at"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"end_date"?: string | null,"estimated_cost"?: number | null,"frequency": string,"id"?: string,"organization_id": string,"start_date"?: string | null,"status"?: string,"type": string,"updated_at"?: string | null,"urgency"?: string,"urgency_rank"?: never
                  }
                  Update: {
                    "beneficiary_id"?: string,"created_at"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"end_date"?: string | null,"estimated_cost"?: number | null,"frequency"?: string,"id"?: string,"organization_id"?: string,"start_date"?: string | null,"status"?: string,"type"?: string,"updated_at"?: string | null,"urgency"?: string,"urgency_rank"?: never
                  }
                  Relationships: [
                    {
      foreignKeyName: "beneficiary_needs_beneficiary_id_fkey"
      columns: ["beneficiary_id"]
isOneToOne: false
      referencedRelation: "beneficiaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "beneficiary_needs_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "beneficiary_needs_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "public_org_stats"
      referencedColumns: ["org_id"]
    }
                  ]
                },"beneficiary_notes": {
                  Row: {
                    "beneficiary_id": string,"body": string,"created_at": string,"created_by": string | null,"id": string,"organization_id": string
                  }
                  Insert: {
                    "beneficiary_id": string,"body": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"organization_id": string
                  }
                  Update: {
                    "beneficiary_id"?: string,"body"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"organization_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "beneficiary_notes_beneficiary_id_fkey"
      columns: ["beneficiary_id"]
isOneToOne: false
      referencedRelation: "beneficiaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "beneficiary_notes_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "beneficiary_notes_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "public_org_stats"
      referencedColumns: ["org_id"]
    }
                  ]
                },"donations": {
                  Row: {
                    "amount": number,"created_at": string | null,"created_by": string | null,"currency": string,"deleted_at": string | null,"donated_at": string,"donor_name": string | null,"id": string,"is_anonymous": boolean,"notes": string | null,"organization_id": string,"payment_method": string | null,"updated_at": string | null
                  }
                  Insert: {
                    "amount": number,"created_at"?: string | null,"created_by"?: string | null,"currency"?: string,"deleted_at"?: string | null,"donated_at": string,"donor_name"?: string | null,"id"?: string,"is_anonymous"?: boolean,"notes"?: string | null,"organization_id": string,"payment_method"?: string | null,"updated_at"?: string | null
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string | null,"created_by"?: string | null,"currency"?: string,"deleted_at"?: string | null,"donated_at"?: string,"donor_name"?: string | null,"id"?: string,"is_anonymous"?: boolean,"notes"?: string | null,"organization_id"?: string,"payment_method"?: string | null,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "donations_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "donations_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "public_org_stats"
      referencedColumns: ["org_id"]
    }
                  ]
                },"organization_members": {
                  Row: {
                    "created_at": string | null,"id": string,"invited_by": string | null,"organization_id": string,"role": string,"status": string,"updated_at": string | null,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string | null,"id"?: string,"invited_by"?: string | null,"organization_id": string,"role"?: string,"status"?: string,"updated_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"invited_by"?: string | null,"organization_id"?: string,"role"?: string,"status"?: string,"updated_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "organization_members_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "organization_members_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "public_org_stats"
      referencedColumns: ["org_id"]
    },{
      foreignKeyName: "organization_members_user_profile_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"organizations": {
                  Row: {
                    "created_at": string | null,"id": string,"name": string,"owner_id": string | null,"slug": string
                  }
                  Insert: {
                    "created_at"?: string | null,"id"?: string,"name": string,"owner_id"?: string | null,"slug": string
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"name"?: string,"owner_id"?: string | null,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string | null,"full_name": string | null,"id": string,"updated_at": string | null
                  }
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string | null,"full_name"?: string | null,"id": string,"updated_at"?: string | null
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string | null,"full_name"?: string | null,"id"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "need_schedule": {
                  Row: {
                    "beneficiary_id": string | null,"description": string | null,"end_date": string | null,"estimated_cost": number | null,"frequency": string | null,"id": string | null,"last_distribution_date": string | null,"next_due_date": string | null,"organization_id": string | null,"start_date": string | null,"status": string | null,"type": string | null,"urgency": string | null,"urgency_rank": number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "beneficiary_needs_beneficiary_id_fkey"
      columns: ["beneficiary_id"]
isOneToOne: false
      referencedRelation: "beneficiaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "beneficiary_needs_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "beneficiary_needs_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "public_org_stats"
      referencedColumns: ["org_id"]
    }
                  ]
                },"public_org_stats": {
                  Row: {
                    "food_distributions": number | null,"medical_distributions": number | null,"org_id": string | null,"org_name": string | null,"slug": string | null,"total_distributed": number | null,"total_families": number | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "accept_org_invite":
{ Args: { "p_org_id": string }; Returns: undefined
                           },
"find_possible_duplicates":
{ Args: { "p_exclude"?: string,"p_national_id": string,"p_org_id": string,"p_phone": string }; Returns: {
              "city": string,"full_name": string,"id": string,"match": string,"national_id": string,"phone": string
            }[]
                           },
"get_my_org_ids":
{ Args: Record<PropertyKey, never>; Returns: string[]
                           },
"get_user_id_by_email":
{ Args: { "p_email": string }; Returns: string
                           },
"my_org_role":
{ Args: { "org_id": string }; Returns: string
                           },
"org_member_emails":
{ Args: { "p_org_id": string }; Returns: {
              "email": string,"user_id": string
            }[]
                           },
"org_summary":
{ Args: { "p_org_id": string }; Returns: {
              "active_beneficiaries": number,"active_needs": number,"distributions_this_month": number,"recurring_needs": number,"total_beneficiaries": number,"total_distributed": number,"total_donations": number,"urgent_needs": number
            }[]
                           },
"show_limit":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"show_trgm":
{ Args: { "": string }; Returns: (string)[]
                           },
"soft_delete_beneficiary":
{ Args: { "p_id": string }; Returns: undefined
                           },
"soft_delete_distribution":
{ Args: { "p_id": string }; Returns: undefined
                           },
"soft_delete_donation":
{ Args: { "p_id": string }; Returns: undefined
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const

