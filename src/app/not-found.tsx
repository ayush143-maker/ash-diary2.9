import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
        <div className="bg-ember absolute inset-0 rounded-full opacity-[0.08] blur-xl" />
        <div className="border-line bg-surface relative flex h-16 w-16 items-center justify-center rounded-full border">
          <span className="bg-ember h-2.5 w-2.5 rounded-full" />
        </div>
      </div>

      <h1 className="font-display text-ink text-2xl font-medium">
        This page drifted away.
      </h1>
      <p className="text-ink-2 mt-2 max-w-[260px] text-sm leading-relaxed">
        Like ash in the wind — but your memories are safe at home.
      </p>

      <Link
        href="/"
        className="press bg-ember text-on-ember mt-8 inline-flex h-12 items-center justify-center rounded-control px-6 text-sm font-semibold"
      >
        Return home
      </Link>
    </div>
  );
}
