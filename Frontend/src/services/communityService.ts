import { fetchApi } from "./apiClient";
import type {
  CommunitySubmissionDto,
  CommunitySubmissionsListFilterDto,
  CommunitySubmissionsListResponseDto,
  CreateCommunitySubmissionRequestDto,
  CreateReportRequestDto,
  CreateSupportRequestDto,
  SubmissionSupportSummaryDto,
  SupportType,
} from "@offbeat/shared";

export const communityService = {
  /**
   * Retrieves paginated community submissions with optional filtering.
   */
  async getSubmissions(
    filters: CommunitySubmissionsListFilterDto = {},
  ): Promise<CommunitySubmissionsListResponseDto> {
    const query = new URLSearchParams();
    if (filters.placeId) query.set("placeId", filters.placeId);
    if (filters.destinationId) query.set("destinationId", filters.destinationId);
    if (filters.type) query.set("type", filters.type);
    if (filters.status) query.set("status", filters.status);
    if (filters.page) query.set("page", String(filters.page));
    if (filters.limit) query.set("limit", String(filters.limit));

    const queryString = query.toString();
    const endpoint = queryString ? `community/submissions?${queryString}` : "community/submissions";

    return await fetchApi<CommunitySubmissionsListResponseDto>(endpoint);
  },

  /**
   * Retrieves single community submission detail by ID.
   */
  async getSubmissionById(submissionId: string): Promise<CommunitySubmissionDto> {
    return await fetchApi<CommunitySubmissionDto>(`community/submissions/${submissionId}`);
  },

  /**
   * Creates a new traveler discovery submission.
   */
  async createSubmission(
    input: CreateCommunitySubmissionRequestDto,
  ): Promise<CommunitySubmissionDto> {
    return await fetchApi<CommunitySubmissionDto>("community/submissions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /**
   * Confirms or supports a traveler discovery.
   */
  async supportSubmission(
    submissionId: string,
    type: SupportType = "USEFUL",
  ): Promise<SubmissionSupportSummaryDto> {
    const payload: CreateSupportRequestDto = { type };
    return await fetchApi<SubmissionSupportSummaryDto>(
      `community/submissions/${submissionId}/support`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  /**
   * Submits a report for a submission.
   */
  async reportSubmission(
    submissionId: string,
    payload: CreateReportRequestDto,
  ): Promise<{ reported: boolean; submissionId: string; message: string }> {
    return await fetchApi<{ reported: boolean; submissionId: string; message: string }>(
      `community/submissions/${submissionId}/report`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },
};
