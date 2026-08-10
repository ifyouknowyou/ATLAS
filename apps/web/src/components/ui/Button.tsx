import { cn } from '@/lib/cn';

type Variant = 'default' | 'primary' | 'danger';

const variants: Record<Variant, string> = {
  default: 'tech-button',
  primary: 'tech-button-primary',
  danger: 'tech-button-danger',
};

export function Button({
  variant = 'default',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
}) {
  return (
    <button
      className={cn(variants[variant], className)}
      {...props}
    />
  );
}