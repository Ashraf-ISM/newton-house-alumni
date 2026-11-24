"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { toast } from "./toaster";

function Inner({ message }: { message: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (sp.get("saved")) {
      toast(true, message);
      router.replace(pathname, { scroll: false });
    }
  }, [sp, message, router, pathname]);
  return null;
}

/** Shows a confirmation toast after a redirecting save (?saved=1). */
export function SavedToast({ message }: { message: string }) {
  return (
    <Suspense fallback={null}>
      <Inner message={message} />
    </Suspense>
  );
}
