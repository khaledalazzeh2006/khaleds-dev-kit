import { toast } from "sonner";

/** Copy text and show the standard "Copied" toast. Returns false if the clipboard refused. */
export async function copyText(text: string, label = "Copied"): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label, { duration: 1500 });
    return true;
  } catch {
    toast.error("Couldn't access the clipboard", { duration: 3000 });
    return false;
  }
}
