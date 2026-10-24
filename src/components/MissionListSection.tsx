import React, { useState } from 'react';
import { Lock, Unlock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { MissionItem } from '../utils/auditEngine';

interface MissionListSectionProps {
  freeMissions: MissionItem[];
  proMissions: MissionItem[];
  completedMissionIds: number[];
  selectedMissionId: number | null;
  proUnlocked: boolean;
  onToggleMissionComplete: (id: number) => void;
  onSelectMission: (id: number) => void;
  onToggleProUnlock: () => void;
}

export const MissionListSection: React.FC<MissionListSectionProps> = ({
  freeMissions,
  proMissions,
  completedMissionIds,
  selectedMissionId,
  proUnlocked,
  onToggleMissionComplete,
  onSelectMission,
  onToggleProUnlock,
}) => {
  const [showAllProMissions, setShowAllProMissions] = useState(false);

  const renderUnlockedCard = (mission: MissionItem) => {
    const isCompleted = completedMissionIds.includes(mission.id);
    const isSelected = selectedMissionId === mission.id;

    return (
      <div
        key={mission.id}
        id={`mission-card-${mission.id}`}
        onClick={() => onSelectMission(mission.id)}
        className={`rounded-xl p-4 transition-all cursor-pointer ${
          isCompleted
            ? 'bg-[#141810]/75 border border-[#384D1B] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(204,255,0,0.1)]'
            : isSelected
            ? 'glass-card-interactive border-white/20 shadow-[0_8px_28px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,85,0,0.25)]'
            : 'glass-card-interactive'
        }`}
      >
        {/* Top Row: #N Orange Circle + Title on Left | +XP Bronze Pill on Right */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-display shrink-0 mt-0.5 ${
                isCompleted
                  ? 'bg-[#CCFF00] text-[#0C0B0A]'
                  : 'bg-[#FF5500] text-[#F5F3EF]'
              }`}
            >
              #{mission.id}
            </span>
            <h3
              className={`text-[14px] font-semibold font-display leading-snug ${
                isCompleted ? 'line-through text-[#8C8881]' : 'text-[#F5F3EF]'
              }`}
            >
              {mission.title}
            </h3>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-[#2A1B10] border border-[#6E3E19] text-[#FF8833] text-[11px] font-bold font-display whitespace-nowrap shrink-0">
            +{mission.xp_reward} XP
          </span>
        </div>

        {/* Body: Solución label + quick_fix_5min */}
        <div className="mt-3 space-y-1">
          <div className="text-[11px] font-bold text-[#F5F3EF] font-display">
            Solución
          </div>
          <p className="text-[12px] text-[#B8B3AA] leading-relaxed">
            {mission.quick_fix_5min}
          </p>
        </div>

        {/* Bottom Full-Width Action Button: "Misión completada" */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMissionComplete(mission.id);
          }}
          className={`mt-3.5 w-full py-2 px-3 rounded-lg text-xs font-medium font-display transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            isCompleted
              ? 'bg-[#1D240B]/90 border border-[#4A6616] text-[#CCFF00]'
              : 'glass-button-ghost text-[#D8D3CA] hover:text-[#F5F3EF]'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Misión completada (+{mission.xp_reward} XP)</span>
            </>
          ) : (
            <span>Misión completada</span>
          )}
        </button>
      </div>
    );
  };

  const renderBlurredProStyleCard = (
    mission: MissionItem,
    isFreeSelectable: boolean
  ) => {
    return (
      <div
        key={mission.id}
        id={`mission-card-${mission.id}`}
        onClick={() => {
          onSelectMission(mission.id);
          if (!isFreeSelectable && !proUnlocked) {
            onToggleProUnlock();
          }
        }}
        className="rounded-xl p-4 glass-card-interactive cursor-pointer group"
      >
        {/* Top Row: Muted Title on Left | "Pro 🔒" Badge on Right */}
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="text-[13px] font-semibold font-display text-[#9E9A93] group-hover:text-[#D8D3CA] transition-colors leading-snug">
            {mission.title}
          </h3>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded glass-pill text-[10px] font-bold font-display text-[#C7C3BC]">
              Pro
            </span>
            <Lock className="w-3.5 h-3.5 text-[#8C8881] group-hover:text-[#FF5500] transition-colors" />
          </div>
        </div>

        {/* Blurred Solución Body matching the reference mockup */}
        <div className="mt-2.5 space-y-1 select-none">
          <div className="text-[11px] font-bold text-[#8C8881] font-display blur-[1.5px]">
            Solución
          </div>
          <p className="text-[12px] text-[#78746D] leading-relaxed blur-[3px] group-hover:blur-[2px] transition-all">
            {mission.quick_fix_5min}
          </p>
        </div>
      </div>
    );
  };

  return (
    <aside
      aria-labelledby="free-missions-heading"
      className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3.5 w-full"
    >
      {/* Column Header matching reference image */}
      <div className="flex items-center justify-between gap-2">
        <h2
          id="free-missions-heading"
          className="text-base sm:text-lg font-bold text-[#F5F3EF] font-display tracking-tight"
        >
          Misiones Críticas
        </h2>

        <button
          type="button"
          onClick={onToggleProUnlock}
          className="text-[11px] font-semibold font-display text-[#8C8881] hover:text-[#FF5500] transition-colors flex items-center gap-1 cursor-pointer"
          title={
            proUnlocked
              ? 'Volver a vista con bloqueo Pro'
              : 'Desbloquear todas las misiones Pro'
          }
        >
          {proUnlocked ? (
            <>
              <Lock className="w-3 h-3" />
              <span>Bloquear Pro</span>
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 text-[#FF5500]" />
              <span>Desbloquear Pro</span>
            </>
          )}
        </button>
      </div>

      {/* Primary 3 Critical Missions Stack (matches the 3 cards in the reference image) */}
      <div className="space-y-3" data-testid="free-missions-list">
        {freeMissions.map((mission, idx) => {
          const isCompleted = completedMissionIds.includes(mission.id);
          const isSelected =
            selectedMissionId === mission.id || (selectedMissionId === null && idx === 0);

          // On initial load, Card #1 is unlocked and Cards #2 & #3 display the blurred Pro preview style
          // exactly like the reference mockup. Clicking any card or unlocking Pro reveals it immediately.
          if (idx === 0 || isSelected || isCompleted || proUnlocked) {
            return renderUnlockedCard(mission);
          }
          return renderBlurredProStyleCard(mission, true);
        })}
      </div>

      {/* Additional 5 Pro Missions (expandable or unlocked) */}
      <div className="pt-1 space-y-2.5" data-testid="pro-missions-list">
        <button
          type="button"
          onClick={() => setShowAllProMissions((prev) => !prev)}
          className="w-full py-2 px-3 rounded-xl bg-[#141312] border border-[#221F1C] hover:border-[#332E29] text-[11px] font-semibold font-display text-[#9E9A93] hover:text-[#F5F3EF] transition-colors flex items-center justify-between cursor-pointer"
        >
          <span>
            {proUnlocked
              ? `Misiones Pro desbloqueadas (${proMissions.length})`
              : `+${proMissions.length} misiones avanzadas Pro (+950 XP)`}
          </span>
          {showAllProMissions || proUnlocked ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {(showAllProMissions || proUnlocked) && (
          <div className="space-y-2.5">
            {proMissions.map((m) =>
              proUnlocked ? renderUnlockedCard(m) : renderBlurredProStyleCard(m, false)
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
