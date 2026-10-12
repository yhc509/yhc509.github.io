type ContactLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const githubIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const xIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const emailIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const links: ContactLink[] = [
  {
    href: "https://github.com/yhc509",
    label: "GitHub",
    icon: githubIcon,
  },
  {
    href: "https://x.com/yhkk_dev",
    label: "X (@yhkk_dev)",
    icon: xIcon,
  },
  {
    href: "mailto:yhc5091@gmail.com",
    label: "Email",
    icon: emailIcon,
  },
];

export function ContactLinks() {
  return (
    <div className="not-prose flex items-center gap-3 mt-6">
      <span className="text-base font-medium" style={{ color: "var(--foreground)" }}>
        Contact :
      </span>
      <ul className="flex items-center gap-2 list-none p-0 m-0">
        {links.map(({ href, label, icon }) => (
          <li key={label} className="m-0 p-0">
            <a
              href={href}
              aria-label={label}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ color: "var(--foreground)" }}
            >
              <span className="block h-5 w-5">{icon}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
