import { z } from "zod";

// No eval-based fast path: the desktop app runs under a strict Content-Security-Policy
// (no 'unsafe-eval'), and zod would otherwise probe `new Function` and log a CSP violation.
z.config({ jitless: true });
