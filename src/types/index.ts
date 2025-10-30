export type PotId = 'pot1' | 'pot2' | 'pot3';
export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Team {
  id: string;
  name: string;
  potId: PotId;
}

export interface DragItem {
  id: string;
  name: string;
  potId: PotId;
  sourceType: 'pot' | 'group';
  sourceId: PotId | GroupId;
}

export interface BracketState {
  pots: Record<PotId, Team[]>;
  groups: Record<GroupId, Team[]>;
}
