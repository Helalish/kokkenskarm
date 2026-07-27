export function getSessionDestination(session: {
  accessToken: string | null;
  selectedClientId: string | null;
  selectedBranchId: string | null;
}) {
  if (!session.accessToken) return "/login";
  if (!session.selectedClientId) return "/select-client";
  if (!session.selectedBranchId) return "/select-branch";
  return "/kds";
}
