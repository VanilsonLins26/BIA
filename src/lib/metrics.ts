import { supabase } from "@/integrations/supabase/client";

export interface Metrics {
  pageViews: number;
  chatStarted: number;
  chatInteractions: number;
  installClicks: number;
  npsPositive: number;
  npsNegative: number;
  profile_created: number;
  profile_skipped: number;
  avatar_selected: number;
}

export async function trackEvent(event: keyof Metrics) {
  try {
    await supabase.rpc("increment_metric", { metric_name: event });
  } catch (e) {
    console.error("Failed to track event:", e);
  }
}

export async function readMetrics(): Promise<Metrics> {
  const defaults: Metrics = {
    pageViews: 0,
    chatStarted: 0,
    chatInteractions: 0,
    installClicks: 0,
    npsPositive: 0,
    npsNegative: 0,
    profile_created: 0,
    profile_skipped: 0,
    avatar_selected: 0,
  };

  try {
    const { data, error } = await supabase
      .from("metrics")
      .select("event_name, count");

    if (error || !data) return defaults;

    const result = { ...defaults };
    for (const row of data) {
      if (row.event_name in result) {
        result[row.event_name as keyof Metrics] = row.count;
      }
    }
    return result;
  } catch {
    return defaults;
  }
}
