import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useResetDay, 
  useGetLectureStats,
  getGetActiveLectureQueryKey,
  getGetLectureStatsQueryKey,
  getGetAttendanceQueryKey,
  getGetAttendanceSummaryQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, RotateCcw, Lock, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const DEV_PIN = "rfid2025";

export default function Reset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const { data: stats, isLoading } = useGetLectureStats();
  const resetMutation = useResetDay();

  const handleUnlock = () => {
    if (pin === DEV_PIN) {
      setUnlocked(true);
      setPinError(false);
      setPin("");
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const handleReset = () => {
    resetMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ 
          title: "System Reset", 
          description: "All data cleared. System ready for a new day.",
          className: "bg-primary text-primary-foreground border-primary"
        });
        queryClient.invalidateQueries({ queryKey: getGetActiveLectureQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLectureStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAttendanceQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAttendanceSummaryQueryKey() });
        setUnlocked(false);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to reset system.", variant: "destructive" });
      }
    });
  };

  const totalScans = stats?.reduce((acc, curr) => acc + curr.totalScans, 0) || 0;

  if (!unlocked) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-sm border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="h-14 w-14 rounded-full bg-muted/30 border border-border flex items-center justify-center">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="font-mono uppercase tracking-wider text-base">Developer Access</CardTitle>
            <CardDescription className="text-xs">
              This area is restricted. Enter the developer PIN to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className={`font-mono text-center tracking-widest ${pinError ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {pinError && (
              <p className="text-xs text-destructive font-mono text-center flex items-center justify-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Incorrect PIN. Access denied.
              </p>
            )}
            <Button
              className="w-full font-mono uppercase tracking-wider"
              onClick={handleUnlock}
              disabled={!pin}
            >
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-12">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-mono uppercase text-destructive">Danger Zone</h1>
        <p className="text-muted-foreground mt-2">These actions cannot be undone.</p>
      </div>

      <Card className="border-destructive/50 bg-card/50 backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
        <CardHeader>
          <CardTitle className="font-mono uppercase text-lg text-destructive flex items-center gap-2">
            System Reset
          </CardTitle>
          <CardDescription>
            Purge all attendance records, summaries, and stats for the current day.
            Resets the active lecture slot back to Lecture 1.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/5 border border-destructive/20 rounded-md p-4 mb-6">
            <h4 className="font-mono text-sm font-bold mb-2">Current State to be erased:</h4>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <ul className="text-sm text-muted-foreground font-mono space-y-1">
                <li>Total Scans: {totalScans}</li>
                <li>Lectures active today: {stats?.filter(s => s.totalScans > 0).length || 0}</li>
              </ul>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-destructive/20 pt-6">
          <Button
            variant="ghost"
            size="sm"
            className="font-mono text-xs text-muted-foreground"
            onClick={() => setUnlocked(false)}
          >
            Lock Again
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="font-mono uppercase tracking-wider"
                disabled={resetMutation.isPending}
                data-testid="button-reset-day"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Initialize Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-destructive bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-mono uppercase text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Confirm Data Wipe
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Are you absolutely sure? This will permanently delete all attendance data for today. This action cannot be reversed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-mono">Abort</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono uppercase"
                  data-testid="button-confirm-reset"
                >
                  Execute Wipe
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
