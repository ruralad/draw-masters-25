import { useDroppable } from '@dnd-kit/core';
import type { Team, GroupId } from '../types';
import TeamCard from './TeamCard';

interface GroupProps {
  groupId: GroupId;
  teams: Team[];
}

export default function Group({ groupId, teams }: GroupProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${groupId}`,
    data: {
      type: 'group',
      groupId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded shadow p-4 transition-all duration-200 ${
        isOver ? 'ring-2 ring-[#6366F1] bg-[#6366F1]/5' : ''
      }`}
    >
      <h3 className="text-base font-bold mb-3 text-[#2C2C2C] text-center uppercase tracking-wide">
        Group {groupId}
      </h3>
      <div className="space-y-2 min-h-[200px]">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            sourceType="group"
            sourceId={groupId}
          />
        ))}

      </div>
      <div className="mt-2 text-xs text-gray-500 text-center font-medium">
        {teams.length}/3 teams
      </div>
    </div>
  );
}
