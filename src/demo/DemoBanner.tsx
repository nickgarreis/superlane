/**
 * Floating banner shown in demo mode to indicate this is a demo instance.
 * Includes a reset button to reload and clear all in-memory changes.
 */
import { useState } from "react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 20px",
        borderRadius: 12,
        background: "rgba(99, 102, 241, 0.95)",
        backdropFilter: "blur(8px)",
        color: "#fff",
        fontSize: 13,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 500,
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        lineHeight: 1,
      }}
    >
      <span style={{ opacity: 0.9 }}>
        🎯 Demo Mode — changes reset on reload
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          padding: "5px 12px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.15)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
        }}
      >
        Reset
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        style={{
          padding: "2px 6px",
          border: "none",
          background: "transparent",
          color: "rgba(255,255,255,0.6)",
          fontSize: 16,
          cursor: "pointer",
          lineHeight: 1,
        }}
        aria-label="Dismiss banner"
      >
        ×
      </button>
    </div>
  );
}
