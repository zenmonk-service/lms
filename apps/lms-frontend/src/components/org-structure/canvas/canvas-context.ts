import { createContext, useContext } from "react";

export interface OrgCanvasActions {
  toggleCollapse: (userId: string) => void;
  select: (userId: string) => void;
  /** Asks to remove the line(s) from `userId` to `managerId`. */
  requestUnlink: (userId: string, managerId: string) => void;
  /** Opens the team's detail sheet. */
  openTeam: (teamUuid: string) => void;
}

export const OrgCanvasContext = createContext<OrgCanvasActions | null>(null);

export function useOrgCanvas() {
  const ctx = useContext(OrgCanvasContext);
  if (!ctx) throw new Error("useOrgCanvas must be used inside OrgCanvasContext");
  return ctx;
}
