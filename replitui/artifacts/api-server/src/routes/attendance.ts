import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, attendanceTable, lectureStateTable } from "@workspace/db";
import {
  CreateAttendanceBody,
  GetAttendanceQueryParams,
  StartLectureBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrInitLectureState() {
  const [state] = await db.select().from(lectureStateTable).limit(1);
  if (!state) {
    const [created] = await db
      .insert(lectureStateTable)
      .values({ lectureNumber: null, isActive: "false", startedAt: null })
      .returning();
    return created;
  }
  return state;
}

router.get("/attendance", async (req, res): Promise<void> => {
  const queryParams = GetAttendanceQueryParams.safeParse(req.query);
  const lectureNumber = queryParams.success
    ? queryParams.data.lectureNumber
    : undefined;

  let records;
  if (lectureNumber !== undefined && lectureNumber !== null) {
    records = await db
      .select()
      .from(attendanceTable)
      .where(eq(attendanceTable.lectureNumber, lectureNumber))
      .orderBy(desc(attendanceTable.timestamp));
  } else {
    records = await db
      .select()
      .from(attendanceTable)
      .orderBy(desc(attendanceTable.timestamp));
  }

  res.json(
    records.map((r) => ({
      ...r,
      timestamp: r.timestamp.toISOString(),
    }))
  );
});

router.post("/attendance", async (req, res): Promise<void> => {
  const parsed = CreateAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, uid, lectureNumber } = parsed.data;

  const existing = await db
    .select()
    .from(attendanceTable)
    .where(
      sql`${attendanceTable.uid} = ${uid} AND ${attendanceTable.lectureNumber} = ${lectureNumber}`
    )
    .limit(1);

  let status: "present" | "duplicate" | "invalid" = "present";
  if (existing.length > 0) {
    status = "duplicate";
  }

  if (!uid || uid.trim() === "") {
    status = "invalid";
  }

  const [record] = await db
    .insert(attendanceTable)
    .values({ name, uid, status, lectureNumber })
    .returning();

  res.status(201).json({
    ...record,
    timestamp: record.timestamp.toISOString(),
  });
});

router.get("/attendance/summary", async (_req, res): Promise<void> => {
  const records = await db.select().from(attendanceTable);

  const studentMap = new Map<
    string,
    {
      name: string;
      uid: string;
      totalScans: number;
      presentCount: number;
      duplicateCount: number;
      invalidCount: number;
    }
  >();

  for (const r of records) {
    const key = r.uid;
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        name: r.name,
        uid: r.uid,
        totalScans: 0,
        presentCount: 0,
        duplicateCount: 0,
        invalidCount: 0,
      });
    }
    const entry = studentMap.get(key)!;
    entry.totalScans++;
    if (r.status === "present") entry.presentCount++;
    else if (r.status === "duplicate") entry.duplicateCount++;
    else if (r.status === "invalid") entry.invalidCount++;
  }

  res.json(Array.from(studentMap.values()));
});

router.get("/attendance/lecture-stats", async (_req, res): Promise<void> => {
  const records = await db.select().from(attendanceTable);

  const lectureMap = new Map<
    number,
    {
      lectureNumber: number;
      totalScans: number;
      presentCount: number;
      duplicateCount: number;
      invalidCount: number;
    }
  >();

  for (let i = 1; i <= 8; i++) {
    lectureMap.set(i, {
      lectureNumber: i,
      totalScans: 0,
      presentCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
    });
  }

  for (const r of records) {
    const entry = lectureMap.get(r.lectureNumber);
    if (entry) {
      entry.totalScans++;
      if (r.status === "present") entry.presentCount++;
      else if (r.status === "duplicate") entry.duplicateCount++;
      else if (r.status === "invalid") entry.invalidCount++;
    }
  }

  res.json(Array.from(lectureMap.values()));
});

router.get("/lectures/active", async (_req, res): Promise<void> => {
  const state = await getOrInitLectureState();
  res.json({
    lectureNumber: state.lectureNumber,
    isActive: state.isActive === "true",
    startedAt: state.startedAt ? state.startedAt.toISOString() : null,
  });
});

router.post("/lectures/start", async (req, res): Promise<void> => {
  const parsed = StartLectureBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lectureNumber } = parsed.data;

  if (lectureNumber < 1 || lectureNumber > 8) {
    res.status(400).json({ error: "Lecture number must be between 1 and 8" });
    return;
  }

  const state = await getOrInitLectureState();

  const [updated] = await db
    .update(lectureStateTable)
    .set({ lectureNumber, isActive: "true", startedAt: new Date() })
    .where(eq(lectureStateTable.id, state.id))
    .returning();

  res.json({
    lectureNumber: updated.lectureNumber,
    isActive: updated.isActive === "true",
    startedAt: updated.startedAt ? updated.startedAt.toISOString() : null,
  });
});

router.post("/lectures/end", async (req, res): Promise<void> => {
  const state = await getOrInitLectureState();

  if (state.isActive !== "true") {
    res.status(400).json({ error: "No active lecture" });
    return;
  }

  const [updated] = await db
    .update(lectureStateTable)
    .set({ isActive: "false" })
    .where(eq(lectureStateTable.id, state.id))
    .returning();

  res.json({
    lectureNumber: updated.lectureNumber,
    isActive: updated.isActive === "true",
    startedAt: updated.startedAt ? updated.startedAt.toISOString() : null,
  });
});

router.post("/reset", async (_req, res): Promise<void> => {
  await db.delete(attendanceTable);
  const state = await getOrInitLectureState();
  await db
    .update(lectureStateTable)
    .set({ lectureNumber: null, isActive: "false", startedAt: null })
    .where(eq(lectureStateTable.id, state.id));

  res.json({ success: true, message: "System reset successfully" });
});

export default router;
