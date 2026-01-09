import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function tc(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
