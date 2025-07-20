export function Logo({className}: {className?: string}) {
  return (
    <div className="flex items-center gap-2" aria-label="Nomaryth Home">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M4 18 L12 3 L20 18" />
        <path d="M7 12.5 C 8.5 14, 15.5 14, 17 12.5" />
        <path d="M7 12.5 C 8.5 11, 15.5 11, 17 12.5" />
        <circle cx="12" cy="12.5" r="1.5" />
        <path d="M12 15 V 22" />
        <path d="M9 18.5 H 15" />
      </svg>
    </div>
  );
}
