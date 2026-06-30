"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { updateAvatar } from "../../../app/dashboard/profile-actions";

// Avatar with click-to-upload. Shows the saved photo or the user's initial.
export default function AvatarUpload({ avatarUrl, initial }: { avatarUrl?: string | null; initial: string }) {
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.set("avatar", file);
    startTransition(async () => {
      const res = await updateAvatar(fd);
      if (!res.ok) setError(res.error ?? "Upload failed.");
      else { if (res.url) setPreview(res.url); router.refresh(); }
    });
  }

  return (
    <div className="shrink-0">
      <button type="button" onClick={() => inputRef.current?.click()}
        className="relative group w-16 h-16 rounded-2xl overflow-hidden grid place-items-center bg-gradient-to-br from-primary to-accent text-white text-2xl font-extrabold"
        aria-label="Change profile photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : initial}
        <span className="absolute inset-0 bg-black/45 grid place-items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      {error && <p className="text-[11px] text-destructive mt-1 max-w-[120px]">{error}</p>}
    </div>
  );
}
