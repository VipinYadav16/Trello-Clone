import { useKanbanStore } from '@/store/kanbanStore';
import { X, Users } from 'lucide-react';

interface FilterSidebarProps {
  onClose: () => void;
}

export function FilterSidebar({ onClose }: FilterSidebarProps) {
  const { boards, currentBoardId, members, searchQuery, setSearchQuery, filterLabels, setFilterLabels, filterMemberIds, setFilterMemberIds, filterDueDate, setFilterDueDate, clearFilters } = useKanbanStore();

  const board = boards.find(b => b.id === currentBoardId);

  // Collect all unique labels from all cards in the current board
  const allLabels = (() => {
    if (!board) return [];
    const labelMap = new Map<string, { color: string; text: string }>();
    board.lists.forEach(list => {
      list.cards.forEach(card => {
        card.labels.forEach(label => {
          if (!labelMap.has(label.color)) {
            labelMap.set(label.color, { color: label.color, text: label.text });
          }
        });
      });
    });
    return Array.from(labelMap.values());
  })();

  const LABEL_COLORS = [
    { color: 'green', name: 'Green' },
    { color: 'yellow', name: 'Yellow' },
    { color: 'orange', name: 'Orange' },
    { color: 'red', name: 'Red' },
    { color: 'purple', name: 'Purple' },
    { color: 'blue', name: 'Blue' },
  ] as const;

  const hasFilters = searchQuery || filterLabels.length > 0 || filterMemberIds.length > 0 || filterDueDate;

  // Merge LABEL_COLORS with actual label texts from the board
  const labelsWithText = LABEL_COLORS.map(lc => {
    const found = allLabels.find(l => l.color === lc.color);
    return { ...lc, text: found?.text || '' };
  });

  return (
    <div className="fixed inset-0 sm:static sm:inset-auto w-full sm:w-80 bg-card border-l border-border h-full overflow-y-auto shrink-0 z-30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-base font-semibold text-card-foreground">Filter</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Keyword */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Keyword</label>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Enter a keyword..."
            className="w-full px-3 py-2 text-sm rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">Search cards, members, labels, and more.</p>
        </div>

        {/* Members */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Members</label>
          <div className="space-y-1">
            <label className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent cursor-pointer">
              <input
                type="checkbox"
                checked={filterMemberIds.includes('none')}
                onChange={() => setFilterMemberIds(filterMemberIds.includes('none') ? filterMemberIds.filter(x => x !== 'none') : [...filterMemberIds, 'none'])}
                className="rounded border-border"
              />
              <Users size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">No members</span>
            </label>
            {members.map(m => (
              <label key={m.id} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterMemberIds.includes(m.id)}
                  onChange={() => setFilterMemberIds(filterMemberIds.includes(m.id) ? filterMemberIds.filter(x => x !== m.id) : [...filterMemberIds, m.id])}
                  className="rounded border-border"
                />
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                <span className="text-sm text-foreground">{m.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Due date</label>
          <div className="space-y-1">
            {[
              { value: null, label: 'No dates', icon: '📅' },
              { value: 'overdue' as const, label: 'Overdue', icon: '🔴' },
              { value: 'today' as const, label: 'Due in the next day', icon: '🟡' },
              { value: 'week' as const, label: 'Due in the next week', icon: '🕐' },
            ].map(opt => (
              <label key={opt.label} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterDueDate === opt.value}
                  onChange={() => setFilterDueDate(filterDueDate === opt.value ? null : opt.value)}
                  className="rounded border-border"
                />
                <span className="text-base">{opt.icon}</span>
                <span className="text-sm text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Labels</label>
          <div className="space-y-1">
            {labelsWithText.map(lc => (
              <label key={lc.color} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterLabels.includes(lc.color)}
                  onChange={() => setFilterLabels(filterLabels.includes(lc.color) ? filterLabels.filter(x => x !== lc.color) : [...filterLabels, lc.color])}
                  className="rounded border-border"
                />
                <div className="flex-1 h-8 rounded-md flex items-center px-3" style={{ background: `hsl(var(--label-${lc.color}))` }}>
                  {lc.text && <span className="text-xs font-semibold text-white drop-shadow-sm">{lc.text}</span>}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button onClick={clearFilters} className="w-full py-2 text-sm rounded-md bg-secondary hover:bg-accent text-foreground">
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
