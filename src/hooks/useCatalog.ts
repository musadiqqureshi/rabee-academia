"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { courses, subjectToCourse, sortCatalog, type Course } from "@/lib/courses";

// Loads the public course catalog from the live `subjects` table (admins manage
// it in the portal) and merges in the static visual metadata. Starts from the
// static catalog so the first paint is never blank, then swaps to DB rows. If
// the table is empty/unreachable it simply keeps the static catalog.
export function useCatalog(): { catalog: Course[]; loading: boolean } {
  const [catalog, setCatalog] = useState<Course[]>(courses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("subjects")
      .select("slug, name, level, regular_price, weekend_price, lessons, description, is_active")
      .eq("is_active", true)
      .then(
        ({ data }) => {
          if (!active) return;
          if (data && data.length) setCatalog(sortCatalog(data.map(subjectToCourse)));
          setLoading(false);
        },
        () => active && setLoading(false),
      );
    return () => {
      active = false;
    };
  }, []);

  return { catalog, loading };
}
