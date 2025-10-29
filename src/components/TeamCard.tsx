import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Team } from '../types';

interface TeamCardProps {
  team: Team;
  sourceType: 'pot' | 'group';
  sourceId: string;
}

export default function TeamCard({ team, sourceType, sourceId }: TeamCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: team.id,
    data: {
      team,
      sourceType,
      sourceId,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const potColors: Record<string, string> = {
    pot1: 'bg-[#6366F1]',
    pot2: 'bg-[#EC4899]',
    pot3: 'bg-[#8B5CF6]',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${potColors[team.potId]} text-white px-4 py-2.5 rounded cursor-grab active:cursor-grabbing shadow hover:shadow-md transition-all duration-200 select-none font-medium`}
    >
      <div className="text-sm">{team.name}</div>
    </div>
  );
}
