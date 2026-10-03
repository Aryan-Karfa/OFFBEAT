import type {
  SubmissionType,
  SubmissionStatus,
  EvidenceType,
  SupportType,
  ReportReason,
  ReportStatus,
  CommunitySubmissionDto,
  SubmissionEvidenceDto,
  SubmissionAuthorDto,
  SubmissionPlaceSummaryDto,
  SubmissionSupportSummaryDto,
  CommunityHighlightDto,
  CommunitySignalSummaryDto,
  CreateCommunitySubmissionRequestDto,
  CommunitySubmissionsListFilterDto,
  CommunitySubmissionsListResponseDto,
  CreateSupportRequestDto,
  CreateReportRequestDto,
} from "@offbeat/shared";

export type {
  SubmissionType,
  SubmissionStatus,
  EvidenceType,
  SupportType,
  ReportReason,
  ReportStatus,
  CommunitySubmissionDto,
  SubmissionEvidenceDto,
  SubmissionAuthorDto,
  SubmissionPlaceSummaryDto,
  SubmissionSupportSummaryDto,
  CommunityHighlightDto,
  CommunitySignalSummaryDto,
  CreateCommunitySubmissionRequestDto,
  CommunitySubmissionsListFilterDto,
  CommunitySubmissionsListResponseDto,
  CreateSupportRequestDto,
  CreateReportRequestDto,
};

export interface FindSubmissionsOptions {
  placeId?: string;
  destinationId?: string;
  type?: SubmissionType;
  status?: SubmissionStatus;
  userId?: string;
  page: number;
  limit: number;
}

export interface UserContextInfo {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface SubmissionSupportRecord {
  id: string;
  submissionId: string;
  userId: string;
  type: SupportType;
  createdAt: Date | string;
}

export interface SubmissionEvidenceRecord {
  id: string;
  submissionId?: string;
  type: EvidenceType;
  source?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
  externalReference?: string | null;
  metadata?: unknown;
  createdAt: Date | string;
}

export interface SubmissionRecord {
  id: string;
  userId: string;
  placeId?: string | null;
  destinationId?: string | null;
  type: SubmissionType;
  title: string;
  content: string;
  status: SubmissionStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: string;
    username: string;
    profile?: {
      displayName?: string | null;
      avatarUrl?: string | null;
    } | null;
  } | null;
  place?: {
    id: string;
    name: string;
    slug: string;
    destination?: {
      name?: string | null;
      regionId?: string | null;
    } | null;
  } | null;
  evidence?: SubmissionEvidenceRecord[];
  supports?: SubmissionSupportRecord[];
  reports?: unknown[];
}
