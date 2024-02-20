import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const copyTextToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
}

export const roundNumber = (num: number) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
  // return num.toFixed(2);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}