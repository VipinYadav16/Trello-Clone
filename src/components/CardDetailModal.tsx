import { useState } from 'react';
import type { Card, LabelColor } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanbanStore';
import { X, Calendar, Tag, CheckSquare, Users, MessageSquare, Plus, Trash2, UserPlus, Paperclip, Columns, Clock, ChevronLeft } from 'lucide-react';

function MemberPickerPopover({ boardId, listId, card, onClose }: { boardId: string; listId: string; card: Card; onClose: () => void }) {
  const { members, updateCard, addMember } = useKanbanStore();
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-popover rounded-lg shadow-lg border p-3 w-72">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-foreground">Members</p>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-accent text-muted-foreground"><X size={14} /></button>
      </div>
      <p className="text-xs text-muted-foreground mb-2">Assign members</p>
      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {members.map(m => {
          const assigned = card.memberIds.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => {
                const ids = assigned ? card.memberIds.filter(x => x !== m.id) : [...card.memberIds, m.id];
                updateCard(boardId, listId, card.id, { memberIds: ids });
              }}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${assigned ? 'bg-primary/15' : 'hover:bg-accent'}`}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground" style={{ background: m.color }}>{m.avatar}</div>
              <span className="text-foreground">{m.name}</span>
              {assigned && <span className="ml-auto text-primary font-bold">✓</span>}
            </button>
          );
        })}
      </div>
      <div className="border-t border-border mt-2 pt-2">
        {showAdd ? (
          <div className="flex gap-1">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Full name..."
              className="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-secondary text-foreground"
              onKeyDown={e => {
                if (e.key === 'Enter' && newName.trim()) {
                  addMember(newName.trim());
                  setNewName('');
                  setShowAdd(false);
                }
              }}
            />
            <button
              onClick={() => { if (newName.trim()) { addMember(newName.trim()); setNewName(''); setShowAdd(false); } }}
              className="px-2 py-1.5 bg-primary text-primary-foreground text-sm rounded"
            >
              Add
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-sm text-muted-foreground hover:bg-accent">
            <UserPlus size={14} /> Add new member
          </button>
        )}
      </div>
    </div>
  );
}

// Full Trello-style color palette
const FULL_COLOR_PALETTE = [
  // Row 1 - subtle
  ['hsl(145 63% 42%)', 'hsl(45 93% 47%)', 'hsl(27 96% 54%)', 'hsl(0 72% 51%)', 'hsl(262 52% 47%)'],
  // Row 2 - vivid
  ['hsl(145 63% 32%)', 'hsl(45 80% 38%)', 'hsl(27 80% 44%)', 'hsl(0 60% 42%)', 'hsl(262 45% 38%)'],
  // Row 3 - bright
  ['hsl(160 84% 39%)', 'hsl(55 92% 50%)', 'hsl(35 96% 54%)', 'hsl(350 80% 60%)', 'hsl(280 60% 55%)'],
  // Row 4 - muted/dark
  ['hsl(280 40% 35%)', 'hsl(260 50% 40%)', 'hsl(320 40% 45%)', 'hsl(340 50% 50%)', 'hsl(220 10% 50%)'],
  // Row 5 - cool
  ['hsl(210 79% 46%)', 'hsl(185 60% 42%)', 'hsl(85 50% 45%)', 'hsl(330 50% 55%)', 'hsl(220 10% 60%)'],
  // Row 6 - pastel/other
  ['hsl(270 60% 50%)', 'hsl(250 60% 45%)', 'hsl(120 60% 50%)', 'hsl(340 70% 55%)', 'hsl(220 10% 70%)'],
];

interface CardDetailModalProps {
  boardId: string;
  listId: string;
  card: Card;
  onClose: () => void;
}

const LABEL_COLORS: { color: LabelColor; name: string }[] = [
  { color: 'green', name: 'Green' },
  { color: 'yellow', name: 'Yellow' },
  { color: 'orange', name: 'Orange' },
  { color: 'red', name: 'Red' },
  { color: 'purple', name: 'Purple' },
  { color: 'blue', name: 'Blue' },
];

export function CardDetailModal({ boardId, listId, card, onClose }: CardDetailModalProps) {
  const {
    members, updateCard, addLabel, removeLabel,
    addChecklist, removeChecklist, addChecklistItem, toggleChecklistItem, removeChecklistItem,
    addComment, deleteCard,
  } = useKanbanStore();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [editingDesc, setEditingDesc] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const [editingLabelColor, setEditingLabelColor] = useState<string>('hsl(145 63% 42%)');
  const [editingLabelText, setEditingLabelText] = useState('');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [newLabelText, setNewLabelText] = useState('');
  const [selectedLabelColor, setSelectedLabelColor] = useState<LabelColor>('blue');
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState(card.dueDate ?? '');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});
  const [commentText, setCommentText] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const listObj = useKanbanStore(s => s.boards.find(b => b.id === boardId)?.lists.find(l => l.id === listId));

  const handleTitleBlur = () => {
    if (title.trim() && title !== card.title) updateCard(boardId, listId, card.id, { title: title.trim() });
  };

  const openLabelEditor = (labelId: string | null, color: string, text: string) => {
    setEditingLabelId(labelId);
    setEditingLabelColor(color);
    setEditingLabelText(text);
    setShowLabelEditor(true);
    setShowLabelPicker(false);
  };

  const labelColorToHsl = (color: LabelColor) => {
    const map: Record<LabelColor, string> = {
      green: 'hsl(145 63% 42%)',
      yellow: 'hsl(45 93% 47%)',
      orange: 'hsl(27 96% 54%)',
      red: 'hsl(0 72% 51%)',
      purple: 'hsl(262 52% 47%)',
      blue: 'hsl(210 79% 46%)',
    };
    return map[color];
  };

  const hslToLabelColor = (hsl: string): LabelColor => {
    if (hsl.includes('145')) return 'green';
    if (hsl.includes('45') || hsl.includes('55')) return 'yellow';
    if (hsl.includes('27') || hsl.includes('35')) return 'orange';
    if (hsl.includes('0 72%') || hsl.includes('0 60%') || hsl.includes('350') || hsl.includes('340 70%') || hsl.includes('340 50%') || hsl.includes('330')) return 'red';
    if (hsl.includes('262') || hsl.includes('280') || hsl.includes('270') || hsl.includes('260') || hsl.includes('320')) return 'purple';
    return 'blue';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-8 px-2 sm:px-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden z-10 flex flex-col">
        {/* Cover */}
        {card.coverColor && (
          <div className="h-20 shrink-0" style={{ background: card.coverColor }} />
        )}

        {/* Top bar */}
        <div className="flex items-center justify-end gap-1 px-4 pt-3 absolute top-0 right-0 z-10">
          <button onClick={onClose} className="p-1.5 rounded-md bg-card/80 hover:bg-accent text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row">
            {/* Left column - main content */}
            <div className="flex-1 p-4 sm:p-6 sm:pr-4 min-w-0">
              {/* List badge + Title */}
              <div className="mb-1">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground mb-2">
                  {listObj?.title}
                </span>
              </div>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="text-xl font-bold w-full bg-transparent border-none outline-none focus:bg-secondary rounded px-1 py-0.5 -mx-1 text-foreground"
              />

              {/* Action toolbar - Trello style */}
              <div className="flex flex-wrap gap-2 mt-4 mb-4">
                <div className="relative">
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-accent text-foreground font-medium"
                  >
                    <Plus size={14} /> Add
                  </button>
                  {showAddMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                      <div className="absolute top-full left-0 mt-1 z-50 bg-popover rounded-lg shadow-lg border p-2 w-64">
                        <div className="flex items-center justify-between px-2 py-1 mb-1">
                          <span className="text-sm font-semibold text-foreground">Add to card</span>
                          <button onClick={() => setShowAddMenu(false)} className="p-1 rounded-full border border-border hover:bg-accent text-muted-foreground"><X size={14} /></button>
                        </div>
                        <button onClick={() => { setShowLabelPicker(true); setShowAddMenu(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md hover:bg-accent text-left">
                          <Tag size={16} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Labels</p>
                            <p className="text-xs text-muted-foreground">Organize, categorize, and prioritize</p>
                          </div>
                        </button>
                        <button onClick={() => { setShowDatePicker(true); setShowAddMenu(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md hover:bg-accent text-left">
                          <Clock size={16} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Dates</p>
                            <p className="text-xs text-muted-foreground">Start dates, due dates, and reminders</p>
                          </div>
                        </button>
                        <button onClick={() => { setShowAddChecklist(true); setShowAddMenu(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md hover:bg-accent text-left">
                          <CheckSquare size={16} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Checklist</p>
                            <p className="text-xs text-muted-foreground">Add subtasks</p>
                          </div>
                        </button>
                        <button onClick={() => { setShowMemberPicker(true); setShowAddMenu(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md hover:bg-accent text-left">
                          <Users size={16} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Members</p>
                            <p className="text-xs text-muted-foreground">Assign members</p>
                          </div>
                        </button>
                        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md hover:bg-accent text-left">
                          <Paperclip size={16} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Attachment</p>
                            <p className="text-xs text-muted-foreground">Add links, pages, work items, and more</p>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button onClick={() => setShowLabelPicker(!showLabelPicker)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-accent text-foreground font-medium">
                  <Tag size={14} /> Labels
                </button>
                <button onClick={() => setShowDatePicker(!showDatePicker)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-accent text-foreground font-medium">
                  <Calendar size={14} /> Dates
                </button>
                <button onClick={() => setShowAddChecklist(!showAddChecklist)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-accent text-foreground font-medium">
                  <CheckSquare size={14} /> Checklist
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-accent text-foreground font-medium">
                  <Paperclip size={14} /> Attachment
                </button>
              </div>

              {/* Members display */}
              {card.memberIds.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Members</p>
                  <div className="flex items-center gap-1.5">
                    {members.filter(m => card.memberIds.includes(m.id)).map(m => (
                      <div key={m.id} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ background: m.color }}>{m.avatar}</div>
                    ))}
                    <button onClick={() => setShowMemberPicker(!showMemberPicker)} className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary hover:bg-accent text-muted-foreground">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Labels display */}
              {card.labels.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Labels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.labels.map(l => (
                      <span
                        key={l.id}
                        className="px-3 py-1 rounded text-xs font-medium text-primary-foreground cursor-pointer hover:opacity-80"
                        style={{ background: `hsl(var(--label-${l.color}))` }}
                        onClick={() => removeLabel(boardId, listId, card.id, l.id)}
                        title="Click to remove"
                      >
                        {l.text || l.color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Date display */}
              {card.dueDate && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Due Date</p>
                  <span className={`text-sm px-2 py-1 rounded ${new Date(card.dueDate) < new Date() ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-foreground'}`}>
                    {new Date(card.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Columns size={16} className="text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Description</p>
                </div>
                {editingDesc ? (
                  <div>
                    <textarea
                      autoFocus
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-secondary text-foreground resize-none min-h-[80px] placeholder:text-muted-foreground"
                      rows={4}
                      placeholder="Add a more detailed description..."
                    />
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => { updateCard(boardId, listId, card.id, { description }); setEditingDesc(false); }} className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded">Save</button>
                      <button onClick={() => { setDescription(card.description); setEditingDesc(false); }} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setEditingDesc(true)} className="min-h-[60px] px-3 py-2 text-sm rounded-lg bg-secondary cursor-pointer hover:bg-accent text-foreground">
                    {card.description || 'Add a more detailed description...'}
                  </div>
                )}
              </div>

              {/* Checklists */}
              {card.checklists.map(cl => {
                const done = cl.items.filter(i => i.completed).length;
                const pct = cl.items.length ? Math.round((done / cl.items.length) * 100) : 0;
                return (
                  <div key={cl.id} className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={16} className="text-muted-foreground" />
                        <p className="text-sm font-semibold text-foreground">{cl.title}</p>
                      </div>
                      <button onClick={() => removeChecklist(boardId, listId, card.id, cl.id)} className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded hover:bg-destructive/10">Delete</button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {cl.items.map(item => (
                      <div key={item.id} className="flex items-center gap-2 py-1.5 group">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(boardId, listId, card.id, cl.id, item.id)}
                          className="rounded border-border"
                        />
                        <span className={`text-sm flex-1 ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.text}</span>
                        <button onClick={() => removeChecklistItem(boardId, listId, card.id, cl.id, item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-0.5">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <input
                      value={newItemTexts[cl.id] ?? ''}
                      onChange={e => setNewItemTexts(p => ({ ...p, [cl.id]: e.target.value }))}
                      placeholder="Add an item..."
                      className="w-full px-2 py-1.5 text-sm border border-border rounded bg-secondary text-foreground mt-1 placeholder:text-muted-foreground"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (newItemTexts[cl.id] ?? '').trim()) {
                          addChecklistItem(boardId, listId, card.id, cl.id, { id: crypto.randomUUID(), text: newItemTexts[cl.id].trim(), completed: false });
                          setNewItemTexts(p => ({ ...p, [cl.id]: '' }));
                        }
                      }}
                    />
                  </div>
                );
              })}

              {/* Archive / Delete actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button onClick={() => { updateCard(boardId, listId, card.id, { archived: true }); onClose(); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-secondary hover:bg-accent text-muted-foreground">
                  Archive
                </button>
                <button onClick={() => { deleteCard(boardId, listId, card.id); onClose(); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            {/* Right column - Comments and activity */}
            <div className="w-full sm:w-80 border-t sm:border-t-0 sm:border-l border-border p-4 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Comments and activity</p>
                </div>
              </div>

              {/* Comment input */}
              <div className="mb-4">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-secondary text-foreground resize-none placeholder:text-muted-foreground"
                  rows={2}
                />
                {commentText.trim() && (
                  <button
                    onClick={() => {
                      addComment(boardId, listId, card.id, { id: crypto.randomUUID(), memberId: 'm1', text: commentText.trim(), createdAt: new Date().toISOString() });
                      setCommentText('');
                    }}
                    className="mt-1 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded"
                  >
                    Save
                  </button>
                )}
              </div>

              {/* Activity log */}
              <div className="space-y-3">
                {card.comments.map(c => {
                  const m = members.find(x => x.id === c.memberId);
                  return (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0" style={{ background: m?.color }}>{m?.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">{m?.name}</span>
                          <span className="text-xs text-muted-foreground ml-1">{new Date(c.createdAt).toLocaleString()}</span>
                        </p>
                        <p className="text-sm bg-secondary rounded px-3 py-2 mt-1 text-foreground">{c.text}</p>
                      </div>
                    </div>
                  );
                })}
                {/* Created activity */}
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">AJ</div>
                  <p className="text-xs text-muted-foreground pt-1.5">
                    Card added to <span className="font-medium text-foreground">{listObj?.title}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Label picker popover */}
        {showLabelPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowLabelPicker(false)} />
            <div className="absolute top-32 left-6 z-50 bg-popover rounded-lg shadow-lg border p-3 w-72">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">Labels</p>
                <button onClick={() => setShowLabelPicker(false)} className="p-0.5 rounded hover:bg-accent text-muted-foreground"><X size={14} /></button>
              </div>
              <input placeholder="Search labels..." className="w-full px-2 py-1.5 text-sm border border-border rounded bg-secondary text-foreground mb-2 placeholder:text-muted-foreground" />
              <p className="text-xs text-muted-foreground mb-1.5">Labels</p>
              <div className="space-y-1 mb-3">
                {LABEL_COLORS.map(lc => {
                  const hasLabel = card.labels.some(l => l.color === lc.color);
                  return (
                    <div key={lc.color} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasLabel}
                        onChange={() => {
                          if (hasLabel) {
                            const label = card.labels.find(l => l.color === lc.color);
                            if (label) removeLabel(boardId, listId, card.id, label.id);
                          } else {
                            addLabel(boardId, listId, card.id, { id: crypto.randomUUID(), text: newLabelText, color: lc.color });
                          }
                        }}
                        className="rounded border-border"
                      />
                      <button
                        onClick={() => {
                          if (hasLabel) {
                            const label = card.labels.find(l => l.color === lc.color);
                            if (label) removeLabel(boardId, listId, card.id, label.id);
                          } else {
                            addLabel(boardId, listId, card.id, { id: crypto.randomUUID(), text: newLabelText, color: lc.color });
                          }
                        }}
                        className="flex-1 h-8 rounded-md hover:opacity-90 transition-opacity flex items-center px-3"
                        style={{ background: `hsl(var(--label-${lc.color}))` }}
                      >
                        {card.labels.find(l => l.color === lc.color)?.text && (
                          <span className="text-xs font-medium text-primary-foreground">{card.labels.find(l => l.color === lc.color)?.text}</span>
                        )}
                      </button>
                      <button
                        onClick={() => openLabelEditor(
                          card.labels.find(l => l.color === lc.color)?.id ?? null,
                          labelColorToHsl(lc.color),
                          card.labels.find(l => l.color === lc.color)?.text ?? ''
                        )}
                        className="p-1 rounded hover:bg-accent text-muted-foreground"
                      >
                        <Columns size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => openLabelEditor(null, 'hsl(145 63% 42%)', '')}
                className="w-full py-1.5 text-sm rounded-md bg-secondary hover:bg-accent text-foreground text-center"
              >
                Create a new label
              </button>
            </div>
          </>
        )}

        {/* Label editor popover (Trello style with color grid) */}
        {showLabelEditor && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowLabelEditor(false)} />
            <div className="absolute top-32 left-6 z-50 bg-popover rounded-lg shadow-lg border p-3 w-72">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => { setShowLabelEditor(false); setShowLabelPicker(true); }} className="p-0.5 rounded hover:bg-accent text-muted-foreground">
                  <ChevronLeft size={16} />
                </button>
                <p className="text-sm font-semibold text-foreground">{editingLabelId ? 'Edit label' : 'Create label'}</p>
                <button onClick={() => setShowLabelEditor(false)} className="p-0.5 rounded hover:bg-accent text-muted-foreground"><X size={14} /></button>
              </div>

              {/* Preview */}
              <div className="h-10 rounded-md mb-3 flex items-center px-3" style={{ background: editingLabelColor }}>
                <span className="text-sm font-medium text-primary-foreground">{editingLabelText || ''}</span>
              </div>

              {/* Title input */}
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title</label>
              <input
                autoFocus
                value={editingLabelText}
                onChange={e => setEditingLabelText(e.target.value)}
                placeholder="Enter label title..."
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-secondary text-foreground mb-3 placeholder:text-muted-foreground"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const labelColor = hslToLabelColor(editingLabelColor);
                    if (editingLabelId) {
                      removeLabel(boardId, listId, card.id, editingLabelId);
                    }
                    addLabel(boardId, listId, card.id, { id: crypto.randomUUID(), text: editingLabelText, color: labelColor });
                    setShowLabelEditor(false);
                    setShowLabelPicker(true);
                  }
                }}
              />

              {/* Color grid */}
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Select a color</label>
              <div className="space-y-1.5 mb-3">
                {FULL_COLOR_PALETTE.map((row, ri) => (
                  <div key={ri} className="flex gap-1.5">
                    {row.map((color, ci) => (
                      <button
                        key={ci}
                        onClick={() => setEditingLabelColor(color)}
                        className={`w-10 h-8 rounded-md hover:opacity-80 transition-opacity flex items-center justify-center ${editingLabelColor === color ? 'ring-2 ring-primary-foreground ring-offset-1 ring-offset-popover' : ''}`}
                        style={{ background: color }}
                      >
                        {editingLabelColor === color && <span className="text-primary-foreground text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Remove color */}
              <button
                onClick={() => setEditingLabelColor('hsl(220 13% 40%)')}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-md bg-secondary hover:bg-accent text-foreground mb-3"
              >
                <X size={14} /> Remove color
              </button>

              {/* Save / Delete */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const labelColor = hslToLabelColor(editingLabelColor);
                    if (editingLabelId) {
                      // Update existing label
                      const existingLabel = card.labels.find(l => l.id === editingLabelId);
                      if (existingLabel) {
                        removeLabel(boardId, listId, card.id, editingLabelId);
                        addLabel(boardId, listId, card.id, { id: crypto.randomUUID(), text: editingLabelText, color: labelColor });
                      }
                    } else {
                      addLabel(boardId, listId, card.id, { id: crypto.randomUUID(), text: editingLabelText, color: labelColor });
                    }
                    setShowLabelEditor(false);
                    setShowLabelPicker(true);
                  }}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded font-medium"
                >
                  Save
                </button>
                {editingLabelId && (
                  <button
                    onClick={() => {
                      removeLabel(boardId, listId, card.id, editingLabelId);
                      setShowLabelEditor(false);
                      setShowLabelPicker(true);
                    }}
                    className="px-4 py-1.5 bg-destructive text-destructive-foreground text-sm rounded font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {showMemberPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMemberPicker(false)} />
            <div className="relative">
              <MemberPickerPopover boardId={boardId} listId={listId} card={card} onClose={() => setShowMemberPicker(false)} />
            </div>
          </>
        )}

        {showDatePicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
            <div className="absolute top-32 left-6 z-50 bg-popover rounded-lg shadow-lg border p-3 w-64">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">Dates</p>
                <button onClick={() => setShowDatePicker(false)} className="p-0.5 rounded hover:bg-accent text-muted-foreground"><X size={14} /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Start dates, due dates, and reminders</p>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-secondary text-foreground mb-2"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => { updateCard(boardId, listId, card.id, { dueDate: dueDate || null }); setShowDatePicker(false); }}
                  className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded flex-1"
                >
                  Save
                </button>
                <button
                  onClick={() => { updateCard(boardId, listId, card.id, { dueDate: null }); setDueDate(''); setShowDatePicker(false); }}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            </div>
          </>
        )}

        {showAddChecklist && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowAddChecklist(false)} />
            <div className="absolute top-32 left-6 z-50 bg-popover rounded-lg shadow-lg border p-3 w-64">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">Add checklist</p>
                <button onClick={() => setShowAddChecklist(false)} className="p-0.5 rounded hover:bg-accent text-muted-foreground"><X size={14} /></button>
              </div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title</label>
              <input
                autoFocus
                value={newChecklistTitle}
                onChange={e => setNewChecklistTitle(e.target.value)}
                placeholder="Checklist"
                className="w-full px-2 py-1.5 text-sm border border-border rounded bg-secondary text-foreground mb-3 placeholder:text-muted-foreground"
                onKeyDown={e => {
                  if (e.key === 'Enter' && newChecklistTitle.trim()) {
                    addChecklist(boardId, listId, card.id, { id: crypto.randomUUID(), title: newChecklistTitle.trim(), items: [] });
                    setNewChecklistTitle('');
                    setShowAddChecklist(false);
                  }
                }}
              />
              <button
                onClick={() => {
                  const t = newChecklistTitle.trim() || 'Checklist';
                  addChecklist(boardId, listId, card.id, { id: crypto.randomUUID(), title: t, items: [] });
                  setNewChecklistTitle('');
                  setShowAddChecklist(false);
                }}
                className="w-full px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded"
              >
                Add
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
