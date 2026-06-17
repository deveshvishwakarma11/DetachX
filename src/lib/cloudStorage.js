import { supabase } from "./supabase";

// ── Unsub History ─────────────────────────────────────────────────────────────

export async function loadUnsubHistory(userEmail) {
  const { data, error } = await supabase
    .from("unsub_history")
    .select("*")
    .eq("user_email", userEmail)
    .order("action_at", { ascending: false });

  if (error) {
    console.error("[DetachX] loadUnsubHistory error:", error.message);
    return [];
  }

  return data.map((row) => ({
    domain:             row.domain,
    from:               row.from_addr,
    email:              row.email,
    subject:            row.subject || "",
    unsubUrl:           row.unsub_url || "",
    action:             row.action,
    verificationStatus: row.verification_status || "pending",
    needsVerification:  row.needs_verification  || false,
    stillReceiving:     row.still_receiving     || false,
    // ✅ action_at use karo — actual user action time
    at: row.action_at || row.created_at,
  }));
}

export async function saveUnsubEntry(userEmail, entry) {
  const { error } = await supabase
    .from("unsub_history")
    .upsert(
      {
        user_email:          userEmail,
        domain:              entry.domain,
        from_addr:           entry.from,
        email:               entry.email,
        subject:             entry.subject            || "",
        unsub_url:           entry.unsubUrl           || "",
        action:              entry.action             || "unsubscribed",
        verification_status: entry.verificationStatus || "pending",
        needs_verification:  entry.needsVerification  || false,
        still_receiving:     entry.stillReceiving     || false,
        // ✅ entry.at explicitly save karo — user action ka actual time
        action_at:           entry.at                 || new Date().toISOString(),
        updated_at:          new Date().toISOString(),
      },
      { onConflict: "user_email,domain" }
    );

  if (error) {
    console.error("[DetachX] saveUnsubEntry error:", error.message);
    return false;
  }
  console.log("[DetachX] saveUnsubEntry → saved:", entry.domain, "action_at:", entry.at);
  return true;
}

export async function updateUnsubVerification(
  userEmail, domain, verificationStatus, stillReceiving
) {
  const { error } = await supabase
    .from("unsub_history")
    .update({
      verification_status: verificationStatus,
      still_receiving:     stillReceiving,
      updated_at:          new Date().toISOString(),
    })
    .eq("user_email", userEmail)
    .eq("domain", domain);

  if (error) {
    console.error("[DetachX] updateUnsubVerification error:", error.message);
    return false;
  }
  console.log("[DetachX] updateUnsubVerification →", domain, verificationStatus);
  return true;
}

// ── Block History ─────────────────────────────────────────────────────────────

export async function loadBlockHistory(userEmail) {
  const { data, error } = await supabase
    .from("block_history")
    .select("*")
    .eq("user_email", userEmail)
    .order("action_at", { ascending: false });

  if (error) {
    console.error("[DetachX] loadBlockHistory error:", error.message);
    return [];
  }

  return data.map((row) => ({
    domain:      row.domain,
    from:        row.from_addr,
    email:       row.email,
    subject:     row.subject      || "",
    action:      row.action,
    filterId:    row.filter_id,
    filterEmail: row.filter_email,
    // ✅ action_at use karo
    at: row.action_at || row.created_at,
  }));
}

export async function saveBlockEntry(userEmail, entry) {
  const { error } = await supabase
    .from("block_history")
    .upsert(
      {
        user_email:   userEmail,
        domain:       entry.domain,
        from_addr:    entry.from,
        email:        entry.email,
        subject:      entry.subject      || "",
        action:       "blocked",
        filter_id:    entry.filterId,
        filter_email: entry.filterEmail,
        // ✅ entry.at explicitly save karo
        action_at:    entry.at           || new Date().toISOString(),
      },
      { onConflict: "user_email,domain" }
    );

  if (error) {
    console.error("[DetachX] saveBlockEntry error:", error.message);
    return false;
  }
  console.log("[DetachX] saveBlockEntry → saved:", entry.domain, "action_at:", entry.at);
  return true;
}

// ── Migration: localStorage → Supabase ───────────────────────────────────────
export async function migrateFromLocalStorage(userEmail) {
  let migrated = false;

  // Migrate unsub history
  try {
    const localUnsub = JSON.parse(
      localStorage.getItem("detachx_unsub_history") || "[]"
    );
    if (localUnsub.length > 0) {
      console.log(`[DetachX] migrate: uploading ${localUnsub.length} unsub entries`);
      for (const entry of localUnsub) {
        // ✅ entry.at preserved correctly during migration
        await saveUnsubEntry(userEmail, entry);
      }
      migrated = true;
    }
  } catch (e) {
    console.error("[DetachX] migrate unsub error:", e);
  }

  // Migrate block history
  try {
    const localBlock = JSON.parse(
      localStorage.getItem("detachx_block_history") || "[]"
    );
    const validBlock = localBlock.filter(
      (e) => e.filterId && typeof e.filterId === "string" && e.filterId.length > 0
    );
    if (validBlock.length > 0) {
      console.log(`[DetachX] migrate: uploading ${validBlock.length} block entries`);
      for (const entry of validBlock) {
        // ✅ entry.at preserved correctly during migration
        await saveBlockEntry(userEmail, entry);
      }
      migrated = true;
    }
  } catch (e) {
    console.error("[DetachX] migrate block error:", e);
  }

  if (migrated) {
    localStorage.setItem("detachx_migrated", "true");
    console.log("[DetachX] migration complete — action_at preserved");
  }
}