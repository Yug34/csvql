import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const copyTextToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
