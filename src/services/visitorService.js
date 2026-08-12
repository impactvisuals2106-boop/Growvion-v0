import { supabase } from "../lib/supabase";

export async function createVisitor() {
  // Gracefully handle case if Supabase client is not initialized/configured
  if (!supabase) {
    console.warn("[Growvex visitorService]: Supabase client unavailable. Skipping visitor registration.");
    return;
  }

  // Retrieve or establish unique visitor identification signature in LocalStorage
  let visitorHash = localStorage.getItem("gv_vid");
  if (!visitorHash) {
    visitorHash = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    localStorage.setItem("gv_vid", visitorHash);
  }

  const ua = navigator.userAgent;
  const deviceType = /Mobile|Android|iP(hone|od|ad)/i.test(ua) ? "mobile" : "desktop";
  const browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Safari") ? "Safari" : ua.includes("Firefox") ? "Firefox" : "Other";

  // Insert visitor matching the table columns created in supabase_setup_v2.sql
  const { data, error } = await supabase
    .from("visitors")
    .insert([
      {
        visitor_hash: visitorHash,
        device_type: deviceType,
        browser: browser,
        os: navigator.platform || "",
        language: navigator.language || "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      },
    ])
    .select();

  if (error) {
    console.error("[visitorService Error]:", error);
  } else {
    console.log("Visitor Created");
    console.log(data);
  }
}
