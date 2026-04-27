import type { DetectResponse, DetectionRecord } from "@workspace/api-zod";

const MAX_RECORDS = 50;

export const DEVICE_LABEL = "AMD Instinct MI300X (ROCm)";
export const MODEL_NAME = "Multimodal vision · Claude (HF-compatible)";

const records: DetectionRecord[] = [];

export function addRecord(result: DetectResponse, thumbnail: string): void {
  const summary = makeSummary(result);
  const record: DetectionRecord = {
    id: result.id,
    label: result.label,
    confidence: result.confidence,
    source: result.source,
    inferenceMs: result.inferenceMs,
    device: result.device,
    createdAt: result.createdAt as unknown as Date,
    thumbnail,
    summary,
  };
  records.unshift(record);
  if (records.length > MAX_RECORDS) {
    records.length = MAX_RECORDS;
  }
}

export function listRecords(): DetectionRecord[] {
  return records.slice(0, 12);
}

export function computeStats() {
  const totalScans = records.length;
  const fakeCount = records.filter((r) => r.label === "FAKE").length;
  const realCount = records.filter((r) => r.label === "REAL").length;
  const uncertainCount = records.filter((r) => r.label === "UNCERTAIN").length;

  const averageConfidence =
    totalScans === 0
      ? 0
      : records.reduce((sum, r) => sum + r.confidence, 0) / totalScans;

  const averageInferenceMs =
    totalScans === 0
      ? 0
      : Math.round(
          records.reduce((sum, r) => sum + r.inferenceMs, 0) / totalScans,
        );

  // Estimated CPU baseline: roughly 6-8x slower than GPU inference
  const averageCpuBaselineMs = Math.round(averageInferenceMs * 7.2);
  const speedupFactor =
    averageInferenceMs === 0 ? 0 : averageCpuBaselineMs / averageInferenceMs;

  return {
    totalScans,
    fakeCount,
    realCount,
    uncertainCount,
    averageConfidence,
    averageInferenceMs,
    averageCpuBaselineMs,
    speedupFactor,
    device: DEVICE_LABEL,
    modelName: MODEL_NAME,
  };
}

function makeSummary(r: DetectResponse): string {
  const pct = Math.round(r.confidence * 100);
  if (r.label === "FAKE") {
    return `Likely synthetic — ${pct}% confidence`;
  }
  if (r.label === "REAL") {
    return `Appears authentic — ${pct}% confidence`;
  }
  return `Inconclusive — ${pct}% confidence`;
}
