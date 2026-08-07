"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteLeadButtonProps = {
  leadId: string;
  leadName: string;
};

export default function DeleteLeadButton({
  leadId,
  leadName,
}: DeleteLeadButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const deleteLead = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.error || "Lead could not be deleted."
        );
      }

      router.push("/dashboard?deleted=true");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Lead could not be deleted."
      );

      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setIsOpen(true);
        }}
        className="inline-flex rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-300/60 hover:bg-red-400/20"
      >
        Delete Lead
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1728] p-6 shadow-2xl shadow-black/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-xl">
              ⚠️
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white">
              Delete lead?
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-white">
                {leadName || "this lead"}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-red-300">
              This action cannot be undone.
            </p>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-semibold text-slate-200 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={deleteLead}
                className="rounded-xl bg-red-500 px-4 py-2.5 font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}