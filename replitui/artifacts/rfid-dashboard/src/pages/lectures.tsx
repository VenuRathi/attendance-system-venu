import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetActiveLecture, 
  useGetLectureStats, 
  useStartLecture, 
  useEndLecture,
  getGetActiveLectureQueryKey,
  getGetLectureStatsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Lectures() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: activeLecture, isLoading: activeLoading } = useGetActiveLecture();
  const { data: stats, isLoading: statsLoading } = useGetLectureStats();
  
  const startMutation = useStartLecture();
  const endMutation = useEndLecture();

  const handleStart = (lectureNumber: number) => {
    startMutation.mutate({ data: { lectureNumber } }, {
      onSuccess: () => {
        toast({ title: "Lecture Started", description: `Lecture ${lectureNumber} is now active.` });
        queryClient.invalidateQueries({ queryKey: getGetActiveLectureQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLectureStatsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to start lecture.", variant: "destructive" });
      }
    });
  };

  const handleEnd = () => {
    endMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Lecture Ended", description: "The active lecture has been ended." });
        queryClient.invalidateQueries({ queryKey: getGetActiveLectureQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLectureStatsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to end lecture.", variant: "destructive" });
      }
    });
  };

  const lectureSlots = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono uppercase">Lecture Controls</h1>
        <p className="text-muted-foreground">Manage active recording sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {lectureSlots.map((num) => {
          const stat = stats?.find(s => s.lectureNumber === num);
          const isActive = activeLecture?.lectureNumber === num && activeLecture?.isActive;
          const isAnotherActive = activeLecture?.isActive && activeLecture.lectureNumber !== num;
          
          return (
            <Card key={num} className={`border-border/50 transition-all ${isActive ? 'ring-1 ring-primary border-primary bg-primary/5' : 'bg-card/50'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-mono text-xl font-bold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      L{num}
                    </div>
                    <div>
                      <div className="font-mono uppercase font-bold flex items-center gap-2">
                        Slot {num}
                        {isActive && <Badge className="bg-primary text-primary-foreground text-[10px] animate-pulse">ACTIVE</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex gap-3">
                        <span className="text-[#00FF66]">{stat?.presentCount || 0} Valid</span>
                        <span className="text-[#FFCC00]">{stat?.duplicateCount || 0} Dupe</span>
                        <span className="text-destructive">{stat?.invalidCount || 0} Inv</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {isActive ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="font-mono uppercase" 
                        onClick={handleEnd}
                        disabled={endMutation.isPending}
                        data-testid={`button-end-lecture-${num}`}
                      >
                        <Square className="h-4 w-4 mr-2" /> Stop
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-mono uppercase hover:text-primary hover:border-primary"
                        onClick={() => handleStart(num)}
                        disabled={isAnotherActive || startMutation.isPending}
                        data-testid={`button-start-lecture-${num}`}
                      >
                        <Play className="h-4 w-4 mr-2" /> Start
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
