import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { OrgGraph, OrgLine, OrgPerson, TeamOption } from "@/features/team/team.type";

export const NODE_WIDTH = 264;
export const NODE_HEIGHT = 116;

export type Person = OrgPerson;

export interface OrgIndex {
  people: Map<string, Person>;
  /** user_id → their reporting lines, outside-team lines first, then by team name */
  managerLines: Map<string, OrgLine[]>;
  /** manager user_id → distinct direct report user_ids, sorted by name */
  reports: Map<string, string[]>;
  /** people with no manager who have reports (where the canvas starts) */
  roots: string[];
  /** people with no manager and no reports: not on the canvas until placed */
  unassigned: string[];
  /** team uuid → member user_ids, sorted by name */
  teamMembers: Map<string, string[]>;
}

export type LayoutMode = "top-down" | "left-right" | "compact";

/** Handle ids on a card: targets on top/left, sources on bottom/right. */
export type TargetHandle = "t" | "l";
export type SourceHandle = "b" | "r";

export type PersonNodeData = {
  person: Person;
  /** Which handles this layout uses, so lines attach to the right side. */
  targetHandle: TargetHandle;
  sourceHandle: SourceHandle;
  reportCount: number;
  /** Names of managers without a drawn line to this card (shown as a chip). */
  otherManagers: string[];
  /** Whether a manager line is drawn to this card ("also reports to" vs "reports to"). */
  hasPrimaryLine: boolean;
  hiddenCount: number;
  collapsed: boolean;
  /** Reporting view only; lanes always show everyone. */
  collapsible: boolean;
  dimmed: boolean;
  dropState: "none" | "valid" | "invalid";
  editable: boolean;
  /** Set in the Teams view: the lane's team (its chips read "also in"). */
  laneTeam: string | null;
  isLead: boolean;
};

export type PersonFlowNode = Node<PersonNodeData, "person">;

export type TeamLaneData = {
  team: TeamOption;
  memberCount: number;
  dimmed: boolean;
  dropState: "none" | "valid" | "invalid";
};

/** A team's frame in the Teams view; its member cards are child nodes. */
export type TeamLaneNode = Node<TeamLaneData, "lane">;
export type CanvasNode = PersonFlowNode | TeamLaneNode;

/** One edge per manager → report pair; `lines` holds each team it applies in. */
export type ReportingEdgeData = {
  managerId: string;
  userId: string;
  lines: OrgLine[];
  dimmed: boolean;
  /**
   * Not the line the card is laid out under: hidden unless the manager or report is
   * hovered or selected, so the chart reads as a tree.
   */
  secondary: boolean;
  /** Teams view: the manager's card is in another team's frame (drawn dotted). */
  crossTeam?: boolean;
};

export type ReportingFlowEdge = Edge<ReportingEdgeData, "reporting">;
export type CanvasEdge = ReportingFlowEdge;

/** The person a node shows (lane cards have composite ids). */
export const personIdOf = (node: CanvasNode) =>
  node.type === "person" ? node.data.person.user_id : null;

const LANE_PREFIX = "lane:";
export const laneId = (teamUuid: string) => `${LANE_PREFIX}${teamUuid}`;
export const isLaneId = (id: string) => id.startsWith(LANE_PREFIX);
export const laneTeamOf = (id: string) => id.slice(LANE_PREFIX.length);
const laneCardId = (teamUuid: string, userId: string) => `${laneId(teamUuid)}/${userId}`;

const byName = (people: Map<string, Person>) => (a: string, b: string) =>
  (people.get(a)?.name ?? "").localeCompare(people.get(b)?.name ?? "");

/** Builds lookup maps from the graph response. */
export function indexHierarchy(graph: OrgGraph): OrgIndex {
  const people = new Map(graph.people.map((person) => [person.user_id, person]));
  const managerLines = new Map<string, OrgLine[]>();
  const reportSets = new Map<string, Set<string>>();

  for (const line of graph.lines) {
    if (!people.has(line.user_id) || !people.has(line.manager_id)) continue;
    const list = managerLines.get(line.user_id) ?? [];
    list.push(line);
    managerLines.set(line.user_id, list);
    const reports = reportSets.get(line.manager_id) ?? new Set<string>();
    reports.add(line.user_id);
    reportSets.set(line.manager_id, reports);
  }
  for (const list of managerLines.values()) {
    list.sort(
      (a, b) =>
        Number(!!a.team) - Number(!!b.team) ||
        (a.team?.name ?? "").localeCompare(b.team?.name ?? "") ||
        byName(people)(a.manager_id, b.manager_id),
    );
  }

  const reports = new Map<string, string[]>();
  for (const [managerId, set] of reportSets) {
    reports.set(managerId, [...set].sort(byName(people)));
  }

  const roots: string[] = [];
  const unassigned: string[] = [];
  for (const id of [...people.keys()].sort(byName(people))) {
    if (managerLines.has(id)) continue;
    (reports.has(id) ? roots : unassigned).push(id);
  }

  const teamMembers = new Map<string, string[]>();
  for (const id of [...people.keys()].sort(byName(people))) {
    for (const team of people.get(id)!.teams) {
      teamMembers.set(team.uuid, [...(teamMembers.get(team.uuid) ?? []), id]);
    }
  }

  return { people, managerLines, reports, roots, unassigned, teamMembers };
}

/** Distinct managers of `userId`, in line order. */
export function managersOf(index: OrgIndex, userId: string): string[] {
  return [...new Set((index.managerLines.get(userId) ?? []).map((line) => line.manager_id))];
}

/** The lines from `managerId` to `userId` (one per team they apply in). */
export function linesBetween(index: OrgIndex, userId: string, managerId: string): OrgLine[] {
  return (index.managerLines.get(userId) ?? []).filter((line) => line.manager_id === managerId);
}

/** Everyone below `userId` through any line. */
export function descendantsOf(index: OrgIndex, userId: string): Set<string> {
  const out = new Set<string>();
  const stack = [...(index.reports.get(userId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    stack.push(...(index.reports.get(id) ?? []));
  }
  return out;
}

/** True when `managerId` may become a manager of `userId` (no self, no cycle). */
export function canReport(index: OrgIndex, userId: string, managerId: string) {
  if (userId === managerId) return false;
  return !descendantsOf(index, userId).has(managerId);
}

type Point = { x: number; y: number };

/** dagre tree, top-to-bottom ("TB") or left-to-right ("LR"). */
function dagrePositions(ids: string[], edges: Edge[], rankdir: "TB" | "LR") {
  const g = new dagre.graphlib.Graph();
  g.setGraph(
    rankdir === "TB"
      ? { rankdir, nodesep: 48, ranksep: 72, marginx: 24, marginy: 24 }
      : { rankdir, nodesep: 24, ranksep: 96, marginx: 24, marginy: 24 },
  );
  g.setDefaultEdgeLabel(() => ({}));
  ids.forEach((id) => g.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  dagre.layout(g);
  const out = new Map<string, Point>();
  ids.forEach((id) => {
    const { x, y } = g.node(id);
    out.set(id, { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 });
  });
  return out;
}

const GAP_X = 40;
const RANK_GAP = 72;
const STACK_TOP = 28;
const STACK_GAP = 14;
/** Stacked reports start right of the manager's centre so the line steps down, then right. */
const STACK_INDENT = NODE_WIDTH / 2 + 28;

/**
 * Compact tree: a manager whose reports are all leaves gets them as a vertical
 * list below (file-tree style) instead of a wide row; other managers spread
 * their reports side by side as usual.
 */
function compactPositions(tops: string[], childrenOf: (id: string) => string[]) {
  const positions = new Map<string, Point>();
  const stacked = new Set<string>();
  const size = new Map<string, { w: number; h: number }>();
  const isStackParent = (id: string) => {
    const kids = childrenOf(id);
    return kids.length > 0 && kids.every((k) => childrenOf(k).length === 0);
  };

  const measure = (id: string): { w: number; h: number } => {
    const cached = size.get(id);
    if (cached) return cached;
    const kids = childrenOf(id);
    let result: { w: number; h: number };
    if (!kids.length) {
      result = { w: NODE_WIDTH, h: NODE_HEIGHT };
    } else if (isStackParent(id)) {
      result = {
        w: STACK_INDENT + NODE_WIDTH,
        h: NODE_HEIGHT + STACK_TOP + kids.length * NODE_HEIGHT + (kids.length - 1) * STACK_GAP,
      };
    } else {
      const sizes = kids.map(measure);
      const rowW = sizes.reduce((sum, k) => sum + k.w, 0) + GAP_X * (kids.length - 1);
      result = {
        w: Math.max(NODE_WIDTH, rowW),
        h: NODE_HEIGHT + RANK_GAP + Math.max(...sizes.map((k) => k.h)),
      };
    }
    size.set(id, result);
    return result;
  };

  const place = (id: string, x: number, y: number) => {
    const kids = childrenOf(id);
    const { w } = measure(id);
    if (!kids.length) {
      positions.set(id, { x, y });
    } else if (isStackParent(id)) {
      positions.set(id, { x, y });
      kids.forEach((kid, i) => {
        stacked.add(kid);
        positions.set(kid, {
          x: x + STACK_INDENT,
          y: y + NODE_HEIGHT + STACK_TOP + i * (NODE_HEIGHT + STACK_GAP),
        });
      });
    } else {
      positions.set(id, { x: x + (w - NODE_WIDTH) / 2, y });
      const rowW = kids.reduce((sum, k) => sum + measure(k).w, 0) + GAP_X * (kids.length - 1);
      let cx = x + (w - rowW) / 2;
      for (const kid of kids) {
        place(kid, cx, y + NODE_HEIGHT + RANK_GAP);
        cx += measure(kid).w + GAP_X;
      }
    }
  };

  let x = 24;
  for (const top of tops) {
    place(top, x, 24);
    x += measure(top).w + GAP_X * 2;
  }
  return { positions, stacked };
}

type Laid = { positions: Map<string, Point>; stacked: Set<string> };

/** Positions a forest (tops + layout children) with the chosen layout. */
function layoutForest(
  ids: string[],
  tops: string[],
  childrenOf: (id: string) => string[],
  parentOf: Map<string, string>,
  mode: LayoutMode,
): Laid {
  if (mode === "compact") return compactPositions(tops, childrenOf);
  const treeEdges = ids.flatMap((id) => {
    const parent = parentOf.get(id);
    return parent ? [{ id: "", source: parent, target: id }] : [];
  });
  return { positions: dagrePositions(ids, treeEdges, mode === "left-right" ? "LR" : "TB"), stacked: new Set() };
}

/** Breadth-first from `tops`; each card's layout parent is its nearest manager from the top. */
function walk(tops: string[], reportsOf: (id: string) => string[]) {
  const visible: string[] = [];
  const seen = new Set<string>(tops);
  const parentOf = new Map<string, string>();
  const queue = [...tops];
  while (queue.length) {
    const id = queue.shift()!;
    visible.push(id);
    for (const reportId of reportsOf(id)) {
      if (seen.has(reportId)) continue;
      seen.add(reportId);
      parentOf.set(reportId, id);
      queue.push(reportId);
    }
  }
  const children = new Map<string, string[]>();
  for (const id of visible) {
    const parent = parentOf.get(id);
    if (parent) children.set(parent, [...(children.get(parent) ?? []), id]);
  }
  return { visible, seen, parentOf, childrenOf: (id: string) => children.get(id) ?? [] };
}

/** Groups lines into one pair per manager → report, marking the non-layout ones secondary. */
function linePairs(lines: OrgLine[], parentOf: Map<string, string>) {
  const pairs = new Map<string, ReportingEdgeData>();
  for (const line of lines) {
    const key = `${line.manager_id}->${line.user_id}`;
    const pair = pairs.get(key) ?? {
      managerId: line.manager_id,
      userId: line.user_id,
      lines: [],
      dimmed: false,
      secondary: parentOf.get(line.user_id) !== line.manager_id,
    };
    pair.lines.push(line);
    pairs.set(key, pair);
  }
  return [...pairs.values()];
}

const handlesFor = (mode: LayoutMode, stacked: Set<string>) => ({
  sourceHandle: (mode === "left-right" ? "r" : "b") as SourceHandle,
  targetHandleOf: (id: string): TargetHandle => (mode === "left-right" || stacked.has(id) ? "l" : "t"),
});

const lineLabel = (index: OrgIndex, pair: ReportingEdgeData) => {
  const name = (id: string) => index.people.get(id)?.name ?? "Someone";
  const teams = pair.lines.flatMap((line) => (line.team ? [line.team.name] : []));
  return `${name(pair.userId)} reports to ${name(pair.managerId)}${teams.length ? ` in ${teams.join(", ")}` : ""}`;
};

/**
 * Reporting view: the reporting tree, from roots plus people placed on the canvas.
 *
 * Someone with several managers appears once, under their nearest manager from the
 * top (their primary line). Lines to their other managers are secondary: hidden
 * until hovered or selected, and listed on the card instead. Collapsing a manager
 * hides the people reachable only through them.
 */
export function buildReporting(
  index: OrgIndex,
  opts: {
    placed: string[];
    collapsed: Set<string>;
    highlightTeam?: string;
    editable: boolean;
    mode: LayoutMode;
  },
): { nodes: CanvasNode[]; edges: ReportingFlowEdge[]; layoutParent: Map<string, string> } {
  const tops = [...index.roots, ...opts.placed.filter((id) => index.unassigned.includes(id))];
  const { visible, seen, parentOf, childrenOf } = walk(tops, (id) =>
    opts.collapsed.has(id) ? [] : (index.reports.get(id) ?? []),
  );

  const lines = visible.flatMap((id) =>
    (index.managerLines.get(id) ?? []).filter(
      (line) => seen.has(line.manager_id) && !opts.collapsed.has(line.manager_id),
    ),
  );
  const pairs = linePairs(lines, parentOf);
  const { positions, stacked } = layoutForest(visible, tops, childrenOf, parentOf, opts.mode);
  const { sourceHandle, targetHandleOf } = handlesFor(opts.mode, stacked);
  const inTeam = (lines: OrgLine[]) => lines.some((line) => line.team?.uuid === opts.highlightTeam);

  const edges: ReportingFlowEdge[] = pairs.map((pair) => ({
    id: `${pair.managerId}->${pair.userId}`,
    source: pair.managerId,
    target: pair.userId,
    sourceHandle,
    targetHandle: targetHandleOf(pair.userId),
    type: "reporting",
    deletable: opts.editable,
    data: { ...pair, dimmed: !!opts.highlightTeam && !inTeam(pair.lines) },
    ariaLabel: lineLabel(index, pair),
  }));

  const nodes: PersonFlowNode[] = visible.map((id) => {
    const person = index.people.get(id)!;
    const collapsed = opts.collapsed.has(id);
    const primary = parentOf.get(id);
    return {
      id,
      type: "person",
      position: positions.get(id)!,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      draggable: opts.editable,
      connectable: opts.editable,
      data: {
        person,
        targetHandle: targetHandleOf(id),
        sourceHandle,
        reportCount: index.reports.get(id)?.length ?? 0,
        otherManagers: managersOf(index, id)
          .filter((m) => m !== primary)
          .map((m) => index.people.get(m)?.name ?? "Someone"),
        hasPrimaryLine: !!primary,
        hiddenCount: collapsed ? [...descendantsOf(index, id)].filter((d) => !seen.has(d)).length : 0,
        collapsed,
        collapsible: true,
        dimmed: !!opts.highlightTeam && !person.teams.some((team) => team.uuid === opts.highlightTeam),
        dropState: "none",
        editable: opts.editable,
        laneTeam: null,
        isLead: false,
      },
    };
  });

  return { nodes, edges, layoutParent: parentOf };
}

const LANE_PAD = 20;
const LANE_HEADER = 56;
const LANE_GAP = 48;
const LANE_MIN_W = NODE_WIDTH + LANE_PAD * 2;
const LANE_EMPTY_H = 96;
const LANE_ROW_WIDTH = 2400;

/**
 * Teams view: one frame ("lane") per team with its members inside, laid out as a
 * small tree using only the lines between them (outside-team lines, or lines within
 * this team). Members with no manager in the team start the tree, lead first.
 * Someone in several teams has a card in each lane.
 *
 * A member who reports to someone in another lane gets a dotted line to that
 * manager's card there (the lane of the line's team if it has one, else the
 * manager's first lane). Managers in no team have no card; they stay a chip.
 */
export function buildTeams(
  index: OrgIndex,
  opts: {
    teams: TeamOption[];
    highlightTeam?: string;
    editable: boolean;
    editableTeams: boolean;
    mode: LayoutMode;
  },
): { nodes: CanvasNode[]; edges: ReportingFlowEdge[]; layoutParent: Map<string, string> } {
  const nodes: CanvasNode[] = [];
  const edges: ReportingFlowEdge[] = [];
  /** lane card id → lane card id of its layout parent */
  const layoutParent = new Map<string, string>();
  let x = 0;
  let y = 0;
  let rowHeight = 0;

  /** user_id → lanes (team uuids) they have a card in, in lane order */
  const lanesOf = new Map<string, string[]>();
  for (const team of opts.teams) {
    for (const id of index.teamMembers.get(team.uuid) ?? []) {
      lanesOf.set(id, [...(lanesOf.get(id) ?? []), team.uuid]);
    }
  }
  /** Cross-lane lines, keyed by manager card → member card. */
  const crossPairs = new Map<
    string,
    { source: string; target: string; targetHandle: TargetHandle; sourceHandle: SourceHandle; pair: ReportingEdgeData; lanes: string[] }
  >();

  for (const team of opts.teams) {
    const members = index.teamMembers.get(team.uuid) ?? [];
    const memberSet = new Set(members);
    const lines = members.flatMap((id) =>
      (index.managerLines.get(id) ?? []).filter(
        (line) => memberSet.has(line.manager_id) && (!line.team || line.team.uuid === team.uuid),
      ),
    );
    const reportsIn = new Map<string, string[]>();
    const managed = new Set<string>();
    for (const line of lines) {
      managed.add(line.user_id);
      const list = reportsIn.get(line.manager_id) ?? [];
      if (!list.includes(line.user_id)) reportsIn.set(line.manager_id, [...list, line.user_id]);
    }
    const leadId = team.lead?.user_id;
    const tops = members
      .filter((id) => !managed.has(id))
      .sort((a, b) => Number(b === leadId) - Number(a === leadId));
    const { visible, parentOf, childrenOf } = walk(tops, (id) => reportsIn.get(id) ?? []);
    const pairs = linePairs(lines, parentOf);
    const { positions, stacked } = layoutForest(visible, tops, childrenOf, parentOf, opts.mode);
    const { sourceHandle, targetHandleOf } = handlesFor(opts.mode, stacked);

    // Normalise the tree to start inside the frame, below its header.
    const xs = visible.map((id) => positions.get(id)!.x);
    const ys = visible.map((id) => positions.get(id)!.y);
    const minX = xs.length ? Math.min(...xs) : 0;
    const minY = ys.length ? Math.min(...ys) : 0;
    const contentW = xs.length ? Math.max(...xs) - minX + NODE_WIDTH : 0;
    const contentH = ys.length ? Math.max(...ys) - minY + NODE_HEIGHT : LANE_EMPTY_H;
    const width = Math.max(LANE_MIN_W, contentW + LANE_PAD * 2);
    const height = LANE_HEADER + contentH + LANE_PAD;

    if (x > 0 && x + width > LANE_ROW_WIDTH) {
      x = 0;
      y += rowHeight + LANE_GAP;
      rowHeight = 0;
    }

    const lane = laneId(team.uuid);
    const dimmed = !!opts.highlightTeam && team.uuid !== opts.highlightTeam;
    // A parent node must come before its children.
    nodes.push({
      id: lane,
      type: "lane",
      position: { x, y },
      width,
      height,
      style: { width, height },
      draggable: true,
      connectable: false,
      data: { team, memberCount: members.length, dimmed, dropState: "none" },
    });

    for (const id of visible) {
      const at = positions.get(id)!;
      const primary = parentOf.get(id);
      // Managers outside this lane who have a card in another lane get a dotted line.
      const crossManagers = new Set<string>();
      for (const line of index.managerLines.get(id) ?? []) {
        if (memberSet.has(line.manager_id)) continue;
        const managerLanes = lanesOf.get(line.manager_id);
        if (!managerLanes?.length) continue;
        const toLane =
          line.team && managerLanes.includes(line.team.uuid) ? line.team.uuid : managerLanes[0];
        crossManagers.add(line.manager_id);
        const source = laneCardId(toLane, line.manager_id);
        const target = laneCardId(team.uuid, id);
        const key = `${source}->${target}`;
        const entry = crossPairs.get(key) ?? {
          source,
          target,
          // Leave from the side the tree doesn't use, so the line doesn't run down
          // behind the manager's own reports and look like it starts at one of them.
          sourceHandle: (opts.mode === "left-right" ? "b" : "r") as SourceHandle,
          targetHandle: targetHandleOf(id),
          lanes: [toLane, team.uuid],
          pair: { managerId: line.manager_id, userId: id, lines: [], dimmed: false, secondary: false, crossTeam: true },
        };
        entry.pair.lines.push(line);
        crossPairs.set(key, entry);
      }
      if (primary) layoutParent.set(laneCardId(team.uuid, id), laneCardId(team.uuid, primary));
      nodes.push({
        id: laneCardId(team.uuid, id),
        type: "person",
        parentId: lane,
        position: { x: at.x - minX + LANE_PAD, y: at.y - minY + LANE_HEADER },
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        draggable: opts.editable || opts.editableTeams,
        connectable: opts.editable,
        data: {
          person: index.people.get(id)!,
          targetHandle: targetHandleOf(id),
          sourceHandle,
          reportCount: reportsIn.get(id)?.length ?? 0,
          otherManagers: managersOf(index, id)
            .filter((m) => m !== primary && !crossManagers.has(m))
            .map((m) => index.people.get(m)?.name ?? "Someone"),
          hasPrimaryLine: !!primary || crossManagers.size > 0,
          hiddenCount: 0,
          collapsed: false,
          collapsible: false,
          dimmed,
          dropState: "none",
          editable: opts.editable,
          laneTeam: team.uuid,
          isLead: id === leadId,
        },
      });
    }

    for (const pair of pairs) {
      edges.push({
        id: `${lane}/${pair.managerId}->${pair.userId}`,
        source: laneCardId(team.uuid, pair.managerId),
        target: laneCardId(team.uuid, pair.userId),
        sourceHandle,
        targetHandle: targetHandleOf(pair.userId),
        type: "reporting",
        deletable: opts.editable,
        data: { ...pair, dimmed },
        ariaLabel: lineLabel(index, pair),
      });
    }

    x += width + LANE_GAP;
    rowHeight = Math.max(rowHeight, height);
  }

  for (const { source, target, sourceHandle, targetHandle, pair, lanes } of crossPairs.values()) {
    edges.push({
      id: `cross:${source}->${target}`,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: "reporting",
      deletable: opts.editable,
      data: { ...pair, dimmed: !!opts.highlightTeam && !lanes.includes(opts.highlightTeam) },
      ariaLabel: lineLabel(index, pair),
    });
  }

  return { nodes, edges, layoutParent };
}
