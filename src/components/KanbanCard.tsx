import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import type { Card as CardType } from "@/types/kanban";
import { useKanbanStore } from "@/store/kanbanStore";
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Pencil,
  Trash2,
  Eye,
  Paperclip,
} from "lucide-react";

interface KanbanCardProps {
  card: CardType;
  index: number;
  boardId: string;
  listId: string;
  onOpenDetail: () => void;
}

export function KanbanCard({
  card,
  index,
  boardId,
  listId,
  onOpenDetail,
}: KanbanCardProps) {
  const { members, deleteCard } = useKanbanStore();
  const [showMenu, setShowMenu] = useState(false);

  const cardMembers = members.filter((m) => card.memberIds.includes(m.id));
  const totalItems = card.checklists.reduce((a, cl) => a + cl.items.length, 0);
  const doneItems = card.checklists.reduce(
    (a, cl) => a + cl.items.filter((i) => i.completed).length,
    0,
  );

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  if (card.archived) return null;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group bg-secondary hover:bg-accent rounded-lg cursor-pointer mb-1.5 transition-all ${snapshot.isDragging ? "shadow-lg rotate-1 ring-2 ring-primary" : ""}`}
          onClick={onOpenDetail}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowMenu(true);
          }}
        >
          {card.coverImageUrl ? (
            <img
              src={card.coverImageUrl}
              alt="Card cover"
              className="h-16 w-full rounded-t-lg object-cover"
            />
          ) : card.coverColor ? (
            <div
              className="h-8 rounded-t-lg"
              style={{ background: card.coverColor }}
            />
          ) : null}
          <div className="px-3 py-2">
            {card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {card.labels.map((l) => (
                  <span
                    key={l.id}
                    className="h-2 w-10 rounded-full"
                    style={{ background: `hsl(var(--label-${l.color}))` }}
                  />
                ))}
              </div>
            )}
            <p className="text-sm text-card-foreground leading-snug">
              {card.title}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {card.dueDate && (
                <span
                  className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${isOverdue ? "bg-destructive/20 text-destructive" : "text-muted-foreground"}`}
                >
                  <Calendar size={12} />
                  {new Date(card.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              {card.description && (
                <span className="text-muted-foreground">
                  <Pencil size={12} />
                </span>
              )}
              {totalItems > 0 && (
                <span
                  className={`flex items-center gap-1 text-xs ${doneItems === totalItems ? "text-label-green" : "text-muted-foreground"}`}
                >
                  <CheckSquare size={12} />
                  {doneItems}/{totalItems}
                </span>
              )}
              {card.comments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare size={12} />
                  {card.comments.length}
                </span>
              )}
              {card.attachments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip size={12} />
                  {card.attachments.length}
                </span>
              )}
              <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye size={12} />
              </span>
              {cardMembers.length > 0 && (
                <div className="flex -space-x-1.5 ml-auto">
                  {cardMembers.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-primary-foreground ring-1 ring-card"
                      style={{ background: m.color }}
                    >
                      {m.avatar}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div
                className="absolute right-1 top-1 z-50 bg-popover rounded shadow-lg border p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    deleteCard(boardId, listId, card.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded w-full"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}
