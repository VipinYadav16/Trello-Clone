import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Board,
  Card,
  List,
  Label,
  Checklist,
  ChecklistItem,
  Comment,
  Attachment,
  Member,
} from "@/types/kanban";

const uid = () => crypto.randomUUID();

const MEMBERS: Member[] = [
  { id: "m1", name: "Alex Johnson", avatar: "AJ", color: "hsl(210 79% 46%)" },
  { id: "m2", name: "Sarah Chen", avatar: "SC", color: "hsl(145 63% 42%)" },
  { id: "m3", name: "Mike Ross", avatar: "MR", color: "hsl(27 96% 54%)" },
  { id: "m4", name: "Emily Davis", avatar: "ED", color: "hsl(262 52% 47%)" },
];

const seedBoard = (): Board => ({
  id: uid(),
  title: "Project Alpha",
  background: "hsl(210 60% 48%)",
  createdAt: new Date().toISOString(),
  lists: [
    {
      id: uid(),
      title: "To Do",
      position: 0,
      cards: [
        {
          id: uid(),
          title: "Research competitors",
          description: "Analyze top 5 competitors in the market",
          labels: [{ id: uid(), text: "Research", color: "blue" }],
          memberIds: ["m1"],
          dueDate: "2026-03-20",
          checklists: [
            {
              id: uid(),
              title: "Steps",
              items: [
                { id: uid(), text: "Identify competitors", completed: true },
                { id: uid(), text: "Analyze features", completed: false },
              ],
            },
          ],
          comments: [],
          attachments: [],
          coverColor: null,
          coverImageUrl: null,
          archived: false,
          createdAt: new Date().toISOString(),
          position: 0,
        },
        {
          id: uid(),
          title: "Design landing page",
          description: "",
          labels: [{ id: uid(), text: "Design", color: "purple" }],
          memberIds: ["m2", "m4"],
          dueDate: null,
          checklists: [],
          comments: [],
          attachments: [],
          coverColor: "hsl(262 52% 47%)",
          coverImageUrl: null,
          archived: false,
          createdAt: new Date().toISOString(),
          position: 1,
        },
        {
          id: uid(),
          title: "Set up CI/CD pipeline",
          description: "Configure GitHub Actions",
          labels: [{ id: uid(), text: "DevOps", color: "orange" }],
          memberIds: ["m3"],
          dueDate: "2026-03-25",
          checklists: [],
          comments: [],
          attachments: [],
          coverColor: null,
          coverImageUrl: null,
          archived: false,
          createdAt: new Date().toISOString(),
          position: 2,
        },
      ],
    },
    {
      id: uid(),
      title: "In Progress",
      position: 1,
      cards: [
        {
          id: uid(),
          title: "Build authentication module",
          description: "Implement JWT-based auth",
          labels: [{ id: uid(), text: "Backend", color: "green" }],
          memberIds: ["m1", "m3"],
          dueDate: "2026-03-18",
          checklists: [],
          comments: [
            {
              id: uid(),
              memberId: "m1",
              text: "Started working on this",
              createdAt: new Date().toISOString(),
            },
          ],
          attachments: [],
          coverColor: null,
          coverImageUrl: null,
          archived: false,
          createdAt: new Date().toISOString(),
          position: 0,
        },
        {
          id: uid(),
          title: "Create wireframes",
          description: "",
          labels: [
            { id: uid(), text: "Design", color: "purple" },
            { id: uid(), text: "Urgent", color: "red" },
          ],
          memberIds: ["m2"],
          dueDate: null,
          checklists: [],
          comments: [],
          attachments: [],
          coverColor: "hsl(0 72% 51%)",
          coverImageUrl: null,
          archived: false,
          createdAt: new Date().toISOString(),
          position: 1,
        },
      ],
    },
    {
      id: uid(),
      title: "Review",
      position: 2,
      cards: [
        {
          id: uid(),
          title: "API documentation",
          description: "Document all REST endpoints",
          labels: [{ id: uid(), text: "Docs", color: "yellow" }],
          memberIds: ["m4"],
          dueDate: "2026-03-15",
          checklists: [],
          comments: [],
          attachments: [],
          coverColor: null,
          coverImageUrl: null,
          archived: false,
          createdAt: new Date().toISOString(),
          position: 0,
        },
      ],
    },
    {
      id: uid(),
      title: "Done",
      position: 3,
      cards: [
        {
          id: uid(),
          title: "Project kickoff meeting",
          description: "Initial planning session completed",
          labels: [{ id: uid(), text: "Meeting", color: "green" }],
          memberIds: ["m1", "m2", "m3", "m4"],
          dueDate: null,
          checklists: [],
          comments: [],
          attachments: [],
          coverColor: null,
          coverImageUrl: null,
          archived: false,
          createdAt: new Date().toISOString(),
          position: 0,
        },
      ],
    },
  ],
});

interface KanbanState {
  boards: Board[];
  members: Member[];
  currentBoardId: string | null;
  searchQuery: string;
  filterLabels: string[];
  filterMemberIds: string[];
  filterDueDate: "overdue" | "today" | "week" | null;
  isHydratedFromApi: boolean;

  // Board actions
  addBoard: (title: string) => void;
  deleteBoard: (boardId: string) => void;
  setCurrentBoard: (boardId: string) => void;
  updateBoardTitle: (boardId: string, title: string) => void;
  updateBoardBackground: (boardId: string, bg: string) => void;

  // List actions
  addList: (boardId: string, title: string) => void;
  updateListTitle: (boardId: string, listId: string, title: string) => void;
  updateListColor: (
    boardId: string,
    listId: string,
    color: string | undefined,
  ) => void;
  deleteList: (boardId: string, listId: string) => void;
  reorderLists: (boardId: string, lists: List[]) => void;

  // Card actions
  addCard: (boardId: string, listId: string, title: string) => void;
  updateCard: (
    boardId: string,
    listId: string,
    cardId: string,
    updates: Partial<Card>,
  ) => void;
  deleteCard: (boardId: string, listId: string, cardId: string) => void;
  moveCard: (
    boardId: string,
    fromListId: string,
    toListId: string,
    cardId: string,
    newIndex: number,
  ) => void;
  reorderCards: (boardId: string, listId: string, cards: Card[]) => void;

  // Card detail actions
  addLabel: (
    boardId: string,
    listId: string,
    cardId: string,
    label: Label,
  ) => void;
  removeLabel: (
    boardId: string,
    listId: string,
    cardId: string,
    labelId: string,
  ) => void;
  addChecklist: (
    boardId: string,
    listId: string,
    cardId: string,
    checklist: Checklist,
  ) => void;
  removeChecklist: (
    boardId: string,
    listId: string,
    cardId: string,
    checklistId: string,
  ) => void;
  addChecklistItem: (
    boardId: string,
    listId: string,
    cardId: string,
    checklistId: string,
    item: ChecklistItem,
  ) => void;
  toggleChecklistItem: (
    boardId: string,
    listId: string,
    cardId: string,
    checklistId: string,
    itemId: string,
  ) => void;
  removeChecklistItem: (
    boardId: string,
    listId: string,
    cardId: string,
    checklistId: string,
    itemId: string,
  ) => void;
  addComment: (
    boardId: string,
    listId: string,
    cardId: string,
    comment: Comment,
  ) => void;
  addAttachment: (
    boardId: string,
    listId: string,
    cardId: string,
    attachment: Attachment,
  ) => void;
  uploadAttachmentFile: (
    boardId: string,
    listId: string,
    cardId: string,
    file: File,
  ) => Promise<void>;
  removeAttachment: (
    boardId: string,
    listId: string,
    cardId: string,
    attachmentId: string,
  ) => void;

  // Member actions
  addMember: (name: string) => void;

  // Filter actions
  setSearchQuery: (q: string) => void;
  setFilterLabels: (labels: string[]) => void;
  setFilterMemberIds: (ids: string[]) => void;
  setFilterDueDate: (d: "overdue" | "today" | "week" | null) => void;
  clearFilters: () => void;

  // Data hydration
  loadFromApi: () => Promise<void>;
}

const updateCardInBoard = (
  boards: Board[],
  boardId: string,
  listId: string,
  cardId: string,
  updater: (card: Card) => Card,
): Board[] => {
  return boards.map((b) =>
    b.id !== boardId
      ? b
      : {
          ...b,
          lists: b.lists.map((l) =>
            l.id !== listId
              ? l
              : {
                  ...l,
                  cards: l.cards.map((c) => (c.id !== cardId ? c : updater(c))),
                },
          ),
        },
  );
};

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => {
      const initial = seedBoard();

      const hydrateFromApi = async (force = false) => {
        if (!force && get().isHydratedFromApi) return;
        try {
          const [boardsRes, membersRes] = await Promise.all([
            fetch("/api/boards"),
            fetch("/api/members"),
          ]);
          if (!boardsRes.ok || !membersRes.ok) return;

          const boardsPayload = (await boardsRes.json()) as {
            boards: Array<{
              id: string;
              title: string;
              background: string;
              created_at?: string;
              createdAt?: string;
            }>;
          };
          const membersPayload = (await membersRes.json()) as {
            members: Array<{
              id: string;
              name: string;
              avatar: string;
              color: string;
            }>;
          };
          if (!boardsPayload.boards?.length) return;

          const boardIds = boardsPayload.boards.map((b) => b.id);
          const boardDetails = await Promise.all(
            boardIds.map(async (boardId) => {
              const response = await fetch(`/api/boards/${boardId}`);
              if (!response.ok) return null;
              return response.json();
            }),
          );

          const mappedBoards: Board[] = boardDetails
            .filter(Boolean)
            .map((board: any) => ({
              id: board.id,
              title: board.title,
              background: board.background,
              createdAt:
                board.createdAt || board.created_at || new Date().toISOString(),
              lists: (board.lists || []).map((list: any) => ({
                id: list.id,
                title: list.title,
                color: list.color,
                position: list.position,
                cards: (list.cards || []).map((card: any) => ({
                  id: card.id,
                  title: card.title,
                  description: card.description || "",
                  labels: card.labels || [],
                  memberIds: (card.members || []).map((m: any) => m.id),
                  dueDate: card.dueDate || card.due_date || null,
                  checklists: card.checklists || [],
                  comments: card.comments || [],
                  attachments: card.attachments || [],
                  coverColor: card.coverColor || card.cover_color || null,
                  coverImageUrl:
                    card.coverImageUrl || card.cover_image_url || null,
                  archived: Boolean(card.archived),
                  createdAt:
                    card.createdAt ||
                    card.created_at ||
                    new Date().toISOString(),
                  position: card.position ?? 0,
                })),
              })),
            }));

          if (!mappedBoards.length) return;
          set((s) => ({
            boards: mappedBoards,
            members: membersPayload.members,
            currentBoardId: mappedBoards.some((b) => b.id === s.currentBoardId)
              ? s.currentBoardId
              : mappedBoards[0].id,
            isHydratedFromApi: true,
          }));
        } catch {
          // Ignore API hydration errors to preserve local-first/offline behavior.
        }
      };

      const shouldUseApi = () => get().isHydratedFromApi;

      return {
        boards: [initial],
        members: MEMBERS,
        currentBoardId: initial.id,
        searchQuery: "",
        filterLabels: [],
        filterMemberIds: [],
        filterDueDate: null,
        isHydratedFromApi: false,

        addBoard: (title) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch("/api/boards", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          const board: Board = {
            id: uid(),
            title,
            background: "hsl(210 60% 48%)",
            lists: [],
            createdAt: new Date().toISOString(),
          };
          set((s) => ({
            boards: [...s.boards, board],
            currentBoardId: board.id,
          }));
        },
        deleteBoard: (boardId) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => {
            const boards = s.boards.filter((b) => b.id !== boardId);
            return { boards, currentBoardId: boards[0]?.id ?? null };
          });
        },
        setCurrentBoard: (id) => set({ currentBoardId: id }),
        updateBoardTitle: (boardId, title) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/boards/${boardId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id === boardId ? { ...b, title } : b,
            ),
          }));
        },
        updateBoardBackground: (boardId, bg) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/boards/${boardId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ background: bg }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id === boardId ? { ...b, background: bg } : b,
            ),
          }));
        },

        addList: (boardId, title) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/boards/${boardId}/lists`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id !== boardId
                ? b
                : {
                    ...b,
                    lists: [
                      ...b.lists,
                      { id: uid(), title, cards: [], position: b.lists.length },
                    ],
                  },
            ),
          }));
        },
        updateListTitle: (boardId, listId, title) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/lists/${listId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id !== boardId
                ? b
                : {
                    ...b,
                    lists: b.lists.map((l) =>
                      l.id === listId ? { ...l, title } : l,
                    ),
                  },
            ),
          }));
        },
        updateListColor: (boardId, listId, color) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/lists/${listId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ color: color ?? null }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id !== boardId
                ? b
                : {
                    ...b,
                    lists: b.lists.map((l) =>
                      l.id === listId ? { ...l, color } : l,
                    ),
                  },
            ),
          }));
        },
        deleteList: (boardId, listId) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/lists/${listId}`, { method: "DELETE" });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id !== boardId
                ? b
                : {
                    ...b,
                    lists: b.lists.filter((l) => l.id !== listId),
                  },
            ),
          }));
        },
        reorderLists: (boardId, lists) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/boards/${boardId}/lists/reorder`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderedListIds: lists.map((l) => l.id),
                  }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id === boardId ? { ...b, lists } : b,
            ),
          }));
        },

        addCard: (boardId, listId, title) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/lists/${listId}/cards`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id !== boardId
                ? b
                : {
                    ...b,
                    lists: b.lists.map((l) =>
                      l.id !== listId
                        ? l
                        : {
                            ...l,
                            cards: [
                              ...l.cards,
                              {
                                id: uid(),
                                title,
                                description: "",
                                labels: [],
                                memberIds: [],
                                dueDate: null,
                                checklists: [],
                                comments: [],
                                attachments: [],
                                coverColor: null,
                                coverImageUrl: null,
                                archived: false,
                                createdAt: new Date().toISOString(),
                                position: l.cards.length,
                              },
                            ],
                          },
                    ),
                  },
            ),
          }));
        },
        updateCard: (boardId, listId, cardId, updates) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                const { memberIds, ...cardUpdates } =
                  updates as Partial<Card> & {
                    memberIds?: string[];
                  };

                if (memberIds) {
                  await fetch(`/api/cards/${cardId}/members`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberIds }),
                  });
                }

                const patchPayload: Record<string, unknown> = {};
                if (cardUpdates.title !== undefined)
                  patchPayload.title = cardUpdates.title;
                if (cardUpdates.description !== undefined)
                  patchPayload.description = cardUpdates.description;
                if (cardUpdates.dueDate !== undefined)
                  patchPayload.dueDate = cardUpdates.dueDate;
                if (cardUpdates.coverColor !== undefined)
                  patchPayload.coverColor = cardUpdates.coverColor;
                if (cardUpdates.coverImageUrl !== undefined)
                  patchPayload.coverImageUrl = cardUpdates.coverImageUrl;
                if (cardUpdates.archived !== undefined)
                  patchPayload.archived = cardUpdates.archived;
                if (cardUpdates.position !== undefined)
                  patchPayload.position = cardUpdates.position;

                if (Object.keys(patchPayload).length > 0) {
                  await fetch(`/api/cards/${cardId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(patchPayload),
                  });
                }

                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({ ...c, ...updates }),
            ),
          }));
        },
        deleteCard: (boardId, listId, cardId) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id !== boardId
                ? b
                : {
                    ...b,
                    lists: b.lists.map((l) =>
                      l.id !== listId
                        ? l
                        : {
                            ...l,
                            cards: l.cards.filter((c) => c.id !== cardId),
                          },
                    ),
                  },
            ),
          }));
        },
        moveCard: (boardId, fromListId, toListId, cardId, newIndex) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/cards/${cardId}/move`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ toListId, newIndex }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) => {
              if (b.id !== boardId) return b;
              let card: Card | undefined;
              const lists = b.lists.map((l) => {
                if (l.id === fromListId) {
                  card = l.cards.find((c) => c.id === cardId);
                  return {
                    ...l,
                    cards: l.cards.filter((c) => c.id !== cardId),
                  };
                }
                return l;
              });
              if (!card) return b;
              return {
                ...b,
                lists: lists.map((l) => {
                  if (l.id === toListId) {
                    const movedCards = [...l.cards];
                    movedCards.splice(newIndex, 0, card!);
                    return { ...l, cards: movedCards };
                  }
                  return l;
                }),
              };
            }),
          }));
        },
        reorderCards: (boardId, listId, cards) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/lists/${listId}/cards/reorder`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderedCardIds: cards.map((c) => c.id),
                  }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: s.boards.map((b) =>
              b.id !== boardId
                ? b
                : {
                    ...b,
                    lists: b.lists.map((l) =>
                      l.id === listId ? { ...l, cards } : l,
                    ),
                  },
            ),
          }));
        },

        addLabel: (boardId, listId, cardId, label) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/cards/${cardId}/labels`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    text: label.text,
                    color: label.color,
                  }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({ ...c, labels: [...c.labels, label] }),
            ),
          }));
        },
        removeLabel: (boardId, listId, cardId, labelId) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/cards/${cardId}/labels/${labelId}`, {
                  method: "DELETE",
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({
                ...c,
                labels: c.labels.filter((l) => l.id !== labelId),
              }),
            ),
          }));
        },
        addChecklist: (boardId, listId, cardId, checklist) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/cards/${cardId}/checklists`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title: checklist.title }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({ ...c, checklists: [...c.checklists, checklist] }),
            ),
          }));
        },
        removeChecklist: (boardId, listId, cardId, checklistId) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/checklists/${checklistId}`, {
                  method: "DELETE",
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({
                ...c,
                checklists: c.checklists.filter((cl) => cl.id !== checklistId),
              }),
            ),
          }));
        },
        addChecklistItem: (boardId, listId, cardId, checklistId, item) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/checklists/${checklistId}/items`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: item.text }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({
                ...c,
                checklists: c.checklists.map((cl) =>
                  cl.id === checklistId
                    ? { ...cl, items: [...cl.items, item] }
                    : cl,
                ),
              }),
            ),
          }));
        },
        toggleChecklistItem: (boardId, listId, cardId, checklistId, itemId) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                const currentCard = get()
                  .boards.find((b) => b.id === boardId)
                  ?.lists.find((l) => l.id === listId)
                  ?.cards.find((c) => c.id === cardId);
                const currentItem = currentCard?.checklists
                  .find((cl) => cl.id === checklistId)
                  ?.items.find((i) => i.id === itemId);
                if (!currentItem) return;

                await fetch(`/api/checklist-items/${itemId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ completed: !currentItem.completed }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({
                ...c,
                checklists: c.checklists.map((cl) =>
                  cl.id === checklistId
                    ? {
                        ...cl,
                        items: cl.items.map((i) =>
                          i.id === itemId
                            ? { ...i, completed: !i.completed }
                            : i,
                        ),
                      }
                    : cl,
                ),
              }),
            ),
          }));
        },
        removeChecklistItem: (boardId, listId, cardId, checklistId, itemId) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/checklist-items/${itemId}`, {
                  method: "DELETE",
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({
                ...c,
                checklists: c.checklists.map((cl) =>
                  cl.id === checklistId
                    ? {
                        ...cl,
                        items: cl.items.filter((i) => i.id !== itemId),
                      }
                    : cl,
                ),
              }),
            ),
          }));
        },
        addComment: (boardId, listId, cardId, comment) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/cards/${cardId}/comments`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    memberId: comment.memberId,
                    text: comment.text,
                  }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({ ...c, comments: [...c.comments, comment] }),
            ),
          }));
        },
        addAttachment: (boardId, listId, cardId, attachment) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/cards/${cardId}/attachments`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: attachment.name,
                    url: attachment.url,
                  }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({ ...c, attachments: [...c.attachments, attachment] }),
            ),
          }));
        },
        uploadAttachmentFile: async (boardId, listId, cardId, file) => {
          if (shouldUseApi()) {
            try {
              const formData = new FormData();
              formData.append("file", file);
              await fetch(`/api/cards/${cardId}/attachments/upload`, {
                method: "POST",
                body: formData,
              });
              await hydrateFromApi(true);
            } catch {
              // keep current state on request failure
            }
            return;
          }

          const objectUrl = URL.createObjectURL(file);
          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({
                ...c,
                attachments: [
                  ...c.attachments,
                  {
                    id: uid(),
                    name: file.name,
                    url: objectUrl,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }),
            ),
          }));
        },
        removeAttachment: (boardId, listId, cardId, attachmentId) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch(`/api/attachments/${attachmentId}`, {
                  method: "DELETE",
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          set((s) => ({
            boards: updateCardInBoard(
              s.boards,
              boardId,
              listId,
              cardId,
              (c) => ({
                ...c,
                attachments: c.attachments.filter((a) => a.id !== attachmentId),
              }),
            ),
          }));
        },

        addMember: (name) => {
          if (shouldUseApi()) {
            void (async () => {
              try {
                await fetch("/api/members", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name }),
                });
                await hydrateFromApi(true);
              } catch {
                // keep current state on request failure
              }
            })();
            return;
          }

          const initials =
            name
              .split(" ")
              .map((w) => w[0]?.toUpperCase())
              .join("")
              .slice(0, 2) || "??";
          const hue = Math.floor(Math.random() * 360);
          const member: Member = {
            id: uid(),
            name,
            avatar: initials,
            color: `hsl(${hue} 60% 45%)`,
          };
          set((s) => ({ members: [...s.members, member] }));
        },

        setSearchQuery: (q) => set({ searchQuery: q }),
        setFilterLabels: (labels) => set({ filterLabels: labels }),
        setFilterMemberIds: (ids) => set({ filterMemberIds: ids }),
        setFilterDueDate: (d) => set({ filterDueDate: d }),
        clearFilters: () =>
          set({
            searchQuery: "",
            filterLabels: [],
            filterMemberIds: [],
            filterDueDate: null,
          }),

        loadFromApi: async () => {
          await hydrateFromApi(false);
        },
      };
    },
    { name: "kanban-store" },
  ),
);
