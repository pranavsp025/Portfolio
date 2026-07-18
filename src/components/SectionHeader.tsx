interface SectionHeaderProps {
  num: string;
  title: string;
}

export function SectionHeader({ num, title }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-xs text-primary">{num}</span>
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      <div className="ml-4 h-px flex-1 bg-border" />
    </div>
  );
}
