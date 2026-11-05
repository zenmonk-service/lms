import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { OrgGraph, OrgLine, OrgPerson } from "@/features/team/team.type";

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
  managerCount: number;
  hiddenCount: number;
  collapsed: boolean;
  dimmed: boolean;
  dropState: "none" | "valid" | "invalid";
  editable: boolean;
};

export type PersonFlowNode = Node<PersonNodeData, "person">;

/** One edge per manager → report pair; `lines` holds each team it applies in. */
export type ReportingEdgeData = {
  managerId: string;
  userId: string;
  lines: OrgLine[];
  dimmed: boolean;
};

export type ReportingFlowEdge = Edge<ReportingEdgeData, "reporting">;

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

  return { people, managerLines, reports, roots, unassigned };
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

/**
 * Builds React Flow nodes/edges for everything visible (roots, plus extra
 * top-level people placed on the canvas) and positions them with the chosen layout.
 *
 * Someone with several managers appears once. Collapsing a manager hides the people
 * reachable only through them. For the tree-shaped compact layout each card sits
 * under the first manager that reaches it (its "layout parent"); the other lines are
 * still drawn.
 */
export function buildGraph(
  index: OrgIndex,
  opts: {
    placed: string[];
    collapsed: Set<string>;
    highlightTeam?: string;
    editable: boolean;
    mode: LayoutMode;
  },
): { nodes: PersonFlowNode[]; edges: ReportingFlowEdge[]; layoutParent: Map<string, string> } {
  const expandedReports = (id: string) =>
    opts.collapsed.has(id) ? [] : (index.reports.get(id) ?? []);
  const tops = [
    ...index.roots,
    ...opts.placed.filter((id) => index.unassigned.includes(id)),
  ];

  // Breadth-first, so each card's layout parent is its nearest manager from the top.
  const visible: string[] = [];
  const seen = new Set<string>();
  const layoutParent = new Map<string, string>();
  const queue = [...tops];
  tops.forEach((id) => seen.add(id));
  while (queue.length) {
    const id = queue.shift()!;
    visible.push(id);
    for (const reportId of expandedReports(id)) {
      if (seen.has(reportId)) continue;
      seen.add(reportId);
      layoutParent.set(reportId, id);
      queue.push(reportId);
    }
  }

  const treeChildren = new Map<string, string[]>();
  for (const id of visible) {
    const parent = layoutParent.get(id);
    if (parent) treeChildren.set(parent, [...(treeChildren.get(parent) ?? []), id]);
  }

  // One edge per visible manager → report pair.
  const pairs = new Map<string, ReportingEdgeData>();
  for (const id of visible) {
    for (const line of index.managerLines.get(id) ?? []) {
      if (!seen.has(line.manager_id) || opts.collapsed.has(line.manager_id)) continue;
      const key = `${line.manager_id}->${id}`;
      const pair = pairs.get(key) ?? { managerId: line.manager_id, userId: id, lines: [], dimmed: false };
      pair.lines.push(line);
      pairs.set(key, pair);
    }
  }

  let positions: Map<string, Point>;
  let stacked = new Set<string>();
  if (opts.mode === "compact") {
    ({ positions, stacked } = compactPositions(tops, (id) => treeChildren.get(id) ?? []));
  } else {
    positions = dagrePositions(
      visible,
      [...pairs.values()].map((p) => ({ id: "", source: p.managerId, target: p.userId })),
      opts.mode === "left-right" ? "LR" : "TB",
    );
  }

  const sourceHandle: SourceHandle = opts.mode === "left-right" ? "r" : "b";
  const targetHandleOf = (id: string): TargetHandle =>
    opts.mode === "left-right" || stacked.has(id) ? "l" : "t";
  const nameOf = (id: string) => index.people.get(id)?.name ?? "Someone";

  const edges: ReportingFlowEdge[] = [...pairs.entries()].map(([key, pair]) => {
    const teams = pair.lines.flatMap((line) => (line.team ? [line.team.name] : []));
    return {
      id: key,
      source: pair.managerId,
      target: pair.userId,
      sourceHandle,
      targetHandle: targetHandleOf(pair.userId),
      type: "reporting",
      deletable: opts.editable,
      data: {
        ...pair,
        dimmed:
          !!opts.highlightTeam &&
          !pair.lines.some((line) => line.team?.uuid === opts.highlightTeam),
      },
      ariaLabel: `${nameOf(pair.userId)} reports to ${nameOf(pair.managerId)}${teams.length ? ` in ${teams.join(", ")}` : ""}`,
    };
  });

  const nodes: PersonFlowNode[] = visible.map((id) => {
    const person = index.people.get(id)!;
    const collapsed = opts.collapsed.has(id);
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
        managerCount: managersOf(index, id).length,
        hiddenCount: collapsed
          ? [...descendantsOf(index, id)].filter((d) => !seen.has(d)).length
          : 0,
        collapsed,
        dimmed:
          !!opts.highlightTeam &&
          !person.teams.some((team) => team.uuid === opts.highlightTeam),
        dropState: "none",
        editable: opts.editable,
      },
    };
  });

  return { nodes, edges, layoutParent };
}
