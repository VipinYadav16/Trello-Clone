export interface Member {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export type LabelColor = 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'blue';

export interface Label {
  id: string;
  text: string;
  color: LabelColor;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Comment {
  id: string;
  memberId: string;
  text: string;
  createdAt: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  memberIds: string[];
  dueDate: string | null;
  checklists: Checklist[];
  comments: Comment[];
  coverColor: string | null;
  archived: boolean;
  createdAt: string;
  position: number;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
  position: number;
  color?: string;
}

export interface Board {
  id: string;
  title: string;
  background: string;
  lists: List[];
  createdAt: string;
}
