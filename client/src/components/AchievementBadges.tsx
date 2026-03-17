import { Trophy, Zap, BookOpen, MessageCircle, Star, Users, Code, Award } from "lucide-react";

export const BADGE_DEFINITIONS = [
  {
    id: "first_login",
    icon: Star,
    title: "Pioneer",
    description: "Joined the TOBSEYTECH community",
    color: "text-neon-yellow",
    bg: "bg-neon-yellow/10",
    border: "border-neon-yellow/30",
  },
  {
    id: "first_post",
    icon: BookOpen,
    title: "Author",
    description: "Published your first blog post",
    color: "text-galactic-orange",
    bg: "bg-galactic-orange/10",
    border: "border-galactic-orange/30",
  },
  {
    id: "first_comment",
    icon: MessageCircle,
    title: "Contributor",
    description: "Left your first comment",
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/10",
    border: "border-neon-cyan/30",
  },
  {
    id: "networker",
    icon: Users,
    title: "Networker",
    description: "Connected with 5+ community members",
    color: "text-neon-purple",
    bg: "bg-neon-purple/10",
    border: "border-neon-purple/30",
  },
  {
    id: "quiz_master",
    icon: Trophy,
    title: "Quiz Master",
    description: "Completed the Digital Skills Assessment",
    color: "text-galactic-gold",
    bg: "bg-galactic-gold/10",
    border: "border-galactic-gold/30",
  },
  {
    id: "builder",
    icon: Code,
    title: "Builder",
    description: "Participated in a Community Challenge",
    color: "text-galactic-green",
    bg: "bg-galactic-green/10",
    border: "border-galactic-green/30",
  },
  {
    id: "influencer",
    icon: Zap,
    title: "Influencer",
    description: "Received 10+ likes on a post",
    color: "text-galactic-orange",
    bg: "bg-galactic-orange/10",
    border: "border-galactic-orange/30",
  },
  {
    id: "mentor",
    icon: Award,
    title: "Mentor",
    description: "Completed a mentorship session",
    color: "text-neon-yellow",
    bg: "bg-neon-yellow/10",
    border: "border-neon-yellow/30",
  },
] as const;

export type BadgeId = (typeof BADGE_DEFINITIONS)[number]["id"];

interface AchievementBadgesProps {
  earnedBadgeIds?: BadgeId[];
  compact?: boolean;
}

export default function AchievementBadges({ earnedBadgeIds = [], compact = false }: AchievementBadgesProps) {
  // Default: first_login and first_comment are earned for every user as a demo
  const earned = earnedBadgeIds.length > 0 ? earnedBadgeIds : ["first_login", "first_comment"] as BadgeId[];

  return (
    <div>
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-neon-yellow" />
          <h3 className="font-orbitron font-bold text-sm text-neon-yellow">Achievements</h3>
          <span className="text-xs text-gray-500 font-orbitron ml-auto">{earned.length}/{BADGE_DEFINITIONS.length} earned</span>
        </div>
      )}
      <div className={`flex flex-wrap gap-3 ${compact ? "" : ""}`}>
        {BADGE_DEFINITIONS.map((badge) => {
          const Icon = badge.icon;
          const isEarned = earned.includes(badge.id as BadgeId);
          return (
            <div
              key={badge.id}
              title={`${badge.title}: ${badge.description}`}
              className={`group relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                isEarned
                  ? `${badge.bg} ${badge.border} cursor-default`
                  : "border-white/5 bg-space-dark/40 opacity-40 grayscale cursor-not-allowed"
              } ${compact ? "w-10 h-10 p-2 justify-center" : "w-16"}`}
            >
              <Icon className={`${compact ? "w-5 h-5" : "w-6 h-6"} ${isEarned ? badge.color : "text-gray-600"}`} />
              {!compact && (
                <span className={`font-orbitron text-xs text-center leading-tight ${isEarned ? badge.color : "text-gray-600"}`}>
                  {badge.title}
                </span>
              )}
              {/* Tooltip for compact mode */}
              {compact && isEarned && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-space-dark border border-galactic-orange/30 rounded text-xs font-orbitron text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  {badge.title}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
