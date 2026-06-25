import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "red" | "yellow" | "blue" | "orange" | "purple" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, BadgeVariant> = {
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
  return <Badge variant={colorMap[status] || "gray"}>{status}</Badge>;
}
