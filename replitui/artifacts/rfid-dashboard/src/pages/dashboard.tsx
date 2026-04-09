import { useGetAttendance, useGetActiveLecture } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertTriangle, XCircle, Zap, Activity } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { useEffect, useRef } from "react";

export default function Dashboard() {
  const { data: attendance = [], isLoading: loading } = useGetAttendance(undefined, {
    query: {
      refetchInterval: 500,
      refetchIntervalInBackground: true,
    },
  });
  const { data: activeLecture, isLoading: lectureLoading } = useGetActiveLecture();
  const { playFaahSound } = useSound();
  const prevInvalidCountRef = useRef(0);
  const baselineReadyRef = useRef(false);

  // 📊 TOTALS
  const totals = {
    total: attendance.length,
    present: attendance.filter(a => a.status === "present").length,
    duplicate: attendance.filter(a => a.status === "duplicate").length,
    invalid: attendance.filter(a => a.status === "invalid").length,
  };

  // Play sound when invalid count increases
  useEffect(() => {
    if (loading) {
      return;
    }

    if (!baselineReadyRef.current) {
      baselineReadyRef.current = true;
      prevInvalidCountRef.current = totals.invalid;
      return;
    }

    if (totals.invalid > prevInvalidCountRef.current) {
      playFaahSound();
    }
    prevInvalidCountRef.current = totals.invalid;
  }, [totals.invalid, loading, playFaahSound]);

  // 🔴 LATEST SCANS
  const latestScans = [...attendance]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono uppercase">
            System Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time RFID attendance telemetry
          </p>
        </div>

        {lectureLoading ? (
          <Skeleton className="w-40 h-10" />
        ) : activeLecture?.isActive ? (
          <Badge className="px-4 py-2 bg-primary text-primary-foreground animate-pulse">
            🔴 Lecture {activeLecture.lectureNumber} Active - Scanning Enabled
          </Badge>
        ) : (
          <Badge variant="destructive" className="px-4 py-2">
            ⚠️ No Active Lecture - Scanning Disabled
          </Badge>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Scans" value={totals.total} icon={Activity} loading={loading} />
        <StatsCard title="Present" value={totals.present} icon={Users} className="text-[#00FF66]" loading={loading} />
        <StatsCard title="Duplicate" value={totals.duplicate} icon={AlertTriangle} className="text-[#FFCC00]" loading={loading} />
        <StatsCard title="Invalid" value={totals.invalid} icon={XCircle} className="text-red-500" loading={loading} />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LIVE FEED */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="font-mono uppercase tracking-wider text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Live Scan Feed
            </CardTitle>
            <CardDescription>
              Latest 10 scans across the system
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : latestScans.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground font-mono text-sm">
                No recent scans detected
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {latestScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div>
                      <div className="font-medium text-foreground">{scan.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{scan.uid}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={scan.status} />
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SYSTEM STATUS */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wider text-sm">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 border border-primary/20 rounded-lg bg-primary/5">
              <div className="text-3xl font-mono text-primary mb-2">
                ACTIVE
              </div>
              <div className="text-sm text-primary/80 uppercase tracking-widest">
                Scanning Running
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, className, loading }: any) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-center justify-between pb-2">
          <p className="text-sm text-muted-foreground uppercase">{title}</p>
          <Icon className={`h-4 w-4 ${className || "text-muted-foreground"}`} />
        </div>

        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className={`text-3xl font-bold ${className || ""}`}>
            {value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "present") {
    return <Badge className="bg-green-500/10 text-green-400 text-xs">Valid</Badge>;
  }
  if (status === "duplicate") {
    return <Badge className="bg-yellow-500/10 text-yellow-400 text-xs">Duplicate</Badge>;
  }
  return <Badge className="bg-red-500/10 text-red-400 text-xs">Invalid</Badge>;
}