"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page exists to prevent /projects/new from matching [projectId]
// and causing a client-side crash. It redirects to the projects list
// with the new-project modal open.
export default function NewProjectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/projects?new=1");
  }, [router]);
  return null;
}
