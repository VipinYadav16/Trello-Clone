import { useState } from "react";
import { useKanbanStore } from "@/store/kanbanStore";
import {
  Search,
  Plus,
  LayoutDashboard,
  X,
  Filter,
  Star,
  Users,
  MoreHorizontal,
  ChevronLeft,
} from "lucide-react";

const BOARD_BACKGROUNDS = [
  { color: "hsl(210 60% 48%)", name: "Blue" },
  { color: "hsl(262 52% 47%)", name: "Purple" },
  { color: "hsl(145 63% 42%)", name: "Green" },
  { color: "hsl(27 96% 54%)", name: "Orange" },
  { color: "hsl(0 72% 51%)", name: "Red" },
  { color: "hsl(330 60% 50%)", name: "Pink" },
  { color: "hsl(180 60% 40%)", name: "Teal" },
  { color: "hsl(45 93% 47%)", name: "Yellow" },
  { color: "hsl(0 0% 35%)", name: "Dark Gray" },
  { color: "hsl(220 25% 25%)", name: "Slate" },
];

const BOARD_GRADIENTS = [
  {
    color: "linear-gradient(135deg, hsl(210 80% 40%), hsl(262 60% 50%))",
    name: "Ocean",
  },
  {
    color: "linear-gradient(135deg, hsl(330 60% 50%), hsl(27 96% 54%))",
    name: "Sunset",
  },
  {
    color: "linear-gradient(135deg, hsl(145 63% 35%), hsl(180 60% 40%))",
    name: "Forest",
  },
  {
    color: "linear-gradient(135deg, hsl(262 52% 47%), hsl(330 60% 50%))",
    name: "Berry",
  },
  {
    color: "linear-gradient(135deg, hsl(200 85% 45%), hsl(160 70% 42%))",
    name: "Lagoon",
  },
  {
    color: "linear-gradient(135deg, hsl(25 95% 55%), hsl(350 80% 58%))",
    name: "Ember",
  },
];

interface AppHeaderProps {
  onToggleFilter: () => void;
  filterOpen: boolean;
}

export function AppHeader({ onToggleFilter, filterOpen }: AppHeaderProps) {
  const {
    boards,
    members,
    currentBoardId,
    starredBoardIds,
    setCurrentBoard,
    addBoard,
    toggleBoardStar,
    updateBoardTitle,
    updateBoardBackground,
    searchQuery,
    setSearchQuery,
    filterLabels,
    filterMemberIds,
    filterDueDate,
  } = useKanbanStore();
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [showBgMenu, setShowBgMenu] = useState(false);
  const [showMembersMenu, setShowMembersMenu] = useState(false);
  const [editingBoardTitle, setEditingBoardTitle] = useState(false);
  const [boardTitleDraft, setBoardTitleDraft] = useState("");

  const hasFilters =
    filterLabels.length > 0 ||
    filterMemberIds.length > 0 ||
    filterDueDate !== null ||
    searchQuery !== "";
  const currentBoard = boards.find((b) => b.id === currentBoardId);
  const isCurrentBoardStarred =
    !!currentBoardId && starredBoardIds.includes(currentBoardId);

  const startEditingBoardTitle = () => {
    if (!currentBoard) return;
    setBoardTitleDraft(currentBoard.title);
    setEditingBoardTitle(true);
  };

  const saveBoardTitle = () => {
    if (!currentBoard) return;
    const trimmed = boardTitleDraft.trim();
    if (trimmed && trimmed !== currentBoard.title) {
      updateBoardTitle(currentBoard.id, trimmed);
    }
    setEditingBoardTitle(false);
    setBoardTitleDraft("");
  };

  const cancelBoardTitleEdit = () => {
    setEditingBoardTitle(false);
    setBoardTitleDraft("");
  };

  return (
    <header className="h-12 bg-header flex items-center px-2 sm:px-4 gap-1.5 sm:gap-3 shrink-0 border-b border-border">
      {/* Left: Board switcher */}
      <button
        onClick={() => setShowBoardMenu(!showBoardMenu)}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded bg-secondary hover:bg-accent text-header-foreground text-sm font-medium transition-colors"
      >
        <LayoutDashboard size={16} />
        <span className="hidden sm:inline">Boards</span>
      </button>

      {showBoardMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowBoardMenu(false)}
          />
          <div className="absolute top-12 left-4 z-50 bg-card rounded-lg shadow-lg border p-3 w-64">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Your Boards
            </p>
            {boards.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setCurrentBoard(b.id);
                  setShowBoardMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${b.id === currentBoardId ? "bg-primary/20 text-primary font-medium" : "hover:bg-accent text-foreground"}`}
              >
                <div
                  className="w-6 h-5 rounded-sm shrink-0"
                  style={{ background: b.background }}
                />
                {b.title}
              </button>
            ))}
            {showNewBoard ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newBoardTitle.trim()) {
                    addBoard(newBoardTitle.trim());
                    setNewBoardTitle("");
                    setShowNewBoard(false);
                    setShowBoardMenu(false);
                  }
                }}
                className="mt-2"
              >
                <input
                  autoFocus
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Board title..."
                  className="w-full px-2 py-1.5 text-sm border rounded bg-secondary text-foreground"
                />
                <div className="flex gap-1 mt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewBoard(false)}
                    className="p-1 text-muted-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowNewBoard(true)}
                className="w-full text-left px-3 py-2 rounded text-sm hover:bg-accent text-muted-foreground flex items-center gap-1 mt-1"
              >
                <Plus size={14} /> Create new board
              </button>
            )}
          </div>
        </>
      )}

      {/* Board title */}
      {editingBoardTitle ? (
        <input
          autoFocus
          value={boardTitleDraft}
          onChange={(e) => setBoardTitleDraft(e.target.value)}
          onBlur={saveBoardTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveBoardTitle();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              cancelBoardTitleEdit();
            }
          }}
          className="text-header-foreground font-bold text-sm sm:text-lg px-2 py-0.5 rounded bg-secondary border border-border max-w-[140px] sm:max-w-[240px]"
          aria-label="Edit board name"
        />
      ) : (
        <h1
          onDoubleClick={startEditingBoardTitle}
          title="Double-click to edit"
          className="text-header-foreground font-bold text-sm sm:text-lg truncate max-w-[80px] sm:max-w-[200px] cursor-text"
        >
          {currentBoard?.title ?? "Kanban"}
        </h1>
      )}

      <div className="hidden sm:flex items-center gap-1 ml-1">
        <button
          onClick={() => currentBoardId && toggleBoardStar(currentBoardId)}
          className={`p-1.5 rounded transition-colors ${isCurrentBoardStarred ? "bg-secondary text-yellow-300" : "hover:bg-secondary text-header-foreground/70 hover:text-header-foreground"}`}
          title={isCurrentBoardStarred ? "Unstar board" : "Star board"}
        >
          <Star
            size={16}
            fill={isCurrentBoardStarred ? "currentColor" : "none"}
          />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMembersMenu((v) => !v)}
            className="p-1.5 rounded hover:bg-secondary text-header-foreground/70 hover:text-header-foreground transition-colors"
            title="Show members"
          >
            <Users size={16} />
          </button>

          {showMembersMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMembersMenu(false)}
              />
              <div className="absolute left-0 top-9 z-50 w-64 rounded-lg border border-border bg-popover p-3 shadow-lg">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Members
                </p>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent"
                    >
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
                        style={{ background: m.color }}
                      >
                        {m.avatar}
                      </div>
                      <span className="text-sm text-foreground">{m.name}</span>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="px-2 py-1 text-sm text-muted-foreground">
                      No members found.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2 relative">
        <button
          onClick={onToggleFilter}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterOpen || hasFilters ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent text-header-foreground"}`}
        >
          <Filter size={14} />
          <span className="hidden sm:inline">Filter</span>
          {hasFilters && !filterOpen && (
            <span className="w-2 h-2 rounded-full bg-destructive" />
          )}
        </button>
        <button
          onClick={() => setShowBgMenu(!showBgMenu)}
          className="p-1.5 rounded bg-secondary hover:bg-accent text-header-foreground transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>

        {showBgMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowBgMenu(false)}
            />
            <div className="absolute right-0 top-10 z-50 bg-popover rounded-lg shadow-lg border w-72">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-sm font-semibold text-foreground">
                  Change background
                </span>
                <button
                  onClick={() => setShowBgMenu(false)}
                  className="p-0.5 rounded-full border border-border hover:bg-accent text-muted-foreground"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Colors
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {BOARD_BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.color}
                        onClick={() => {
                          if (currentBoardId)
                            updateBoardBackground(currentBoardId, bg.color);
                        }}
                        className={`w-full aspect-[4/3] rounded-md border-2 transition-all ${currentBoard?.background === bg.color ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-foreground/30"}`}
                        style={{ backgroundColor: bg.color }}
                        title={bg.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Gradients
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {BOARD_GRADIENTS.map((bg) => (
                      <button
                        key={bg.name}
                        onClick={() => {
                          if (currentBoardId)
                            updateBoardBackground(currentBoardId, bg.color);
                        }}
                        className={`w-full aspect-[3/2] rounded-md border-2 transition-all ${currentBoard?.background === bg.color ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-foreground/30"}`}
                        style={{ background: bg.color }}
                        title={bg.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
