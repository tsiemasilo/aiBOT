import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  image?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  image,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center" data-testid="empty-state">
      {image && (
        <img src={image} alt={title} className="w-48 h-48 mb-6 opacity-50" />
      )}
      {Icon && !image && (
        <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2" data-testid="text-empty-title">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md" data-testid="text-empty-description">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid="button-empty-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
