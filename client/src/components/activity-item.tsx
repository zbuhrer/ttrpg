import { Activity } from "@shared/schema";
import { 
  Sword, 
  TrendingUp, 
  Scroll, 
  AlertTriangle,
  Users,
  Map,
  CheckSquare
} from "lucide-react";

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'combat': return <Sword className="text-fantasy-accent" />;
      case 'level_up': return <TrendingUp className="text-white" />;
      case 'quest_discovery': return <Scroll className="text-fantasy-dark" />;
      case 'story_branch': return <AlertTriangle className="text-white" />;
      case 'npc_interaction': return <Users className="text-fantasy-accent" />;
      case 'location_discovery': return <Map className="text-fantasy-accent" />;
      case 'quest_completion': return <CheckSquare className="text-fantasy-success" />;
      default: return <Scroll className="text-fantasy-accent" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'combat': return 'bg-fantasy-primary';
      case 'level_up': return 'bg-fantasy-success';
      case 'quest_discovery': return 'bg-fantasy-amber';
      case 'story_branch': return 'bg-red-500';
      case 'npc_interaction': return 'bg-blue-500';
      case 'location_discovery': return 'bg-green-500';
      case 'quest_completion': return 'bg-fantasy-success';
      default: return 'bg-fantasy-primary';
    }
  };

  const timeAgo = activity.createdAt 
    ? new Date(activity.createdAt).toLocaleDateString()
    : 'Recently';

  return (
    <div className="flex items-start space-x-4 p-4 bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50">
      <div className={`w-10 h-10 ${getActivityBgColor(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="text-white font-medium">{activity.title}</p>
        <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
        <p className="text-fantasy-accent text-xs mt-2">
          {timeAgo} • Session {activity.sessionNumber || 'Current'}
        </p>
      </div>
    </div>
  );
}
