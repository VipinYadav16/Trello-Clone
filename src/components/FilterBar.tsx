import { useState } from 'react';
import { useKanbanStore } from '@/store/kanbanStore';
import { X, Filter } from 'lucide-react';

export function FilterBar() {
  const { members, searchQuery, setSearchQuery, filterLabels, setFilterLabels, filterMemberIds, setFilterMemberIds, filterDueDate, setFilterDueDate, clearFilters } = useKanbanStore();
  const hasFilters = searchQuery || filterLabels.length > 0 || filterMemberIds.length > 0 || filterDueDate;

  const LABEL_COLORS = ['green', 'yellow', 'orange', 'red', 'purple', 'blue'] as const;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm flex-wrap">
      <Filter size={14} className="text-primary-foreground/80" />

      <input
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search cards..."
        className="px-2 py-1 text-sm rounded bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 border-none outline-none w-40"
      />

      <div className="flex gap-1">
        {LABEL_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setFilterLabels(filterLabels.includes(c) ? filterLabels.filter(x => x !== c) : [...filterLabels, c])}
            className={`w-6 h-4 rounded-sm transition-all ${filterLabels.includes(c) ? 'ring-2 ring-primary-foreground ring-offset-1' : 'opacity-60 hover:opacity-100'}`}
            style={{ background: `hsl(var(--label-${c}))` }}
          />
        ))}
      </div>

      <select
        value={filterDueDate ?? ''}
        onChange={e => setFilterDueDate((e.target.value || null) as any)}
        className="px-2 py-1 text-sm rounded bg-primary-foreground/20 text-primary-foreground border-none outline-none"
      >
        <option value="">Any date</option>
        <option value="overdue">Overdue</option>
        <option value="today">Due today</option>
        <option value="week">Due this week</option>
      </select>

      <select
        value=""
        onChange={e => {
          const id = e.target.value;
          if (id) setFilterMemberIds(filterMemberIds.includes(id) ? filterMemberIds.filter(x => x !== id) : [...filterMemberIds, id]);
        }}
        className="px-2 py-1 text-sm rounded bg-primary-foreground/20 text-primary-foreground border-none outline-none"
      >
        <option value="">Filter by member</option>
        {members.map(m => (
          <option key={m.id} value={m.id}>{filterMemberIds.includes(m.id) ? '✓ ' : ''}{m.name}</option>
        ))}
      </select>

      {hasFilters && (
        <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-primary-foreground/80 hover:text-primary-foreground">
          <X size={12} /> Clear filters
        </button>
      )}
    </div>
  );
}
