import { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useKanbanStore } from "@/store/kanbanStore";
import { AppHeader } from "@/components/AppHeader";
import { KanbanList } from "@/components/KanbanList";
import { CardDetailModal } from "@/components/CardDetailModal";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Plus, X } from "lucide-react";

const BoardPage = () => {
  const { boards, currentBoardId, reorderLists, moveCard, reorderCards } =
    useKanbanStore();
  const board = boards.find((b) => b.id === currentBoardId);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const addList = useKanbanStore((s) => s.addList);
  const loadFromApi = useKanbanStore((s) => s.loadFromApi);
  const [detailOpen, setDetailOpen] = useState<{
    listId: string;
    cardId: string;
  } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    void loadFromApi();
  }, [loadFromApi]);

  if (!board) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader
          onToggleFilter={() => setFilterOpen(!filterOpen)}
          filterOpen={filterOpen}
        />
        <div className="flex-1 flex items-center justify-center bg-board">
          <div className="text-center text-foreground">
            <h2 className="text-2xl font-bold mb-2">No board selected</h2>
            <p className="text-muted-foreground">
              Create a new board to get started!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const onDragEnd = (result: DropResult) => {
    const { type, source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === "list") {
      const lists = Array.from(board.lists);
      const [moved] = lists.splice(source.index, 1);
      lists.splice(destination.index, 0, moved);
      reorderLists(board.id, lists);
    } else if (type === "card") {
      if (source.droppableId === destination.droppableId) {
        const list = board.lists.find((l) => l.id === source.droppableId);
        if (!list) return;
        const cards = Array.from(list.cards);
        const [moved] = cards.splice(source.index, 1);
        cards.splice(destination.index, 0, moved);
        reorderCards(board.id, list.id, cards);
      } else {
        const srcList = board.lists.find((l) => l.id === source.droppableId);
        if (!srcList) return;
        const card = srcList.cards[source.index];
        if (!card) return;
        moveCard(
          board.id,
          source.droppableId,
          destination.droppableId,
          card.id,
          destination.index,
        );
      }
    }
  };

  const detailCard = detailOpen
    ? board.lists
        .find((l) => l.id === detailOpen.listId)
        ?.cards.find((c) => c.id === detailOpen.cardId)
    : null;

  return (
    <div className="flex flex-col h-screen">
      <AppHeader
        onToggleFilter={() => setFilterOpen(!filterOpen)}
        filterOpen={filterOpen}
      />
      <div className="flex-1 flex overflow-hidden">
        <div
          className="flex-1 overflow-x-auto overflow-y-hidden p-2 sm:p-4"
          style={{ background: board.background }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board" direction="horizontal" type="list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-2 sm:gap-3 items-start h-full"
                >
                  {board.lists.map((list, i) => (
                    <KanbanList
                      key={list.id}
                      list={list}
                      index={i}
                      boardId={board.id}
                      onOpenCardDetail={(listId, cardId) =>
                        setDetailOpen({ listId, cardId })
                      }
                    />
                  ))}
                  {provided.placeholder}

                  {/* Add list */}
                  <div className="w-64 sm:w-72 shrink-0">
                    {addingList ? (
                      <div className="bg-card rounded-xl p-2">
                        <input
                          autoFocus
                          value={newListTitle}
                          onChange={(e) => setNewListTitle(e.target.value)}
                          placeholder="Enter list title..."
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newListTitle.trim()) {
                              addList(board.id, newListTitle.trim());
                              setNewListTitle("");
                            }
                          }}
                        />
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => {
                              if (newListTitle.trim()) {
                                addList(board.id, newListTitle.trim());
                                setNewListTitle("");
                              }
                            }}
                            className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded font-medium"
                          >
                            Add list
                          </button>
                          <button
                            onClick={() => {
                              setAddingList(false);
                              setNewListTitle("");
                            }}
                            className="p-1.5 hover:bg-accent rounded text-muted-foreground"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingList(true)}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground transition-colors"
                      >
                        <Plus size={16} /> Add another list
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Filter sidebar */}
        {filterOpen && <FilterSidebar onClose={() => setFilterOpen(false)} />}
      </div>

      {detailOpen && detailCard && (
        <CardDetailModal
          boardId={board.id}
          listId={detailOpen.listId}
          card={detailCard}
          onClose={() => setDetailOpen(null)}
        />
      )}
    </div>
  );
};

export default BoardPage;
