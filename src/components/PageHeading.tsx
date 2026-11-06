import type { ReactNode } from "react";

type PageHeadingProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeading({
  title,
  description,
  children,
}: PageHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.15rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
