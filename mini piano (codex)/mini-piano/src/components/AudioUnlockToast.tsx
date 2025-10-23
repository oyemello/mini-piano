"use client";
import * as React from "react";
import * as Tone from "tone";
import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export function AudioUnlockToast() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (Tone.getContext().state !== "running") setOpen(true);
  }, []);

  async function unlock() {
    await Tone.start();
    setOpen(false);
  }

  if (!open) return null;
  return (
    <Toast open={open} onOpenChange={setOpen}>
      <ToastTitle>Enable Audio</ToastTitle>
      <ToastDescription>
        Your browser requires a user gesture to start audio.
        <div className="mt-2"><Button onClick={unlock}>Unlock</Button></div>
      </ToastDescription>
    </Toast>
  );
}

