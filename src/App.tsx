import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { BracketState, Team, PotId, GroupId } from './types';
import Pot from './components/Pot';
import Group from './components/Group';
import TeamCard from './components/TeamCard';
import ExcelUpload from './components/ExcelUpload';

function initializeBracketState(): BracketState {
  // Try to load from localStorage first
  const savedState = localStorage.getItem('bracketState');
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch (error) {
      console.error('Error parsing saved state:', error);
    }
  }

  // Return empty state if no data in localStorage
  return {
    pots: {
      pot1: [],
      pot2: [],
      pot3: [],
    },
    groups: {
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: [],
    },
  };
}

function App() {
  const [bracketState, setBracketState] = useState<BracketState>(initializeBracketState);

  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const team = active.data.current?.team as Team;
    setActiveTeam(team);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTeam(null);

    if (!over) return;

    const sourceData = active.data.current;
    const targetData = over.data.current;

    if (!sourceData || !targetData) return;

    const team = sourceData.team as Team;
    const sourceType = sourceData.sourceType as 'pot' | 'group';
    const sourceId = sourceData.sourceId as string;
    const targetType = targetData.type as 'pot' | 'group';

    setBracketState((prev) => {
      const newState = { ...prev };

      // Remove from source
      if (sourceType === 'pot') {
        newState.pots = {
          ...newState.pots,
          [sourceId as PotId]: newState.pots[sourceId as PotId].filter(
            (t) => t.id !== team.id
          ),
        };
      } else {
        newState.groups = {
          ...newState.groups,
          [sourceId as GroupId]: newState.groups[sourceId as GroupId].filter(
            (t) => t.id !== team.id
          ),
        };
      }

      // Add to target
      if (targetType === 'pot') {
        const targetPotId = targetData.potId as PotId;
        newState.pots = {
          ...newState.pots,
          [targetPotId]: [...newState.pots[targetPotId], team],
        };
      } else {
        const targetGroupId = targetData.groupId as GroupId;
        newState.groups = {
          ...newState.groups,
          [targetGroupId]: [...newState.groups[targetGroupId], team],
        };
      }

      return newState;
    });
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      // Enter fullscreen
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error entering fullscreen:', err);
      }
    } else {
      // Exit fullscreen
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error exiting fullscreen:', err);
      }
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset? This will clear all teams and groups.')) {
      localStorage.removeItem('bracketState');
      setBracketState(initializeBracketState());
    }
  };

  const handleDataLoaded = (newState: BracketState) => {
    setBracketState(newState);
  };

  // Listen for fullscreen changes (e.g., when user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bracketState', JSON.stringify(bracketState));
  }, [bracketState]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[#F5F5F5] p-6">
        <div className="max-w-[1800px] mx-auto">
          {/* Heading */}
          <h1 className="text-4xl font-bold text-[#2C2C2C] mb-6 text-center">
            Masters Cup Draw
          </h1>

          {/* Action Buttons - show on hover in fullscreen mode */}
          <div className={`fixed top-4 right-4 z-50 flex gap-2 transition-all duration-200 ${
            isFullscreen ? 'opacity-0 hover:opacity-100' : ''
          }`}>
            {!isFullscreen && <ExcelUpload onDataLoaded={handleDataLoaded} />}
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-[#6366F1] text-white rounded hover:bg-[#4F46E5] transition-colors duration-200 shadow font-semibold uppercase text-sm tracking-wide"
            >
              Reset
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-5 py-2.5 bg-[#EC4899] text-white rounded hover:bg-[#DB2777] transition-colors duration-200 shadow font-semibold uppercase text-sm tracking-wide"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Groups Section */}
            <div className="xl:col-span-3 flex flex-col justify-center">
              {!isFullscreen && <h2 className="text-xl font-bold text-[#2C2C2C] mb-4 uppercase tracking-wide">Groups</h2>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(bracketState.groups) as GroupId[]).map((groupId) => (
                  <Group
                    key={groupId}
                    groupId={groupId}
                    teams={bracketState.groups[groupId]}
                  />
                ))}
              </div>
            </div>

            {/* Pots Section with independent scrolling */}
            <div className="xl:col-span-1">
              {!isFullscreen && <h2 className="text-xl font-bold text-[#2C2C2C] mb-4 uppercase tracking-wide">Pots</h2>}
              <div className="space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
                <Pot
                  potId="pot1"
                  teams={bracketState.pots.pot1}
                  label="Pot 1"
                />
                <Pot
                  potId="pot2"
                  teams={bracketState.pots.pot2}
                  label="Pot 2"
                />
                <Pot
                  potId="pot3"
                  teams={bracketState.pots.pot3}
                  label="Pot 3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTeam ? (
          <div className="cursor-grabbing">
            <TeamCard
              team={activeTeam}
              sourceType="pot"
              sourceId={activeTeam.potId}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
