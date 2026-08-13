export type Role = 'OWNER' | 'ADMIN' | 'SALES_MANAGER' | 'SALES_REP' | 'VIEWER';
export type Tier = 'FREE' | 'PRO' | 'ENTERPRISE';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'NURTURING' | 'CONVERTED';
export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'LINKEDIN' | 'ADVERTISEMENT' | 'EMAIL' | 'EVENT' | 'COLD_OUTREACH' | 'OTHER';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'DEMO' | 'NOTE' | 'FOLLOW_UP' | 'TASK';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tier: Tier;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  jobTitle?: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  organization: Organization;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  status: LeadStatus;
  source: LeadSource;
  industry?: string;
  location?: string;
  leadScore: number;
  scoreExplanation?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  assignedTo?: User;
  convertedContactId?: string;
  convertedCompanyId?: string;
  convertedDealId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
  location?: string;
  description?: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  location?: string;
  tags?: string;
  company?: {
    id: string;
    name: string;
    website?: string;
    industry?: string;
  };
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  stageOrder: number;
  winProbability: number;
  isWonStage: boolean;
  isLostStage: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  isDefault: boolean;
  stages: PipelineStage[];
  createdAt: string;
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  lostReason?: string;
  dealRiskLevel: RiskLevel;
  riskExplanation?: string;
  description?: string;
  stage: PipelineStage;
  pipelineId: string;
  company?: Company;
  contact?: Contact;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  user: User;
  leadId?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  isOverdue: boolean;
  assignedTo?: User;
  creator: User;
  leadId?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  transcript?: string;
  aiSummary?: string;
  actionItems?: string[];
  organizer: User;
  contact?: Contact;
  company?: Company;
  deal?: Deal;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  vectorIndexed: boolean;
  uploadedBy: User;
  createdAt: string;
}

export interface AiSummaryResponse {
  summary: string;
  keyFacts: string[];
  recentActivityHighlights: string[];
  risks: string[];
  recommendedNextAction: string;
}

export interface AiEmailResponse {
  subject: string;
  body: string;
  toneUsed: string;
}

export interface AiChatResponse {
  conversationId: string;
  message: string;
  citations: string[];
}

export interface AiRiskResponse {
  dealId: string;
  dealRiskLevel: RiskLevel;
  riskExplanation: string;
  riskFactors: string[];
}

export interface AiForecastResponse {
  period: string;
  actualRevenue: number;
  forecastedRevenue: number;
  confidenceScore: number;
  reasoning: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
}

export interface PipelineStageFunnel {
  stageId: string;
  stageName: string;
  dealCount: number;
  totalValue: number;
}

export interface SalespersonPerformance {
  userId: string;
  name: string;
  dealsWon: number;
  revenueGenerated: number;
  leadsAssigned: number;
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  openDeals: number;
  pipelineValue: number;
  wonRevenue: number;
  conversionRate: number;
  avgDealSize: number;
  winRate: number;
  avgSalesCycleDays: number;
  tasksDue: number;
  upcomingMeetings: number;
  revenueOverTime: ChartDataPoint[];
  leadsBySource: ChartDataPoint[];
  dealPipelineFunnel: PipelineStageFunnel[];
  winLossRatio: ChartDataPoint[];
  teamPerformance: SalespersonPerformance[];
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  detailsJson?: string;
  ipAddress?: string;
  user?: User;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
