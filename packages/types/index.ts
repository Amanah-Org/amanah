// ─── Enums ────────────────────────────────────────────────────────────────────

export type BeneficiaryStatus = 'active' | 'inactive' | 'archived'
export type NeedType = 'food' | 'medicine' | 'rent' | 'surgery' | 'education' | 'utilities' | 'other'
export type NeedFrequency = 'one_time' | 'weekly' | 'monthly' | 'yearly'
export type NeedStatus = 'active' | 'completed' | 'paused'
export type NeedUrgency = 'low' | 'medium' | 'high' | 'critical'
export type DistributionType =
  | 'cash'
  | 'food_package'
  | 'medicine'
  | 'rent_payment'
  | 'utilities'
  | 'surgery_support'
  | 'education_support'
  | 'other'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'wallet' | 'other'
export type OrgRole = 'admin' | 'collector' | 'viewer'
export type MemberStatus = 'pending' | 'active'

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  created_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrgRole
  status: MemberStatus
  invited_by: string | null
  created_at: string
  // Joined
  profile?: Profile
}

export interface Beneficiary {
  id: string
  organization_id: string
  full_name: string
  phone: string | null
  national_id: string | null
  gender: 'male' | 'female' | 'other' | null
  birth_date: string | null
  address: string | null
  city: string
  family_size: number | null
  employment_status: string | null
  monthly_income: number | null
  health_conditions: string | null
  category: string | null
  status: BeneficiaryStatus
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BeneficiaryNeed {
  id: string
  organization_id: string
  beneficiary_id: string
  type: NeedType
  description: string | null
  estimated_cost: number | null
  frequency: NeedFrequency
  urgency: NeedUrgency
  status: NeedStatus
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AidDistribution {
  id: string
  organization_id: string
  beneficiary_id: string
  need_id: string | null
  type: DistributionType
  amount: number | null
  notes: string | null
  proof_attachment_url: string | null
  distributed_by: string | null
  distribution_date: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  // Joined
  beneficiary?: Pick<Beneficiary, 'id' | 'full_name' | 'city'>
  distributor?: Pick<Profile, 'id' | 'full_name'>
}

export interface Donation {
  id: string
  organization_id: string
  donor_name: string | null
  is_anonymous: boolean
  amount: number
  currency: string
  payment_method: PaymentMethod | null
  notes: string | null
  donated_at: string
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  metadata: Record<string, unknown> | null
  created_at: string
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalBeneficiaries: number
  activeBeneficiaries: number
  recurringCases: number
  urgentCases: number
  totalDonations: number
  totalDistributed: number
  remainingBalance: number
  distributionsThisMonth: number
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface CreateBeneficiaryForm {
  full_name: string
  phone?: string
  city: string
  address?: string
  national_id?: string
  gender?: 'male' | 'female' | 'other'
  birth_date?: string
  family_size?: number
  monthly_income?: number
  employment_status?: string
  health_conditions?: string
  category?: string
  notes?: string
}

export interface CreateNeedForm {
  beneficiary_id: string
  type: NeedType
  frequency: NeedFrequency
  urgency?: NeedUrgency
  description?: string
  estimated_cost?: number
  start_date?: string
  end_date?: string
}

export interface CreateDistributionForm {
  beneficiary_id: string
  type: DistributionType
  distribution_date: string
  amount?: number
  notes?: string
  need_id?: string
  proof_attachment_url?: string
}

export interface CreateDonationForm {
  donor_name?: string
  is_anonymous: boolean
  amount: number
  currency?: string
  payment_method?: PaymentMethod
  notes?: string
  donated_at: string
}
