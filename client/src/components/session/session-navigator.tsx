import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCampaignContext } from "@/contexts/campaign-context";
import { useUpdateCampaign } from "@/hooks/use-campaigns";
import { useIncrementSession } from "@/hooks/use-campaign-sync";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Calendar,
  Clock,
  Users,
  Scroll,
  Star,
  Plus,
  ArrowRight,
} from "lucide-react";

interface SessionNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SessionData {
  sessionNumber: number;
  date?: Date;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
  keyEvents?: string[];
  duration?: string;
  playersPresent?: number;
}

export function SessionNavigator({ isOpen, onClose }: SessionNavigatorProps) {
  const { currentCampaign, setCurrentCampaign } = useCampaignContext();
  const { incrementSession, isIncrementing } = useIncrementSession();
  const updateCampaignMutation = useUpdateCampaign();
  const { toast } = useToast();

  const [selectedSession, setSelectedSession] = useState<number>(1);

  const currentSession = currentCampaign?.currentSession || 1;
  const totalSessions = currentCampaign?.totalSessions || 0;

  // Initialize selected session to current when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSession(currentSession);
    }
  }, [isOpen, currentSession]);

  // Generate session data - this would eventually come from the backend
  const generateSessions = (): SessionData[] => {
    const sessions: SessionData[] = [];

    // Past sessions (completed)
    for (let i = 1; i <= totalSessions; i++) {
      sessions.push({
        sessionNumber: i,
        date: new Date(
          Date.now() - (totalSessions - i + 1) * 7 * 24 * 60 * 60 * 1000,
        ), // Mock weekly sessions
        isActive: false,
        isPast: true,
        isFuture: false,
        keyEvents: [
          "Entered the Whispering Woods",
          "Encountered the Shadow Drake",
          "Discovered the ancient rune stone",
        ],
        duration: "3h 45m",
        playersPresent: Math.floor(Math.random() * 2) + 3, // 3-4 players
      });
    }

    // Current session
    if (currentSession > totalSessions) {
      sessions.push({
        sessionNumber: currentSession,
        date: new Date(),
        isActive: true,
        isPast: false,
        isFuture: false,
        keyEvents: ["Session in progress..."],
        playersPresent: currentCampaign?.activePlayers || 0,
      });
    }

    // Future sessions (potential)
    for (let i = currentSession + 1; i <= currentSession + 3; i++) {
      sessions.push({
        sessionNumber: i,
        isActive: false,
        isPast: false,
        isFuture: true,
      });
    }

    return sessions;
  };

  const sessions = generateSessions();
  const selectedSessionData = sessions.find(
    (s) => s.sessionNumber === selectedSession,
  );

  const handleNavigateToSession = async (sessionNumber: number) => {
    if (!currentCampaign) return;

    try {
      await updateCampaignMutation.mutateAsync({
        id: currentCampaign.id,
        data: { currentSession: sessionNumber },
      });

      setCurrentCampaign({
        ...currentCampaign,
        currentSession: sessionNumber,
      });

      setSelectedSession(sessionNumber);

      toast({
        title: `Navigated to Session ${sessionNumber}`,
        description:
          sessionNumber <= totalSessions
            ? "Viewing past session data"
            : sessionNumber === currentSession
              ? "Back to current session"
              : "Ready to start new session",
      });
    } catch (error) {
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to session",
        variant: "destructive",
      });
    }
  };

  const handleStartNewSession = async () => {
    try {
      await incrementSession();
      const newSession = currentSession + 1;
      setSelectedSession(newSession);

      toast({
        title: "New Session Started!",
        description: `Welcome to Session ${newSession}! The adventure continues...`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start new session",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!currentCampaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] bg-fantasy-slate border-fantasy-charcoal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy text-fantasy-accent mystical-glow flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Session Navigator
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Session Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-fantasy font-semibold text-fantasy-accent">
                Campaign Timeline
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    selectedSession > 1 &&
                    setSelectedSession(selectedSession - 1)
                  }
                  disabled={selectedSession <= 1}
                  className="border-fantasy-charcoal text-fantasy-text hover:bg-fantasy-charcoal"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    selectedSession < sessions.length &&
                    setSelectedSession(selectedSession + 1)
                  }
                  disabled={selectedSession >= sessions.length}
                  className="border-fantasy-charcoal text-fantasy-text hover:bg-fantasy-charcoal"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sessions.map((session, index) => (
                <Card
                  key={session.sessionNumber}
                  className={`cursor-pointer transition-all duration-300 ${
                    session.sessionNumber === selectedSession
                      ? "bg-fantasy-primary/20 border-fantasy-primary shadow-lg"
                      : session.isActive
                        ? "bg-fantasy-success/10 border-fantasy-success/50"
                        : session.isFuture
                          ? "bg-fantasy-dark/20 border-fantasy-charcoal/30"
                          : "bg-fantasy-dark/30 border-fantasy-charcoal/50 hover:bg-fantasy-dark/50"
                  }`}
                  onClick={() => setSelectedSession(session.sessionNumber)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            session.isActive
                              ? "bg-fantasy-success text-white"
                              : session.isPast
                                ? "bg-fantasy-primary text-white"
                                : "bg-fantasy-charcoal text-gray-400"
                          }`}
                        >
                          {session.sessionNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-fantasy font-semibold text-fantasy-accent">
                              Session {session.sessionNumber}
                            </h4>
                            {session.isActive && (
                              <Badge
                                variant="secondary"
                                className="bg-fantasy-success text-white text-xs"
                              >
                                Current
                              </Badge>
                            )}
                            {session.sessionNumber === currentSession &&
                              session.sessionNumber > totalSessions && (
                                <Badge
                                  variant="secondary"
                                  className="bg-fantasy-amber text-fantasy-dark text-xs"
                                >
                                  Active
                                </Badge>
                              )}
                          </div>
                          {session.date && (
                            <p className="text-xs text-gray-400 font-manuscript">
                              {formatDate(session.date)}
                              {session.duration && ` • ${session.duration}`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {session.playersPresent !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.playersPresent}
                          </div>
                        )}
                        {session.isFuture && (
                          <div className="text-fantasy-mystical">Upcoming</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-fantasy font-semibold text-fantasy-accent">
              Session Details
            </h3>

            {selectedSessionData ? (
              <Card className="bg-fantasy-dark/30 border-fantasy-charcoal/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-fantasy-accent font-fantasy">
                      Session {selectedSessionData.sessionNumber}
                    </CardTitle>
                    {selectedSessionData.isActive && (
                      <Badge className="bg-fantasy-success text-white">
                        Active
                      </Badge>
                    )}
                  </div>
                  {selectedSessionData.date && (
                    <CardDescription className="font-manuscript">
                      {formatDate(selectedSessionData.date)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSessionData.isPast && (
                    <>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-fantasy-text flex items-center gap-2">
                          <Star className="w-4 h-4 text-fantasy-amber" />
                          Key Events
                        </h4>
                        <ul className="space-y-1">
                          {selectedSessionData.keyEvents?.map((event, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-400 font-manuscript flex items-start gap-2"
                            >
                              <div className="w-1 h-1 bg-fantasy-primary rounded-full mt-2 flex-shrink-0"></div>
                              {event}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator className="bg-fantasy-charcoal" />

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedSessionData.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {selectedSessionData.playersPresent} players
                        </div>
                      </div>
                    </>
                  )}

                  {selectedSessionData.isActive && (
                    <div className="space-y-3">
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-fantasy-success/20 rounded-full flex items-center justify-center mx-auto mb-3 mystical-glow">
                          <Play className="w-8 h-8 text-fantasy-success" />
                        </div>
                        <p className="text-sm text-fantasy-text font-manuscript">
                          This session is currently active!
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedSessionData.isFuture && (
                    <div className="space-y-3">
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-fantasy-mystical/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Plus className="w-8 h-8 text-fantasy-mystical" />
                        </div>
                        <p className="text-sm text-fantasy-text font-manuscript mb-3">
                          Ready to begin this session?
                        </p>
                        {selectedSessionData.sessionNumber ===
                          currentSession + 1 && (
                          <Button
                            onClick={handleStartNewSession}
                            disabled={isIncrementing}
                            className="w-full bg-fantasy-success hover:bg-green-600 text-white font-manuscript"
                          >
                            {isIncrementing ? (
                              <>
                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Starting...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Session{" "}
                                {selectedSessionData.sessionNumber}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <Separator className="bg-fantasy-charcoal" />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-fantasy-text">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-fantasy-charcoal text-fantasy-text hover:bg-fantasy-charcoal font-manuscript"
                  onClick={() => handleNavigateToSession(currentSession)}
                  disabled={selectedSession === currentSession}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Current Session
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-fantasy-charcoal text-fantasy-text hover:bg-fantasy-charcoal font-manuscript"
                  onClick={() => setSelectedSession(1)}
                  disabled={selectedSession === 1}
                >
                  <Scroll className="w-4 h-4 mr-2" />
                  View Campaign Start
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
