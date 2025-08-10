import { Quest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-fantasy-success/20 text-fantasy-success';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'optional': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-fantasy-error/20 text-fantasy-error';
      case 'high': return 'bg-fantasy-amber/20 text-fantasy-amber';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const progressPercentage = quest.maxProgress > 0 ? (quest.progress / quest.maxProgress) * 100 : 0;

  return (
    <div className="p-4 bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-white">{quest.title}</h4>
        <div className="flex space-x-2">
          {quest.priority !== 'normal' && (
            <Badge className={getPriorityColor(quest.priority || 'normal')}>
              {quest.priority}
            </Badge>
          )}
          <Badge className={getStatusColor(quest.status || 'in_progress')}>
            {quest.status?.replace('_', ' ') || 'in progress'}
          </Badge>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-fantasy-accent">
            {quest.completedObjectives?.length || 0}/{quest.objectives?.length || 0} objectives complete
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-fantasy-success"
        />
        {quest.timeLimit && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Time Remaining</span>
            <span className="text-fantasy-error">{quest.timeLimit}</span>
          </div>
        )}
      </div>
    </div>
  );
}
