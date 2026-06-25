import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Timestamp | undefined): string {
  if (!date) return "—";
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Timestamp | undefined): string {
  if (!date) return "—";
  return date.toDate().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateId(prefix: string): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `${prefix}${num}`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Working: "green",
    Available: "green",
    Resolved: "green",
    Closed: "gray",
    Faulty: "red",
    Disposed: "red",
    Open: "yellow",
    "Under Maintenance": "orange",
    "Under Repair": "orange",
    Assigned: "blue",
    "In Progress": "blue",
    "Pending Parts": "purple",
  };
  return map[status] || "gray";
}
