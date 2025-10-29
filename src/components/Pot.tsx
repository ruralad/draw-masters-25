import { useDroppable } from '@dnd-kit/core';
import type { Team, PotId } from '../types';
import TeamCard from './TeamCard';

interface PotProps {
  potId: PotId;
  teams: Team[];
  label: string;
}

export default function Pot({ potId, teams, label }: PotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: potId,
    data: {
      type: 'pot',
      potId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded shadow p-4 transition-all duration-200 ${
        isOver ? 'ring-2 ring-[#6366F1] bg-[#6366F1]/5' : ''
      }`}
    >
      <h3 className="text-base font-bold mb-3 text-[#2C2C2C] uppercase tracking-wide">{label}</h3>
      <div className="space-y-2 min-h-[400px]">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            sourceType="pot"
            sourceId={potId}
          />
        ))}
      </div>
    </div>
  );
}
