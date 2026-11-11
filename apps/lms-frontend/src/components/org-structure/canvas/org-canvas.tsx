"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeTypes,
  type NodeTypes,
  type OnBeforeDelete,
  type OnNodeDrag,
} from "@xyflow/react";
import { useIsDarkMode } from "@/hooks/use-is-dark-mode";
import { LoaderCircle, Network, Plus, UserPlus, UserRoundX, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import { toastError } from "@/shared/toast/toast-error";
import { useAppDispatch, useAppSelector } from "@/store";
import { getTeamAction, listTeamOptionsAction } from "@/features/team/team.action";
import type { Team } from "@/features/team/team.type";
import { UserPicker } from "@/components/team/pickers/user-picker";
import CreateUser from "@/components/user/create-user";
import TeamDetailSheet from "@/components/team/team-detail";
import TeamFormDialog from "@/components/team/team-form";
import type { UserOption } from "@/shared/hooks/use-user-options";
import { OrgCanvasContext, type OrgCanvasActions } from "./canvas-context";
import PersonNode from "./person-node";
import TeamLaneNode from "./team-lane-node";
import ReportingEdge from "./reporting-edge";
import PersonPanel from "./person-panel";
import UnassignedTray, { UNASSIGNED_DRAG_TYPE } from "./unassigned-tray";
import ArrangeMenu from "./arrange-menu";
import { useOrgHierarchy } from "./use-org-hierarchy";
import {
  buildReporting,
  buildTeams,
  canReport,
  descendantsOf,
  isLaneId,
  laneId,
  laneTeamOf,
  linesBetween,
  managersOf,
  personIdOf,
  type CanvasEdge,
  type CanvasNode,
  type LayoutMode,
  type OrgIndex,
} from "./layout";

const nodeTypes: NodeTypes = { person: PersonNode, lane: TeamLaneNode };
const edgeTypes: EdgeTypes = { reporting: ReportingEdge };
const ALL_TEAMS = "__all__";

/** "reporting": the reporting tree. "teams": one lane per team. */
type ViewMode = "reporting" | "teams";

type PendingChange =
  /** Dropped on someone while having no manager: they become the manager. */
  | { kind: "add"; userId: string; managerId: string; teamUuid: string | null }
  /** Dropped on someone while already reporting to `fromId`: move or add? */
  | { kind: "drop"; userId: string; managerId: string; fromId: string; teamUuid: string | null }
  | { kind: "unlink"; userId: string; managerId: string }
  /** Dropped on a team lane (or a card in it): join the team. */
  | { kind: "join"; userId: string; teamUuid: string };

/** What dropping a person on a node would do. */
type DropAction =
  | { kind: "join"; teamUuid: string }
  | { kind: "manager"; managerId: string; teamUuid: string | null }
  /** Dropped back into their own lane: nothing to change. */
  | { kind: "none" };

type DropResult = { ok: true; action: DropAction } | { ok: false; reason: string };

interface DropTarget {
  id: string;
  valid: boolean;
}

/** Pointer position of a mouse or touch drag event. */
const clientPoint = (event: MouseEvent | TouchEvent | React.MouseEvent) => {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
  }
  return { x: event.clientX, y: event.clientY };
};

/** The team lane a node sits in (the lane itself, or a card's parent), if any. */
const laneOf = (node: CanvasNode | undefined) => {
  if (!node) return null;
  if (node.type === "lane") return laneTeamOf(node.id);
  return node.parentId && isLaneId(node.parentId) ? laneTeamOf(node.parentId) : null;
};

/**
 * What dropping person `userId` (coming from lane `fromLane`, or null) on `target` does.
 * Onto a lane, or a card in another lane: join that team. Onto a card otherwise: that
 * person becomes a manager (within the lane's team, in the Teams view).
 */
const resolveDrop = (
  index: OrgIndex,
  userId: string,
  fromLane: string | null,
  target: CanvasNode,
  perms: { editable: boolean; canEditTeams: boolean },
  teamFor: (userId: string, managerId: string) => string | null,
): DropResult => {
  const targetLane = laneOf(target);
  if (targetLane && (target.type === "lane" || targetLane !== fromLane)) {
    const isMember = index.people.get(userId)?.teams.some((t) => t.uuid === targetLane);
    if (isMember) {
      return targetLane === fromLane
        ? { ok: true, action: { kind: "none" } }
        : { ok: false, reason: "They're already in this team." };
    }
    if (!perms.canEditTeams) return { ok: false, reason: "You can't change team members." };
    return { ok: true, action: { kind: "join", teamUuid: targetLane } };
  }

  const managerId = personIdOf(target);
  if (!managerId || managerId === userId) return { ok: true, action: { kind: "none" } };
  if (!perms.editable) return { ok: false, reason: "You can't change reporting lines." };
  if (linesBetween(index, userId, managerId).length) {
    return { ok: false, reason: "They already report to this person." };
  }
  if (!canReport(index, userId, managerId)) {
    return { ok: false, reason: "Can't put someone under a person who reports to them." };
  }
  return {
    ok: true,
    action: { kind: "manager", managerId, teamUuid: targetLane ?? teamFor(userId, managerId) },
  };
};

interface OrgCanvasProps {
  editable: boolean;
  /** Can create users (shows "Add person"). */
  canCreate: boolean;
  canReadTeams: boolean;
  /** Can add/remove team members and edit teams. */
  canEditTeams: boolean;
  canCreateTeams: boolean;
  /** Team whose members are highlighted (others dimmed); undefined for none. */
  highlightTeam?: string;
  onHighlightTeamChange: (teamUuid: string | undefined) => void;
}

function OrgCanvasInner({
  editable,
  canCreate,
  canReadTeams,
  canEditTeams,
  canCreateTeams,
  highlightTeam,
  onHighlightTeamChange,
}: OrgCanvasProps) {
  const dispatch = useAppDispatch();
  const orgUuid = useAppSelector((s) => s.organizationsSlice.currentOrganization?.uuid);
  const teamOptions = useAppSelector((s) => s.teamSlice.teamOptions);
  const isDark = useIsDarkMode();
  const { screenToFlowPosition, getIntersectingNodes, fitView, setCenter, getZoom, getNodes, getInternalNode } =
    useReactFlow<CanvasNode, CanvasEdge>();

  const hierarchy = useOrgHierarchy(true);
  const { index, isLoading, isMutating, reload, setTeams, joinTeam } = hierarchy;

  const [mode, setMode] = useState<LayoutMode>("top-down");
  const [view, setView] = useState<ViewMode>("reporting");
  const teamsView = view === "teams" && canReadTeams;
  /** Nodes moved by hand this session (not saved; a reload uses the layout again). */
  const manual = useRef(new Map<string, { x: number; y: number }>());
  /** Positions at drag start, to restore when a drop lands on a card instead of empty space. */
  const dragOrigin = useRef<{ ids: Set<string>; at: Map<string, { x: number; y: number }> } | null>(null);

  // A person whose managers change goes back to their computed spot.
  const { addManager: saveAdd, moveManager: saveMove, removeManager: saveRemove, removeLine: saveRemoveLine } =
    hierarchy;
  const addManager = useCallback(
    (userId: string, managerId: string, teamUuid: string | null = null) => {
      manual.current.delete(userId);
      return saveAdd(userId, managerId, teamUuid);
    },
    [saveAdd],
  );
  const moveManager = useCallback(
    (userId: string, fromId: string, toId: string) => {
      manual.current.delete(userId);
      return saveMove(userId, fromId, toId);
    },
    [saveMove],
  );
  const removeManager = useCallback(
    (userId: string, managerId: string) => {
      manual.current.delete(userId);
      return saveRemove(userId, managerId);
    },
    [saveRemove],
  );
  /** Open "Create user" dialog; `manager` pre-fills Reports To. */
  const [creating, setCreating] = useState<{ manager: UserOption | null } | null>(null);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [placed, setPlaced] = useState<string[]>([]);
  /** Selected and hovered people (user ids; a person can have a card in several lanes). */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const team = highlightTeam ?? ALL_TEAMS;
  const setTeam = (value: string) =>
    onHighlightTeamChange(value === ALL_TEAMS ? undefined : value);
  const [showTray, setShowTray] = useState(false);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [dropChoice, setDropChoice] = useState<"move" | "add">("move");
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const hasFitted = useRef(false);
  /** Team whose detail sheet is open. */
  const [viewingTeam, setViewingTeam] = useState<string | null>(null);
  /** Open team create (team: null) / edit dialog. */
  const [teamForm, setTeamForm] = useState<{ team: Team | null } | null>(null);
  const viewingTeamDetail = useAppSelector((s) => s.teamSlice.selectedTeam);

  const loadTeamOptions = useCallback(() => {
    if (orgUuid && canReadTeams) dispatch(listTeamOptionsAction({ org_uuid: orgUuid }));
  }, [orgUuid, canReadTeams, dispatch]);

  useEffect(() => {
    loadTeamOptions();
  }, [loadTeamOptions]);

  /** After a team or its members change elsewhere (sheet, form): refetch both. */
  const refreshTeams = useCallback(() => {
    reload();
    loadTeamOptions();
  }, [reload, loadTeamOptions]);

  const teamNameOf = useCallback(
    (teamUuid: string) => teamOptions.find((t) => t.uuid === teamUuid)?.name ?? "the team",
    [teamOptions],
  );

  const layout = useMemo(() => {
    const highlight = team === ALL_TEAMS ? undefined : team;
    return teamsView
      ? buildTeams(index, { teams: teamOptions, highlightTeam: highlight, editable, editableTeams: canEditTeams, mode })
      : buildReporting(index, { placed, collapsed, highlightTeam: highlight, editable, mode });
  }, [teamsView, index, teamOptions, placed, collapsed, team, editable, canEditTeams, mode]);

  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout.nodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>([]);
  // Edges are state too, so React Flow can mark one selected (to show its remove button).
  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasEdge>([]);

  // Secondary lines only show around the hovered/selected person (or while selected).
  const focusId = hoveredId ?? selectedId;
  useEffect(() => {
    setEdges((current) => {
      const selectedEdges = new Set(current.filter((e) => e.selected).map((e) => e.id));
      return layout.edges.map((e) => {
        const selected = selectedEdges.has(e.id);
        const nearFocus = !!focusId && (e.data?.userId === focusId || e.data?.managerId === focusId);
        return { ...e, selected, hidden: !!e.data?.secondary && !selected && !nearFocus };
      });
    });
  }, [layout, focusId, setEdges]);

  const isSelected = useCallback(
    (n: CanvasNode) => !!selectedId && personIdOf(n) === selectedId,
    [selectedId],
  );

  /** Computed layout, with nodes moved by hand kept where they were put. */
  const applyLayout = useCallback(() => {
    setNodes(
      layout.nodes.map((n) => ({
        ...n,
        position: manual.current.get(n.id) ?? n.position,
        selected: isSelected(n),
      })),
    );
  }, [layout, isSelected, setNodes]);

  // Re-apply whenever the data or view options change.
  useEffect(() => {
    applyLayout();
  }, [layout]); // eslint-disable-line react-hooks/exhaustive-deps

  const refit = useCallback(
    () =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => fitView({ padding: 0.15, maxZoom: 1, duration: 400 })),
      ),
    [fitView],
  );

  const arrange = useCallback(
    (next: LayoutMode) => {
      manual.current.clear();
      if (next === mode) {
        setNodes(layout.nodes.map((n) => ({ ...n, selected: isSelected(n) })));
      } else {
        setMode(next);
      }
      refit();
    },
    [mode, layout.nodes, isSelected, setNodes, refit],
  );

  const switchView = (next: ViewMode) => {
    if (next === view) return;
    setView(next);
    setShowTray(false);
    setDropTarget(null);
    refit();
  };

  useEffect(() => {
    setNodes((current) =>
      current.map((n) => {
        const dropState = dropTarget?.id === n.id ? (dropTarget.valid ? "valid" : "invalid") : "none";
        const selected = isSelected(n);
        return n.data.dropState === dropState && n.selected === selected
          ? n
          : ({ ...n, selected, data: { ...n.data, dropState } } as CanvasNode);
      }),
    );
  }, [dropTarget, isSelected, setNodes]);

  useEffect(() => {
    if (!hasFitted.current && layout.nodes.length) {
      hasFitted.current = true;
      requestAnimationFrame(() => fitView({ padding: 0.15, maxZoom: 1 }));
    }
  }, [layout.nodes.length, fitView]);

  // Frame the highlighted team (its lane, or its members' cards) once laid out.
  const framedTeam = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!highlightTeam || framedTeam.current === highlightTeam || !layout.nodes.length) return;
    framedTeam.current = highlightTeam;
    const targets = layout.nodes
      .filter((n) =>
        n.type === "lane"
          ? n.id === laneId(highlightTeam)
          : !n.parentId && n.data.person.teams.some((t) => t.uuid === highlightTeam),
      )
      .map((n) => ({ id: n.id }));
    if (targets.length) {
      hasFitted.current = true;
      requestAnimationFrame(() => fitView({ nodes: targets, padding: 0.3, maxZoom: 1, duration: 400 }));
    }
  }, [highlightTeam, layout.nodes, fitView]);

  // Everyone not on the canvas: no lines (Reporting), or no team (Teams).
  const offCanvas = useMemo(() => {
    if (teamsView) {
      return [...index.people.values()]
        .filter((p) => !p.teams.length)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return index.unassigned
      .filter((id) => !nodeById.has(id))
      .map((id) => index.people.get(id)!)
      .filter(Boolean);
  }, [teamsView, index, nodeById]);

  const focusPerson = useCallback(
    (userId: string) => {
      setSelectedId(userId);
      const node = layout.nodes.find((n) => personIdOf(n) === userId);
      const at = node && getInternalNode(node.id)?.internals.positionAbsolute;
      if (node && at) {
        setCenter(at.x + (node.width ?? 0) / 2, at.y + (node.height ?? 0) / 2, {
          zoom: Math.max(getZoom(), 0.9),
          duration: 400,
        });
      } else if (offCanvas.some((p) => p.user_id === userId)) {
        setShowTray(true);
      }
    },
    [layout.nodes, getInternalNode, setCenter, getZoom, offCanvas],
  );

  const actions: OrgCanvasActions = useMemo(
    () => ({
      toggleCollapse: (userId) =>
        setCollapsed((prev) => {
          const next = new Set(prev);
          if (next.has(userId)) next.delete(userId);
          else next.add(userId);
          return next;
        }),
      select: (userId) => setSelectedId(userId),
      requestUnlink: (userId, managerId) => setPending({ kind: "unlink", userId, managerId }),
      openTeam: (teamUuid) => {
        setSelectedId(null);
        setViewingTeam(teamUuid);
      },
    }),
    [],
  );

  /** With a team highlighted and both people in it, new lines apply within that team. */
  const teamFor = useCallback(
    (userId: string, managerId: string) => {
      if (team === ALL_TEAMS) return null;
      const inTeam = (id: string) => index.people.get(id)?.teams.some((t) => t.uuid === team);
      return inTeam(userId) && inTeam(managerId) ? team : null;
    },
    [team, index],
  );

  const perms = useMemo(() => ({ editable, canEditTeams }), [editable, canEditTeams]);

  /** The node under a screen point (a card before the lane it sits in), ignoring `exclude`. */
  const nodeAtPoint = useCallback(
    (clientX: number, clientY: number, exclude: Set<string> = new Set()) => {
      const point = screenToFlowPosition({ x: clientX, y: clientY });
      const hits = getIntersectingNodes({ x: point.x, y: point.y, width: 1, height: 1 }).filter(
        (n) => !exclude.has(n.id),
      );
      return hits.find((n) => n.type === "person") ?? hits.find((n) => n.type === "lane");
    },
    [screenToFlowPosition, getIntersectingNodes],
  );

  /** The person a card's layout parent shows (the manager it hangs under). */
  const primaryManagerOf = useCallback(
    (nodeId: string, userId: string) => {
      const parent = layout.layoutParent.get(nodeId);
      const parentNode = parent ? nodeById.get(parent) : undefined;
      return (parentNode && personIdOf(parentNode)) ?? managersOf(index, userId)[0];
    },
    [layout.layoutParent, nodeById, index],
  );

  // ── Drag: move freely; Shift moves the branch; drop on a card or lane to change things ──
  const onNodeDragStart: OnNodeDrag<CanvasNode> = useCallback(
    (event, node) => {
      const ids = new Set([node.id]);
      if (event.shiftKey && !teamsView && node.type === "person") {
        descendantsOf(index, node.id).forEach((id) => ids.add(id));
      }
      const at = new Map<string, { x: number; y: number }>();
      for (const n of getNodes()) if (ids.has(n.id)) at.set(n.id, { ...n.position });
      dragOrigin.current = { ids, at };
    },
    [index, getNodes, teamsView],
  );

  const onNodeDrag: OnNodeDrag<CanvasNode> = useCallback(
    (event, node) => {
      if (node.type !== "person") return; // Lanes just move.
      const origin = dragOrigin.current;
      if (origin && origin.ids.size > 1) {
        const start = origin.at.get(node.id)!;
        const dx = node.position.x - start.x;
        const dy = node.position.y - start.y;
        setNodes((current) =>
          current.map((n) => {
            const from = n.id !== node.id ? origin.at.get(n.id) : undefined;
            return from ? { ...n, position: { x: from.x + dx, y: from.y + dy } } : n;
          }),
        );
      }
      const { x, y } = clientPoint(event);
      const target = nodeAtPoint(x, y, origin?.ids ?? new Set([node.id]));
      setDropTarget((prev) => {
        if (!target) return prev ? null : prev;
        const result = resolveDrop(index, node.data.person.user_id, laneOf(node), target, perms, teamFor);
        // Dropping back into your own lane changes nothing: don't light it up.
        if (result.ok && result.action.kind === "none") return prev ? null : prev;
        const valid = result.ok;
        return prev?.id === target.id && prev.valid === valid ? prev : { id: target.id, valid };
      });
    },
    [nodeAtPoint, index, setNodes, perms, teamFor],
  );

  const onNodeDragStop: OnNodeDrag<CanvasNode> = useCallback(
    (event, node) => {
      const origin = dragOrigin.current;
      dragOrigin.current = null;
      setDropTarget(null);
      if (node.type !== "person") {
        manual.current.set(node.id, { ...node.position });
        return;
      }
      const movedIds = origin?.ids ?? new Set([node.id]);
      const restore = () => {
        if (!origin) return;
        setNodes((current) =>
          current.map((n) => {
            const from = origin.at.get(n.id);
            return from ? { ...n, position: from } : n;
          }),
        );
      };
      // Resolve the target from the release point, not from state: the last
      // onNodeDrag update may not have rendered yet.
      const { x, y } = clientPoint(event);
      const target = nodeAtPoint(x, y, movedIds);
      const userId = node.data.person.user_id;
      const result = target ? resolveDrop(index, userId, laneOf(node), target, perms, teamFor) : null;

      if (!result || (result.ok && result.action.kind === "none")) {
        // Empty space: in the reporting tree the card stays where it was put; lanes
        // keep their own layout.
        if (teamsView) {
          restore();
        } else {
          for (const n of getNodes()) {
            if (movedIds.has(n.id)) manual.current.set(n.id, { ...n.position });
          }
        }
        return;
      }

      // Dropped on something: put everything back, then ask about the change.
      restore();
      if (!result.ok) {
        toastError(result.reason);
      } else if (result.action.kind === "join") {
        setPending({ kind: "join", userId, teamUuid: result.action.teamUuid });
      } else if (result.action.kind === "manager") {
        const { managerId, teamUuid } = result.action;
        const fromId = primaryManagerOf(node.id, userId);
        setDropChoice("move");
        setPending(
          fromId
            ? { kind: "drop", userId, managerId, fromId, teamUuid }
            : { kind: "add", userId, managerId, teamUuid },
        );
      }
    },
    [nodeAtPoint, index, perms, teamFor, teamsView, getNodes, setNodes, primaryManagerOf],
  );

  // ── Draw a line from a manager's source handle to a report's target handle ──
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const source = connection.source ? nodeById.get(connection.source) : undefined;
      const target = connection.target ? nodeById.get(connection.target) : undefined;
      const userId = target && personIdOf(target);
      if (!source || !userId || source.type !== "person") return false;
      // Lines are drawn inside one lane (or anywhere in the reporting tree).
      if (laneOf(source) !== laneOf(target)) return false;
      const result = resolveDrop(index, userId, laneOf(target), source, perms, teamFor);
      return result.ok && result.action.kind === "manager";
    },
    [nodeById, index, perms, teamFor],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const source = connection.source ? nodeById.get(connection.source) : undefined;
      const target = connection.target ? nodeById.get(connection.target) : undefined;
      const managerId = source && personIdOf(source);
      const userId = target && personIdOf(target);
      if (!managerId || !userId) return;
      addManager(userId, managerId, laneOf(target) ?? teamFor(userId, managerId));
    },
    [nodeById, addManager, teamFor],
  );

  // ── Delete a line (select it, then Backspace/Delete or its × button) ──
  const onBeforeDelete: OnBeforeDelete<CanvasNode, CanvasEdge> = useCallback(async ({ edges }) => {
    const data = edges[0]?.data;
    if (data) setPending({ kind: "unlink", userId: data.userId, managerId: data.managerId });
    return false;
  }, []);

  // ── Drop someone from the tray ──
  const trayEditable = teamsView ? canEditTeams : editable;
  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!trayEditable || !event.dataTransfer.types.includes(UNASSIGNED_DRAG_TYPE)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const target = nodeAtPoint(event.clientX, event.clientY);
      setDropTarget((prev) => {
        if (!target) return prev ? null : prev;
        // The person isn't known until drop; judge by what the target accepts.
        const valid = laneOf(target) ? canEditTeams : editable;
        return prev?.id === target.id && prev.valid === valid ? prev : { id: target.id, valid };
      });
    },
    [trayEditable, nodeAtPoint, canEditTeams, editable],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      const userId = event.dataTransfer.getData(UNASSIGNED_DRAG_TYPE);
      setDropTarget(null);
      if (!userId) return;
      event.preventDefault();
      const target = nodeAtPoint(event.clientX, event.clientY);
      if (!target) {
        if (teamsView) return;
        // Reporting tree, empty canvas: show them as a top-level card to build under.
        setPlaced((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
        setSelectedId(userId);
        return;
      }
      const result = resolveDrop(index, userId, null, target, perms, teamFor);
      if (!result.ok) toastError(result.reason);
      else if (result.action.kind === "join") {
        joinTeam(userId, result.action.teamUuid, teamNameOf(result.action.teamUuid));
      } else if (result.action.kind === "manager") {
        addManager(userId, result.action.managerId, result.action.teamUuid);
      }
    },
    [nodeAtPoint, teamsView, index, perms, teamFor, joinTeam, teamNameOf, addManager],
  );

  const confirmPending = async () => {
    if (!pending) return;
    let ok: boolean;
    if (pending.kind === "join") {
      ok = await joinTeam(pending.userId, pending.teamUuid, teamNameOf(pending.teamUuid));
    } else if (pending.kind === "unlink") {
      ok = await removeManager(pending.userId, pending.managerId);
    } else if (pending.kind === "drop" && dropChoice === "move") {
      ok = await moveManager(pending.userId, pending.fromId, pending.managerId);
    } else {
      ok = await addManager(pending.userId, pending.managerId, pending.teamUuid);
    }
    if (!ok) throw new Error("not saved");
  };

  const nameOf = (id: string) => index.people.get(id)?.name ?? "Someone";
  const pendingCopy = (() => {
    if (!pending) return { title: "", description: "" };
    const name = nameOf(pending.userId);
    if (pending.kind === "join") {
      const teamName = teamNameOf(pending.teamUuid);
      return { title: `Add ${name} to ${teamName}?`, description: `${name} becomes a member of ${teamName}.` };
    }
    const managerName = nameOf(pending.managerId);
    const within = "teamUuid" in pending && pending.teamUuid ? ` within ${teamNameOf(pending.teamUuid)}` : "";
    if (pending.kind === "add") {
      return { title: `Put ${name} under ${managerName}?`, description: `${name} will report to ${managerName}${within}.` };
    }
    if (pending.kind === "drop") {
      return { title: `${name} → ${managerName}`, description: `${name} already reports to ${nameOf(pending.fromId)}.` };
    }
    const lines = linesBetween(index, pending.userId, pending.managerId);
    const teams = lines.flatMap((line) => (line.team ? [line.team.name] : []));
    const others = managersOf(index, pending.userId).filter((id) => id !== pending.managerId);
    return {
      title: `Remove ${name}'s line to ${managerName}?`,
      description:
        `${name} will no longer report to ${managerName}${teams.length ? ` (${teams.join(", ")})` : ""}. ` +
        (others.length
          ? `They still report to ${others.map(nameOf).join(", ")}.`
          : "They become top-level."),
    };
  })();

  const selected = selectedId ? index.people.get(selectedId) : null;
  const isEmpty = !isLoading && layout.nodes.length === 0;
  const trayLabel = teamsView ? "No team" : "Unassigned";

  return (
    <OrgCanvasContext.Provider value={actions}>
      <div
        className="relative h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-xl border bg-muted/30"
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null);
        }}
      >
        <ReactFlow<CanvasNode, CanvasEdge>
          nodes={nodes}
          edges={edges}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={(_e, node) => {
            const userId = personIdOf(node);
            if (userId) setSelectedId(userId);
          }}
          onNodeMouseEnter={(_e, node) => setHoveredId(personIdOf(node))}
          onNodeMouseLeave={() => setHoveredId(null)}
          onPaneClick={() => setSelectedId(null)}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onBeforeDelete={onBeforeDelete}
          nodesConnectable={editable}
          edgesFocusable={editable}
          elementsSelectable
          selectionKeyCode={null}
          minZoom={0.1}
          maxZoom={1.75}
          colorMode={isDark ? "dark" : "light"}
          defaultEdgeOptions={{ type: "reporting" }}
          connectionLineStyle={{ strokeWidth: 2, strokeDasharray: "6 4" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1.2} />
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeBorderRadius={8}
            className="!rounded-lg !border !bg-background max-sm:!hidden"
            maskColor="color-mix(in oklab, var(--muted) 60%, transparent)"
            nodeColor={(n) =>
              n.type === "lane"
                ? "color-mix(in oklab, var(--muted-foreground) 12%, transparent)"
                : isSelected(n as CanvasNode)
                  ? "var(--foreground)"
                  : "color-mix(in oklab, var(--muted-foreground) 45%, transparent)"
            }
          />
          <Controls
            position="bottom-center"
            orientation="horizontal"
            showInteractive={false}
            className="!overflow-hidden !rounded-lg !border !shadow-sm"
          >
            <ArrangeMenu mode={mode} onArrange={arrange} />
          </Controls>

          <Panel position="top-left" className="!m-3 flex flex-wrap items-center gap-2">
            {canReadTeams && (
              <ToggleGroup
                type="single"
                variant="outline"
                value={view}
                onValueChange={(value) => value && switchView(value as ViewMode)}
                className="bg-background"
                aria-label="Canvas view"
              >
                <ToggleGroupItem value="reporting" className="gap-1.5 px-3" aria-label="Reporting lines">
                  <Network className="size-4" />
                  Reporting
                </ToggleGroupItem>
                <ToggleGroupItem value="teams" className="gap-1.5 px-3" aria-label="Teams">
                  <UsersRound className="size-4" />
                  Teams
                </ToggleGroupItem>
              </ToggleGroup>
            )}
            <div className="w-56">
              <UserPicker
                value={null}
                onChange={(user) => user && focusPerson(user.user_id)}
                placeholder="Find a person"
              />
            </div>
            {canReadTeams && teamOptions.length > 0 && (
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger className="w-40 bg-background">
                  <SelectValue placeholder="Highlight team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_TEAMS}>All teams</SelectItem>
                  {teamOptions.map((t) => (
                    <SelectItem key={t.uuid} value={t.uuid}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant={showTray ? "secondary" : "outline"}
              className="bg-background"
              onClick={() => setShowTray((v) => !v)}
            >
              <UserRoundX className="size-4" />
              {trayLabel}
              <Badge variant="secondary">{offCanvas.length}</Badge>
            </Button>
            {teamsView
              ? canCreateTeams && (
                  <Button className="bg-background" variant="outline" onClick={() => setTeamForm({ team: null })}>
                    <Plus className="size-4" />
                    New team
                  </Button>
                )
              : canCreate && (
                  <Button className="bg-background" variant="outline" onClick={() => setCreating({ manager: null })}>
                    <UserPlus className="size-4" />
                    Add person
                  </Button>
                )}
            {isMutating && <LoaderCircle className="size-4 animate-spin text-muted-foreground" />}
          </Panel>
        </ReactFlow>

        {showTray && (
          <div className="absolute bottom-3 left-3 top-16 z-10">
            <UnassignedTray
              people={offCanvas}
              editable={trayEditable}
              onClose={() => setShowTray(false)}
              onSelect={setSelectedId}
              {...(teamsView && {
                title: "No team",
                hint: "Drag onto a team to add them.",
                readOnlyHint: "People who aren't in any team.",
              })}
            />
          </div>
        )}

        {selected && orgUuid && (
          <div className="absolute inset-x-2 bottom-2 z-10 h-[60%] sm:inset-x-auto sm:inset-y-3 sm:right-3 sm:h-auto sm:w-[22rem]">
            <PersonPanel
              person={selected}
              index={index}
              orgUuid={orgUuid}
              editable={editable}
              isMutating={isMutating}
              onClose={() => setSelectedId(null)}
              onSelect={focusPerson}
              addManager={addManager}
              removeManager={removeManager}
              removeLine={(userId, managerId, teamUuid) => {
                manual.current.delete(userId);
                return saveRemoveLine(userId, managerId, teamUuid);
              }}
              setTeams={setTeams}
              onAddNewReport={
                canCreate
                  ? () =>
                      setCreating({
                        manager: { user_id: selected.user_id, name: selected.name, email: selected.email },
                      })
                  : undefined
              }
            />
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="pointer-events-auto max-w-sm rounded-xl border bg-background p-5 text-center shadow-sm">
              {teamsView ? (
                <>
                  <p className="font-semibold">No teams yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {canCreateTeams ? "Create a team, then drag people into it." : "Nobody has created a team yet."}
                  </p>
                  {canCreateTeams && (
                    <Button size="sm" className="mt-3" onClick={() => setTeamForm({ team: null })}>
                      New team
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <p className="font-semibold">No reporting lines yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {editable
                      ? "Open Unassigned and drag someone onto the canvas, then drag people onto them to build the tree."
                      : "Nobody has a manager assigned yet."}
                  </p>
                  {!showTray && (
                    <Button size="sm" className="mt-3" onClick={() => setShowTray(true)}>
                      Open Unassigned
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {canCreate && orgUuid && (
        <CreateUser
          org_uuid={orgUuid}
          open={!!creating}
          onOpenChange={(open) => !open && setCreating(null)}
          defaultManager={creating?.manager ?? null}
          defaultTeamUuids={team !== ALL_TEAMS ? [team] : []}
          onCreated={reload}
        />
      )}

      {canReadTeams && (
        <TeamDetailSheet
          teamUuid={viewingTeam}
          onOpenChange={(open) => !open && setViewingTeam(null)}
          canUpdate={canEditTeams}
          canCreatePeople={canCreate}
          onEdit={() => viewingTeamDetail && setTeamForm({ team: viewingTeamDetail })}
          onChanged={refreshTeams}
          onShowOnCanvas={(teamUuid) => {
            setViewingTeam(null);
            switchView("teams");
            framedTeam.current = undefined;
            onHighlightTeamChange(teamUuid);
          }}
        />
      )}
      {(canCreateTeams || canEditTeams) && (
        <TeamFormDialog
          open={!!teamForm}
          onOpenChange={(open) => !open && setTeamForm(null)}
          team={teamForm?.team ?? null}
          onSaved={(teamUuid) => {
            refreshTeams();
            if (teamUuid && teamUuid === viewingTeam && orgUuid) {
              dispatch(getTeamAction({ org_uuid: orgUuid, team_uuid: teamUuid }));
            }
          }}
        />
      )}

      <ConfirmationDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title={pendingCopy.title}
        description={pendingCopy.description}
        isLoading={isMutating}
        handleConfirm={confirmPending}
      >
        {pending?.kind === "drop" && (
          <RadioGroup
            value={dropChoice}
            onValueChange={(value) => setDropChoice(value as "move" | "add")}
            className="mt-3 gap-2"
          >
            {[
              {
                value: "move",
                title: `Move from ${nameOf(pending.fromId)}`,
                hint: `${nameOf(pending.userId)} stops reporting to ${nameOf(pending.fromId)} and reports to ${nameOf(pending.managerId)} instead.`,
              },
              {
                value: "add",
                title: "Add as another manager",
                hint: `${nameOf(pending.userId)} reports to both ${nameOf(pending.fromId)} and ${nameOf(pending.managerId)}.`,
              },
            ].map((option) => (
              <Label
                key={option.value}
                htmlFor={`drop-${option.value}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <RadioGroupItem id={`drop-${option.value}`} value={option.value} className="mt-0.5" />
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium">{option.title}</span>
                  <span className="block text-xs text-muted-foreground">{option.hint}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        )}
      </ConfirmationDialog>
    </OrgCanvasContext.Provider>
  );
}

export default function OrgCanvas(props: OrgCanvasProps) {
  return (
    <ReactFlowProvider>
      <OrgCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
