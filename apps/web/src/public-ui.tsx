import React from "react";

const iconPaths = {
  book: "M3 4.5h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H3zM21 4.5h-6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h6z",
  teach: "M3 4h18v12H3zM8 20h8m-4-4v4M7 12l3-3 2 2 4-4",
  research: "M9 3h6m-5 0v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8",
  work: "M3 8h18v12H3zM8 8V5h8v3m-13 5h18m-10 0v2h2v-2",
  calendar: "M4 6h16v15H4zM8 3v6m8-6v6M4 11h16m-11 4h1m4 0h1m-6 3h1",
  agenda: "M9 6h11M9 12h11M9 18h11M4 6h1m-1 6h1m-1 6h1",
  previous: "m15 6-6 6 6 6",
  next: "m9 6 6 6-6 6",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "m6 6 12 12M18 6 6 18",
  check: "m4 12 5 5L20 6",
  tools: "M12 3v18M3 12h18M6 6l12 12M18 6 6 18",
  people: "M3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m6 0v-2a4 4 0 0 0-3-4M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 0a4 4 0 0 0 0-8"
};

export function Icon({ name }: { name: keyof typeof iconPaths }) {
  return <svg className="ui-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>;
}

export function PhotoHero({ className, image, mobile, children, id, lazy = false }: {
  className: string; image: string; mobile?: string; children: React.ReactNode; id?: string; lazy?: boolean;
}) {
  return <header className={`photo-hero ${className}`} aria-labelledby={id}>
    <picture>
      {mobile && <source media="(max-width: 640px)" srcSet={mobile} />}
      <img src={image} alt="" loading={lazy ? "lazy" : "eager"} />
    </picture>
    <div className="shell photo-copy">{children}</div>
  </header>;
}
