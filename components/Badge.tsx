interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success';
}

export default function Badge({ label, variant = 'primary' }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    secondary: 'bg-gray-200 text-gray-800',
    success: 'bg-green-100 text-green-800',
  };

  return <span className={`${baseStyles} ${variantStyles[variant]}`}>{label}</span>;
}
