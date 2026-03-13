import { useState, useRef, useEffect } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import type { List } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanbanStore';
import { KanbanCard } from './KanbanCard';
import { MoreHorizontal, Plus, X, Trash2, Archive, ArrowUpDown, CopyPlus, ChevronLeft } from 'lucide-react';

const LIST_COLORS = [
  { color: 'hsl(145 63% 42%)', name: 'Green' },
  { color: 'hsl(35 100% 50%)', name: 'Yellow' },
  { color: 'hsl(27 96% 54%)', name: 'Orange' },
  { color: 'hsl(0 72% 51%)', name: 'Red' },
  { color: 'hsl(262 52% 47%)', name: 'Purple' },
  { color: 'hsl(210 79% 46%)', name: 'Blue' },
  { color: 'hsl(180 60% 40%)', name: 'Teal' },
  { color: 'hsl(330 60% 50%)', name: 'Pink' },
  { color: 'hsl(160 50% 45%)', name: 'Lime' },
  { color: 'hsl(0 0% 55%)', name: 'Gray' },
];

interface KanbanListProps {
  list: List;
  index: number;
  boardId: string;
  onOpenCardDetail: (listId: string, cardId: string) => void;
}

export function KanbanList({ list, index, boardId, onOpenCardDetail }: KanbanListProps) {
  const { addCard, updateListTitle, updateListColor, deleteList, reorderCards, searchQuery, filterLabels, filterMemberIds, filterDueDate } = useKanbanStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [adding, setAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);

  const filteredCards = list.cards.filter(c => {
    if (c.archived) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterLabels.length > 0 && !c.labels.some(l => filterLabels.includes(l.color))) return false;
    if (filterMemberIds.length > 0 && !c.memberIds.some(id => filterMemberIds.includes(id))) return false;
    if (filterDueDate) {
      if (!c.dueDate) return false;
      const d = new Date(c.dueDate);
      const now = new Date();
      if (filterDueDate === 'overdue' && d >= now) return false;
      if (filterDueDate === 'today' && d.toDateString() !== now.toDateString()) return false;
      if (filterDueDate === 'week') {
        const weekLater = new Date(now); weekLater.setDate(weekLater.getDate() + 7);
        if (d > weekLater || d < now) return false;
      }
    }
    return true;
  });

  const handleSortCards = (by: 'title' | 'date' | 'created') => {
    const sorted = [...list.cards].sort((a, b) => {
      if (by === 'title') return a.title.localeCompare(b.title);
      if (by === 'date') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    reorderCards(boardId, list.id, sorted);
    setShowMenu(false);
  };

  const handleArchiveAll = () => {
    const { updateCard } = useKanbanStore.getState();
    list.cards.forEach(c => updateCard(boardId, list.id, c.id, { archived: true }));
    setShowMenu(false);
  };

  const headerBg = list.color || undefined;

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-64 sm:w-72 shrink-0 flex flex-col max-h-full"
        >
          <div className="bg-card rounded-xl flex flex-col max-h-full">
            {/* Header */}
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between px-3 py-2.5 rounded-t-xl"
              style={headerBg ? { backgroundColor: headerBg } : undefined}
            >
              {editing ? (
                <input
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={() => { updateListTitle(boardId, list.id, title); setEditing(false); }}
                  onKeyDown={e => { if (e.key === 'Enter') { updateListTitle(boardId, list.id, title); setEditing(false); } }}
                  className="text-sm font-semibold bg-secondary px-2 py-1 rounded border border-border w-full text-foreground"
                />
              ) : (
                <h3
                  className="text-sm font-semibold cursor-pointer"
                  style={headerBg ? { color: 'white' } : undefined}
                  onClick={() => setEditing(true)}
                >
                  {list.title}
                </h3>
              )}
              <div className="relative flex items-center gap-0.5">
                <button onClick={() => { setShowMenu(!showMenu); setShowColorPicker(false); }} className="p-1 rounded hover:bg-accent/30 text-muted-foreground" style={headerBg ? { color: 'white' } : undefined}>
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowColorPicker(false); }} />
                    <div className="absolute right-0 top-8 z-50 bg-popover rounded-lg shadow-lg border w-56">
                      {showColorPicker ? (
                        <>
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                            <button onClick={() => setShowColorPicker(false)} className="p-0.5 rounded-full hover:bg-accent text-muted-foreground"><ChevronLeft size={14} /></button>
                            <span className="text-sm font-semibold text-foreground">Change list color</span>
                            <button onClick={() => { setShowMenu(false); setShowColorPicker(false); }} className="p-0.5 rounded-full border border-border hover:bg-accent text-muted-foreground"><X size={14} /></button>
                          </div>
                          <div className="p-3">
                            <div className="grid grid-cols-5 gap-2">
                              {LIST_COLORS.map(lc => (
                                <button
                                  key={lc.color}
                                  onClick={() => { updateListColor(boardId, list.id, lc.color); }}
                                  className={`w-full aspect-square rounded-md border-2 transition-all ${list.color === lc.color ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-foreground/30'}`}
                                  style={{ backgroundColor: lc.color }}
                                  title={lc.name}
                                />
                              ))}
                            </div>
                            {list.color && (
                              <button
                                onClick={() => { updateListColor(boardId, list.id, undefined); }}
                                className="flex items-center justify-center gap-1.5 w-full mt-3 py-2 text-sm rounded-md bg-secondary hover:bg-accent text-foreground"
                              >
                                <X size={14} /> Remove color
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                            <span className="text-sm font-semibold text-foreground">List actions</span>
                            <button onClick={() => setShowMenu(false)} className="p-0.5 rounded-full border border-border hover:bg-accent text-muted-foreground"><X size={14} /></button>
                          </div>
                          <div className="p-1.5">
                            <button onClick={() => { setAdding(true); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md">Add card</button>
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md" onClick={() => setShowMenu(false)}>Copy list</button>
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md" onClick={() => setShowMenu(false)}>Move list</button>

                            <div className="border-t border-border my-1.5" />

                            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Sort by...</p>
                            <button onClick={() => handleSortCards('title')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md">
                              <ArrowUpDown size={14} className="text-muted-foreground" /> Card name
                            </button>
                            <button onClick={() => handleSortCards('date')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md">
                              <ArrowUpDown size={14} className="text-muted-foreground" /> Due date
                            </button>
                            <button onClick={() => handleSortCards('created')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md">
                              <ArrowUpDown size={14} className="text-muted-foreground" /> Date created
                            </button>

                            <div className="border-t border-border my-1.5" />

                            <button onClick={() => setShowColorPicker(true)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md">
                              <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-primary to-accent" /> Change list color
                            </button>

                            <div className="border-t border-border my-1.5" />

                            <button onClick={handleArchiveAll} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md">
                              <Archive size={14} className="text-muted-foreground" /> Archive all cards
                            </button>
                            <button onClick={() => { deleteList(boardId, list.id); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md">
                              <Trash2 size={14} /> Archive this list
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Cards */}
            <Droppable droppableId={list.id} type="card">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto px-2 min-h-[4px] scrollbar-thin transition-colors rounded ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                >
                  {filteredCards.map((card, i) => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      index={i}
                      boardId={boardId}
                      listId={list.id}
                      onOpenDetail={() => onOpenCardDetail(list.id, card.id)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add card */}
            <div className="px-2 pb-2 pt-1">
              {adding ? (
                <div>
                  <textarea
                    ref={inputRef}
                    value={newCardTitle}
                    onChange={e => setNewCardTitle(e.target.value)}
                    placeholder="Enter a title for this card..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-secondary text-foreground resize-none placeholder:text-muted-foreground"
                    rows={2}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (newCardTitle.trim()) { addCard(boardId, list.id, newCardTitle.trim()); setNewCardTitle(''); }
                      }
                    }}
                  />
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => {
                        if (newCardTitle.trim()) { addCard(boardId, list.id, newCardTitle.trim()); setNewCardTitle(''); }
                      }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded font-medium"
                    >
                      Add card
                    </button>
                    <button onClick={() => { setAdding(false); setNewCardTitle(''); }} className="p-1.5 hover:bg-accent rounded text-muted-foreground">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setAdding(true)}
                    className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors"
                  >
                    <Plus size={16} /> Add a card
                  </button>
                  <button className="p-1.5 rounded hover:bg-accent text-muted-foreground">
                    <CopyPlus size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
