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
import { useTheme } from "next-themes";
import { LoaderCircle, UserPlus, UserRoundX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { listTeamOptionsAction } from "@/features/team/team.action";
import { UserPicker } from "@/components/team/pickers/user-picker";
import CreateUser from "@/components/user/create-user";
import type { UserOption } from "@/shared/hooks/use-user-options";
import { OrgCanvasContext, type OrgCanvasActions } from "./canvas-context";
import PersonNode from "./person-node";
import ReportingEdge from "./reporting-edge";
import PersonPanel from "./person-panel";
import UnassignedTray, { UNASSIGNED_DRAG_TYPE } from "./unassigned-tray";
import ArrangeMenu from "./arrange-menu";
import { useOrgHierarchy } from "./use-org-hierarchy";
import {
  buildGraph,
  canReport,
  descendantsOf,
  linesBetween,
  managersOf,
  type LayoutMode,
  type OrgIndex,
  type PersonFlowNode,
  type ReportingFlowEdge,
} from "./layout";

const nodeTypes: NodeTypes = { person: PersonNode };
const edgeTypes: EdgeTypes = { reporting: ReportingEdge };
const ALL_TEAMS = "__all__";

type PendingChange =
  /** Dropped on someone while having no manager: they become the manager. */
  | { kind: "add"; userId: string; managerId: string }
  /** Dropped on someone while already reporting to `fromId`: move or add? */
  | { kind: "drop"; userId: string; managerId: string; fromId: string }
  | { kind: "unlink"; userId: string; managerId: string };

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

/** Whether `targetId` may become a (new) manager of `userId`. */
const isValidDrop = (index: OrgIndex, userId: string, targetId: string) =>
  linesBetween(index, userId, targetId).length === 0 &&
  canReport(index, userId, targetId);

interface OrgCanvasProps {
  editable: boolean;
  /** Can create users (shows "Add person"). */
  canCreate: boolean;
  canReadTeams: boolean;
  /** Team whose members are highlighted (others dimmed); undefined for none. */
  highlightTeam?: string;
  onHighlightTeamChange: (teamUuid: string | undefined) => void;
}

function OrgCanvasInner({ editable, canCreate, canReadTeams, highlightTeam, onHighlightTeamChange }: OrgCanvasProps) {
  const dispatch = useAppDispatch();
  const orgUuid = useAppSelector((s) => s.organizationsSlice.currentOrganization?.uuid);
  const teamOptions = useAppSelector((s) => s.teamSlice.teamOptions);
  const { resolvedTheme } = useTheme();
  const { screenToFlowPosition, getIntersectingNodes, fitView, setCenter, getZoom, getNodes } =
    useReactFlow<PersonFlowNode, ReportingFlowEdge>();

  const hierarchy = useOrgHierarchy(true);
  const { index, isLoading, isMutating, reload, setTeams } = hierarchy;

  const [mode, setMode] = useState<LayoutMode>("left-right");
  /** Cards moved by hand this session (not saved; a reload uses the layout again). */
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const team = highlightTeam ?? ALL_TEAMS;
  const setTeam = (value: string) =>
    onHighlightTeamChange(value === ALL_TEAMS ? undefined : value);
  const [showTray, setShowTray] = useState(false);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [dropChoice, setDropChoice] = useState<"move" | "add">("move");
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const hasFitted = useRef(false);

  useEffect(() => {
    if (orgUuid && canReadTeams) dispatch(listTeamOptionsAction({ org_uuid: orgUuid }));
  }, [orgUuid, canReadTeams, dispatch]);

  const layout = useMemo(
    () =>
      buildGraph(index, {
        placed,
        collapsed,
        highlightTeam: team === ALL_TEAMS ? undefined : team,
        editable,
        mode,
      }),
    [index, placed, collapsed, team, editable, mode],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<PersonFlowNode>([]);
  // Edges are state too, so React Flow can mark one selected (to show its remove button).
  const [edges, setEdges, onEdgesChange] = useEdgesState<ReportingFlowEdge>([]);

  useEffect(() => {
    setEdges(layout.edges);
  }, [layout, setEdges]);

  /** Computed layout, with cards moved by hand kept where they were put. */
  const applyLayout = useCallback(() => {
    setNodes(
      layout.nodes.map((n) => ({
        ...n,
        position: manual.current.get(n.id) ?? n.position,
        selected: n.id === selectedId,
      })),
    );
  }, [layout, selectedId, setNodes]);

  // Re-apply whenever the data or view options change.
  useEffect(() => {
    applyLayout();
  }, [layout]); // eslint-disable-line react-hooks/exhaustive-deps

  const arrange = useCallback(
    (next: LayoutMode) => {
      manual.current.clear();
      if (next === mode) {
        setNodes(layout.nodes.map((n) => ({ ...n, selected: n.id === selectedId })));
      } else {
        setMode(next);
      }
      requestAnimationFrame(() =>
        requestAnimationFrame(() => fitView({ padding: 0.15, maxZoom: 1, duration: 400 })),
      );
    },
    [mode, layout.nodes, selectedId, setNodes, fitView],
  );

  useEffect(() => {
    setNodes((current) =>
      current.map((n) => {
        const dropState = dropTarget?.id === n.id ? (dropTarget.valid ? "valid" : "invalid") : "none";
        const selected = n.id === selectedId;
        return n.data.dropState === dropState && n.selected === selected
          ? n
          : { ...n, selected, data: { ...n.data, dropState } };
      }),
    );
  }, [dropTarget, selectedId, setNodes]);

  useEffect(() => {
    if (!hasFitted.current && layout.nodes.length) {
      hasFitted.current = true;
      requestAnimationFrame(() => fitView({ padding: 0.15, maxZoom: 1 }));
    }
  }, [layout.nodes.length, fitView]);

  // Frame the highlighted team's members once their cards are laid out.
  const framedTeam = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!highlightTeam || framedTeam.current === highlightTeam || !layout.nodes.length) return;
    framedTeam.current = highlightTeam;
    const members = layout.nodes
      .filter((n) => n.data.person.teams.some((t) => t.uuid === highlightTeam))
      .map((n) => ({ id: n.id }));
    if (members.length) {
      hasFitted.current = true;
      requestAnimationFrame(() => fitView({ nodes: members, padding: 0.3, maxZoom: 1, duration: 400 }));
    }
  }, [highlightTeam, layout.nodes, fitView]);

  const unassigned = useMemo(
    () =>
      index.unassigned
        .filter((id) => !placed.includes(id))
        .map((id) => index.people.get(id)!)
        .filter(Boolean),
    [index, placed],
  );

  const focusPerson = useCallback(
    (userId: string) => {
      setSelectedId(userId);
      const node = layout.nodes.find((n) => n.id === userId);
      if (node) {
        setCenter(node.position.x + (node.width ?? 0) / 2, node.position.y + (node.height ?? 0) / 2, {
          zoom: Math.max(getZoom(), 0.9),
          duration: 400,
        });
      } else if (index.unassigned.includes(userId)) {
        setShowTray(true);
      }
    },
    [layout.nodes, setCenter, getZoom, index.unassigned],
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
    }),
    [],
  );

  /** The card under a screen point, ignoring `excludeId`. */
  const nodeAtPoint = useCallback(
    (clientX: number, clientY: number, excludeId?: string) => {
      const point = screenToFlowPosition({ x: clientX, y: clientY });
      return getIntersectingNodes({ x: point.x, y: point.y, width: 1, height: 1 }).find(
        (n) => n.id !== excludeId,
      );
    },
    [screenToFlowPosition, getIntersectingNodes],
  );

  // ── Drag: move freely; Shift moves the branch; drop on a card to change manager ──
  const onNodeDragStart: OnNodeDrag<PersonFlowNode> = useCallback(
    (event, node) => {
      const ids = new Set([node.id]);
      if (event.shiftKey) descendantsOf(index, node.id).forEach((id) => ids.add(id));
      const at = new Map<string, { x: number; y: number }>();
      for (const n of getNodes()) if (ids.has(n.id)) at.set(n.id, { ...n.position });
      dragOrigin.current = { ids, at };
    },
    [index, getNodes],
  );

  const onNodeDrag: OnNodeDrag<PersonFlowNode> = useCallback(
    (event, node) => {
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
      const target = nodeAtPoint(x, y, node.id);
      setDropTarget((prev) => {
        if (!target) return prev ? null : prev;
        const valid = isValidDrop(index, node.id, target.id);
        return prev?.id === target.id && prev.valid === valid ? prev : { id: target.id, valid };
      });
    },
    [nodeAtPoint, index, setNodes],
  );

  const onNodeDragStop: OnNodeDrag<PersonFlowNode> = useCallback(
    (event, node) => {
      // Resolve the target from the release point, not from state: the last
      // onNodeDrag update may not have rendered yet.
      const { x, y } = clientPoint(event);
      const origin = dragOrigin.current;
      dragOrigin.current = null;
      setDropTarget(null);
      const target = nodeAtPoint(x, y, node.id);
      const movedIds = origin?.ids ?? new Set([node.id]);
      // Dropping one of the dragged branch's own cards doesn't count as a target.
      const realTarget = target && !movedIds.has(target.id) ? target : undefined;

      if (!realTarget) {
        // Empty space: leave the card (and branch) where it was put.
        for (const n of getNodes()) {
          if (movedIds.has(n.id)) manual.current.set(n.id, { ...n.position });
        }
        return;
      }

      // Dropped on a card: put everything back, then ask about the manager change.
      if (origin) {
        setNodes((current) =>
          current.map((n) => {
            const from = origin.at.get(n.id);
            return from ? { ...n, position: from } : n;
          }),
        );
      }
      if (isValidDrop(index, node.id, realTarget.id)) {
        const fromId = layout.layoutParent.get(node.id) ?? managersOf(index, node.id)[0];
        setDropChoice("move");
        setPending(
          fromId
            ? { kind: "drop", userId: node.id, managerId: realTarget.id, fromId }
            : { kind: "add", userId: node.id, managerId: realTarget.id },
        );
      } else {
        toastError(
          linesBetween(index, node.id, realTarget.id).length
            ? "They already report to this person."
            : "Can't put someone under a person who reports to them.",
        );
      }
    },
    [nodeAtPoint, index, getNodes, setNodes, layout.layoutParent],
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

  // ── Draw a line from a manager's source handle to a report's target handle ──
  const isValidConnection = useCallback(
    (connection: Connection | Edge) =>
      !!connection.source &&
      !!connection.target &&
      isValidDrop(index, connection.target, connection.source),
    [index],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        addManager(connection.target, connection.source, teamFor(connection.target, connection.source));
      }
    },
    [addManager, teamFor],
  );

  // ── Delete a line (select it, then Backspace/Delete or its × button) ──
  const onBeforeDelete: OnBeforeDelete<PersonFlowNode, ReportingFlowEdge> = useCallback(async ({ edges }) => {
    if (edges[0]) setPending({ kind: "unlink", userId: edges[0].target, managerId: edges[0].source });
    return false;
  }, []);

  // ── Drop someone from the Unassigned tray ──
  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!editable || !event.dataTransfer.types.includes(UNASSIGNED_DRAG_TYPE)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const target = nodeAtPoint(event.clientX, event.clientY);
      setDropTarget((prev) =>
        !target ? (prev ? null : prev) : prev?.id === target.id ? prev : { id: target.id, valid: true },
      );
    },
    [editable, nodeAtPoint],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      const userId = event.dataTransfer.getData(UNASSIGNED_DRAG_TYPE);
      setDropTarget(null);
      if (!userId) return;
      event.preventDefault();
      const target = nodeAtPoint(event.clientX, event.clientY);
      if (target) {
        if (target.id !== userId) addManager(userId, target.id, teamFor(userId, target.id));
      } else {
        // Dropped on empty canvas: show them as a top-level card to build under.
        setPlaced((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
        setSelectedId(userId);
      }
    },
    [nodeAtPoint, addManager, teamFor],
  );

  const confirmPending = async () => {
    if (!pending) return;
    let ok: boolean;
    if (pending.kind === "unlink") {
      ok = await removeManager(pending.userId, pending.managerId);
    } else if (pending.kind === "drop" && dropChoice === "move") {
      ok = await moveManager(pending.userId, pending.fromId, pending.managerId);
    } else {
      ok = await addManager(pending.userId, pending.managerId, teamFor(pending.userId, pending.managerId));
    }
    if (!ok) throw new Error("not saved");
  };

  const nameOf = (id: string) => index.people.get(id)?.name ?? "Someone";
  const pendingCopy = (() => {
    if (!pending) return { title: "", description: "" };
    const name = nameOf(pending.userId);
    const managerName = nameOf(pending.managerId);
    if (pending.kind === "add") {
      return { title: `Put ${name} under ${managerName}?`, description: `${name} will report to ${managerName}.` };
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
        <ReactFlow<PersonFlowNode, ReportingFlowEdge>
          nodes={nodes}
          edges={edges}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={(_e, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onBeforeDelete={onBeforeDelete}
          nodesDraggable={editable}
          nodesConnectable={editable}
          edgesFocusable={editable}
          elementsSelectable
          selectionKeyCode={null}
          minZoom={0.15}
          maxZoom={1.75}
          colorMode={resolvedTheme === "dark" ? "dark" : "light"}
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
              n.id === selectedId ? "var(--foreground)" : "color-mix(in oklab, var(--muted-foreground) 45%, transparent)"
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
            <div className="w-64">
              <UserPicker
                value={null}
                onChange={(user) => user && focusPerson(user.user_id)}
                placeholder="Find a person"
              />
            </div>
            {canReadTeams && teamOptions.length > 0 && (
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger className="w-44 bg-background">
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
              Unassigned
              <Badge variant="secondary">{unassigned.length}</Badge>
            </Button>
            {canCreate && (
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
              people={unassigned}
              editable={editable}
              onClose={() => setShowTray(false)}
              onSelect={setSelectedId}
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
