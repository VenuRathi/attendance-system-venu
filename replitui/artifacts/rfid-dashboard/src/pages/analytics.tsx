import { useState, useMemo } from "react";
import { useGetAttendanceSummary, useGetLectureStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users, BookOpen } from "lucide-react";

const STUDENT_COLORS = [
  "#00e5ff", "#7c3aed", "#f59e0b", "#10b981",
  "#f43f5e", "#3b82f6", "#a78bfa", "#34d399",
];

const LECTURE_COLORS = [
  "#00FF66", "#00e5ff", "#7c3aed", "#f59e0b",
  "#f43f5e", "#3b82f6", "#a78bfa", "#ff6b6b",
];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: "hsl(222 47% 11%)", borderColor: "hsl(217 33% 20%)", borderRadius: "8px" },
  itemStyle: { color: "#e2e8f0" },
  labelStyle: { color: "#94a3b8", fontFamily: "monospace" },
};

export default function Analytics() {
  const { data: summary, isLoading: summaryLoading } = useGetAttendanceSummary();
  const { data: stats, isLoading: statsLoading } = useGetLectureStats();
  const [searchQuery, setSearchQuery] = useState("");

  const studentPieData = useMemo(() => {
    if (!summary) return [];
    return summary
      .filter((s) => s.presentCount > 0)
      .sort((a, b) => b.presentCount - a.presentCount)
      .slice(0, 8)
      .map((s) => ({ name: s.name.split(" ")[0], value: s.presentCount }));
  }, [summary]);

  const lecturePieData = useMemo(() => {
    if (!stats) return [];
    return stats
      .filter((s) => s.presentCount > 0)
      .map((s) => ({ name: `L${s.lectureNumber}`, value: s.presentCount }));
  }, [stats]);

  const filteredStudents = useMemo(() => {
    if (!summary) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return summary;
    return summary.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.uid.toLowerCase().includes(q)
    );
  }, [summary, searchQuery]);

  const searchedStudent = filteredStudents.length === 1 ? filteredStudents[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono uppercase">
          System Analytics
        </h1>
        <p className="text-muted-foreground">Detailed breakdown of attendance patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <CardTitle className="font-mono uppercase text-sm">Student Attendance Share</CardTitle>
              <CardDescription>Who has the most present scans</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : studentPieData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground font-mono text-sm">
                No data yet
              </div>
            ) : (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {studentPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={STUDENT_COLORS[index % STUDENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip {...TOOLTIP_STYLE} formatter={(value) => [`${value} scans`, "Present"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
                  {studentPieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: STUDENT_COLORS[index % STUDENT_COLORS.length] }} />
                      <span className="text-xs font-mono text-muted-foreground">{entry.name}</span>
                      <span className="text-xs font-mono text-foreground font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <div>
              <CardTitle className="font-mono uppercase text-sm">Lecture Attendance Share</CardTitle>
              <CardDescription>Which lecture had the most attendance</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : lecturePieData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground font-mono text-sm">
                No data yet
              </div>
            ) : (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={lecturePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {lecturePieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={LECTURE_COLORS[index % LECTURE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip {...TOOLTIP_STYLE} formatter={(value) => [`${value} present`, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
                  {lecturePieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: LECTURE_COLORS[index % LECTURE_COLORS.length] }} />
                      <span className="text-xs font-mono text-muted-foreground">{entry.name}</span>
                      <span className="text-xs font-mono text-foreground font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="font-mono uppercase text-sm flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Student Lookup
          </CardTitle>
          <CardDescription>Search by name or UID to view individual attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 font-mono bg-muted/30 border-border/50 focus:border-primary/50"
              placeholder="Search by name or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-student-search"
            />
          </div>

          {searchQuery && searchedStudent && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{searchedStudent.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{searchedStudent.uid}</p>
                </div>
                <Badge variant="outline" className="font-mono border-primary/40 text-primary">
                  {searchedStudent.totalScans} total scans
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-[#00FF66]/10 border border-[#00FF66]/20 p-3 text-center">
                  <p className="text-2xl font-bold font-mono text-[#00FF66]">{searchedStudent.presentCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Present</p>
                </div>
                <div className="rounded-md bg-[#FFCC00]/10 border border-[#FFCC00]/20 p-3 text-center">
                  <p className="text-2xl font-bold font-mono text-[#FFCC00]">{searchedStudent.duplicateCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Duplicate</p>
                </div>
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-center">
                  <p className="text-2xl font-bold font-mono text-destructive">{searchedStudent.invalidCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Invalid</p>
                </div>
              </div>
            </div>
          )}

          {summaryLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="rounded-md border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="font-mono">Student Name</TableHead>
                    <TableHead className="font-mono">UID</TableHead>
                    <TableHead className="font-mono text-center">Total</TableHead>
                    <TableHead className="font-mono text-center">Present</TableHead>
                    <TableHead className="font-mono text-center">Duplicate</TableHead>
                    <TableHead className="font-mono text-center">Invalid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.uid}
                      className="border-border/50 hover:bg-white/5"
                      data-testid={`row-student-${student.uid}`}
                    >
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="font-mono text-muted-foreground text-xs">{student.uid}</TableCell>
                      <TableCell className="text-center font-mono">{student.totalScans}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-[#00FF66]/50 text-[#00FF66] bg-[#00FF66]/10">
                          {student.presentCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-[#FFCC00]/50 text-[#FFCC00] bg-[#FFCC00]/10">
                          {student.duplicateCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/10">
                          {student.invalidCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-mono">
                        {searchQuery ? `No student found matching "${searchQuery}"` : "No data available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
