import type { ContentOutput } from "@/hooks/useProjects";

export type ContentGeneration = {
  generation_id: string;
  project_id: string | null;
  created_at: string | null;
  analysis_score: number | null;
  original_input: string | null;
  input_type: string | null;
  outputs: ContentOutput[];
  platforms: string[];
  representative: ContentOutput;
};

const PLATFORM_PREFERENCE = ["linkedin", "twitter", "x", "instagram", "threads", "reddit", "youtube"] as const;

const normalizePlatform = (p: string | null | undefined) => (p || "").trim().toLowerCase();

const comparePlatform = (a: ContentOutput, b: ContentOutput) => {
  const pa = normalizePlatform(a.platform);
  const pb = normalizePlatform(b.platform);

  const ia = PLATFORM_PREFERENCE.indexOf(pa as (typeof PLATFORM_PREFERENCE)[number]);
  const ib = PLATFORM_PREFERENCE.indexOf(pb as (typeof PLATFORM_PREFERENCE)[number]);

  if (ia !== -1 || ib !== -1) {
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  }

  return pa.localeCompare(pb);
};

const pickRepresentative = (outputs: ContentOutput[]) => {
  const sorted = [...outputs].sort(comparePlatform);
  return sorted[0] ?? outputs[0]!;
};

export const groupContentOutputs = (contents: ContentOutput[]): ContentGeneration[] => {
  const byGen = new Map<string, ContentOutput[]>();

  for (const c of contents) {
    const gid = c.generation_id || c.id;
    const bucket = byGen.get(gid);
    if (bucket) bucket.push(c);
    else byGen.set(gid, [c]);
  }

  const generations: ContentGeneration[] = [];

  for (const [generation_id, outputs] of byGen.entries()) {
    const platforms = Array.from(
      new Set(outputs.map((o) => normalizePlatform(o.platform)).filter((p) => p.length > 0)),
    );

    const created_at = outputs
      .map((o) => o.created_at)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0] ?? null;

    const analysis_score =
      outputs
        .map((o) => o.analysis_score)
        .filter((s): s is number => typeof s === "number")
        .sort((a, b) => b - a)[0] ?? null;

    const original_input = outputs.find((o) => o.original_input)?.original_input ?? null;
    const input_type = outputs.find((o) => o.input_type)?.input_type ?? null;
    const project_id = outputs.find((o) => o.project_id)?.project_id ?? null;

    generations.push({
      generation_id,
      project_id,
      created_at,
      analysis_score,
      original_input,
      input_type,
      outputs: [...outputs].sort(comparePlatform),
      platforms,
      representative: pickRepresentative(outputs),
    });
  }

  generations.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  return generations;
};

export const findGenerationIdForOutputId = (contents: ContentOutput[], outputId: string | null | undefined) => {
  if (!outputId) return null;
  const match = contents.find((c) => c.id === outputId);
  return match?.generation_id || null;
};
