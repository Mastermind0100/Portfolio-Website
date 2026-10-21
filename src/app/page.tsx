"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type FormEvent,
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import ReactMarkdown from "react-markdown";
import {
  education,
  experience,
  profile,
  projects,
  publications,
  skillGroups,
} from "../../lib/portfolio-content";

type ChatMessage = { from: "user" | "assistant"; text: string };
type PortfolioProject = (typeof projects)[number];
type Theme = "light" | "dark";

const firstName = profile.name.split(" ")[0];
const assistantName = `Ask${firstName}`;

// Phosphor colours the knob cycles through.
const screenModes = [
  { name: "GRN", fg: "#9cf27f", bg: "#0e180f" },
  { name: "AMB", fg: "#ffb547", bg: "#1a120a" },
  { name: "ICE", fg: "#a6e6ff", bg: "#0a1419" },
] as const;

const yearOf = (text: string) => {
  const years = text.match(/(?:19|20)\d{2}/g);
  return years ? Number(years[years.length - 1]) : 0;
};

// Education shown oldest to newest, so the arrow reads as progression.
const educationPath = [...education]
  .sort((a, b) => yearOf(a.date) - yearOf(b.date))
  .map((item) => ({
    ...item,
    level: /^master/i.test(item.degree)
      ? "Postgraduate"
      : /^bachelor/i.test(item.degree)
        ? "Undergraduate"
        : "Degree",
    years: item.date.replace(/[A-Za-z]+\s+(\d{4})/g, "$1"),
  }));

// Newest first, with Atharva's own name picked out in the author list.
const publicationsByYear = publications
  .map((publication) => {
    const match = publication.authors.match(/Hudlikar,\s*A\.?/);
    return {
      title: publication.title,
      venue: publication.venue,
      doi: "doi" in publication ? publication.doi : undefined,
      url: "url" in publication ? publication.url : undefined,
      year: yearOf(publication.venue),
      authorsBefore: match ? publication.authors.slice(0, match.index) : publication.authors,
      authorsSelf: match ? match[0] : "",
      authorsAfter: match
        ? publication.authors.slice((match.index ?? 0) + match[0].length)
        : "",
    };
  })
  .sort((a, b) => b.year - a.year);

const meterLevels = [0.5, 0.8, 0.35, 0.9, 0.6, 1, 0.45, 0.75, 0.3, 0.85, 0.55, 0.95, 0.4, 0.7];

// Theme lives on <html data-theme>, set before paint by the script in layout.tsx.
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}
const readTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";
const readServerTheme = (): Theme => "dark";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatStreamRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [screenMode, setScreenMode] = useState(0);
  const [knobTurns, setKnobTurns] = useState(0);
  const [heroInView, setHeroInView] = useState(true);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, readServerTheme);

  useEffect(() => {
    if (!isResponding && messages.at(-1)?.from === "assistant") {
      chatInputRef.current?.focus();
    }
  }, [isResponding, messages]);

  useEffect(() => {
    if (messages.length === 0) return;
    chatStreamRef.current?.scrollTo({
      top: chatStreamRef.current.scrollHeight,
      behavior: "instant",
    });
  }, [messages, isResponding]);

  // Shows the "Back to chat" button once the assistant has scrolled out of view.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!project) return;
    const frame = requestAnimationFrame(() => setModalOpen(true));
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProject();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", escape);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", escape);
      document.body.style.overflow = "";
    };
  }, [project]);

  async function ask(question: string) {
    setMessages((current) => [...current, { from: "user", text: question }]);
    setIsResponding(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const result: { answer?: unknown; error?: unknown } = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Resume search is temporarily unavailable. Please try again."
        );
      }
      const answer = result.answer;
      if (typeof answer !== "string") {
        throw new Error("Resume search returned an invalid response.");
      }
      setMessages((current) => [
        ...current,
        { from: "assistant", text: answer },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Resume search failed. Please try again.",
        },
      ]);
    } finally {
      setIsResponding(false);
    }
  }

  function submitChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput("");
    void ask(question);
  }

  function askAbout(item: PortfolioProject) {
    if (isResponding) return;
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    void ask(`Tell me about the ${item.title} project.`);
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }

  function turnKnob() {
    setScreenMode((mode) => (mode + 1) % screenModes.length);
    setKnobTurns((turns) => turns + 1);
  }

  function openProject(item: PortfolioProject) {
    setProject(item);
    setModalOpen(false);
  }

  function closeProject() {
    setModalOpen(false);
    window.setTimeout(() => setProject(null), 250);
  }

  const mode = screenModes[screenMode];
  const screenStyle = {
    "--screen-fg": mode.fg,
    "--screen-bg": mode.bg,
  } as CSSProperties;

  return (
    <div className="site">
      {/* ---------- Hero: the AskAtharva unit ---------- */}
      <section className="hero" id="chat" ref={heroRef}>
        <div className="wrap">
          <header className="masthead">
            <div className="masthead-name">
              <strong>{profile.name}</strong>
              <span>Portfolio</span>
            </div>
            <a className="key key-sm" href="/resume.pdf" download="resume.pdf">
              <DownloadIcon />
              Download resume
            </a>
          </header>

          <h1 className="hero-title">
            Hi, I&apos;m {firstName}. <br/>Ask me anything about my work, or open
            the classic view.
          </h1>
          <p className="hero-sub">
            {profile.headline}, Based in {profile.location}.
          </p>

          <div className="unit">
            <div className="unit-plate">
              <div className="unit-brand">
                <Screw className="deco" />
                <span className="unit-name">{assistantName}</span>
                <span className="unit-model">Portfolio assistant</span>
                <span className="unit-badge">TALKS</span>
              </div>
              <div className="unit-controls">
                <div className="toggle-group">
                  <span className="toggle-text">Light</span>
                  <SunIcon />
                  <button
                    className="toggle"
                    type="button"
                    role="switch"
                    aria-checked={theme === "dark"}
                    aria-label="Dark theme"
                    onClick={toggleTheme}
                  >
                    <span className="toggle-thumb">
                      <i />
                      <i />
                      <i />
                    </span>
                  </button>
                  <span className="toggle-text">Dark</span>
                  <MoonIcon />
                </div>
                <a className="key key-sm" href="#about">
                  Classic view
                  <ArrowDownIcon />
                </a>
                <Screw className="deco" flip />
              </div>
            </div>

            <div className="unit-body">
              <div className="unit-main">
                <div className="bezel">
                  <div className="screen" style={screenStyle}>
                    <div className="screen-header" aria-hidden="true">
                      <span>
                        {assistantName.toUpperCase()}
                        <span className="screen-header-extra"> {"//"} PORTFOLIO OS</span>
                      </span>
                      <span>MODE {mode.name}</span>
                    </div>
                    <div
                      className="screen-log"
                      ref={chatStreamRef}
                      aria-live="polite"
                    >
                      {messages.length === 0 && (
                        <>
                          <div className="screen-msg assistant">
                            <span className="screen-tag">{"AI>"}</span>
                            <div className="screen-text">
                              <p>
                                Boot OK. I know everything on {firstName}&apos;s
                                resume: research, projects, experience,
                                education and publications. Ask me anything.
                              </p>
                            </div>
                          </div>
                          <p className="screen-hint">
                            No menus, no buttons. Just ask, e.g. &ldquo;What did{" "}
                            {firstName} build at Goalist?&rdquo;
                          </p>
                        </>
                      )}
                      {messages.map((message, index) => (
                        <div
                          className={`screen-msg ${message.from}`}
                          key={`${message.from}-${index}`}
                        >
                          <span className="screen-tag">
                            {message.from === "assistant" ? "AI>" : "<YOU"}
                          </span>
                          <div className="screen-text">
                            {message.from === "assistant" ? (
                              <ReactMarkdown>{message.text}</ReactMarkdown>
                            ) : (
                              <p>{message.text}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="screen-cursor-line">
                        {isResponding && (
                          <span role="status">{"AI> searching the resume "}</span>
                        )}
                        <span className="screen-cursor" aria-hidden="true">
                          █
                        </span>
                      </p>
                    </div>
                    <div className="screen-scanlines" aria-hidden="true" />
                  </div>
                </div>

                <form className="ask-row" id="ask-form" onSubmit={submitChat}>
                  <label htmlFor="chatinputbox">Ask</label>
                  <input
                    id="chatinputbox"
                    ref={chatInputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={`Anything about ${firstName}: research, projects, experience…`}
                    autoComplete="off"
                    disabled={isResponding}
                  />
                  <button
                    className="key key-accent send-inline"
                    type="submit"
                    aria-label="Send question"
                    disabled={isResponding || !input.trim()}
                  >
                    <SendIcon />
                  </button>
                </form>
              </div>

              <div className="unit-side">
                <div className="side-speaker deco">
                  <SpeakerGrille />
                  <div className="leds">
                    <span>
                      <i className="led led-on" />
                      PWR
                    </span>
                    <span>
                      <i className={`led ${isResponding ? "led-busy" : ""}`} />
                      BUSY
                    </span>
                  </div>
                </div>

                <div className="side-tuner">
                  <button
                    className="knob"
                    type="button"
                    onClick={turnKnob}
                    aria-label={`Change screen colour (now ${mode.name})`}
                    style={{ transform: `rotate(${knobTurns * 120}deg)` }}
                  >
                    <i />
                  </button>
                  <div className="tuner-readout">
                    <div className="tuner-label">
                      <strong>SCREEN</strong>
                      <span>{mode.name}</span>
                    </div>
                    <div
                      className={`meter${isResponding ? " is-busy" : ""}`}
                      aria-hidden="true"
                    >
                      {meterLevels.map((level, index) => (
                        <i
                          key={index}
                          style={
                            {
                              "--level": level,
                              "--delay": `${index * 0.05}s`,
                              "--speed": `${0.35 + level * 0.4}s`,
                              background: index > 10 ? "var(--accent)" : mode.fg,
                            } as CSSProperties
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="guide deco">
                  <strong>Operating guide</strong>
                  <span>1. Type any question about {firstName}</span>
                  <span>2. Press send or Enter</span>
                  <span>3. Turn the knob to retune the screen</span>
                  <span>4. Open the classic view to scroll</span>
                </div>

                <button
                  className="key key-accent send-side"
                  type="submit"
                  form="ask-form"
                  disabled={isResponding || !input.trim()}
                >
                  SEND
                  <ReturnIcon />
                </button>
              </div>
            </div>

            <div className="unit-footer">
              <span>Built by: {profile.name}</span>
              <span>{profile.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Classic portfolio ---------- */}
      <main>
        <section className="section section-alt" id="about">
          <div className="wrap about">
            <figure className="about-portrait">
              <Image
                src="/profile.jpg"
                alt={`${profile.name} portrait`}
                width={560}
                height={700}
                sizes="(max-width: 760px) calc(100vw - 48px), (max-width: 1100px) 34vw, 360px"
                quality={90}
                priority
              />
            </figure>
            <div className="about-content">
              <div className="about-main">
                <h2 className="section-kicker">About</h2>
                <p className="about-statement">
                  Hello There! I&apos;m {firstName}.
                </p>
                <p className="about-summary">I’m an AI engineer and researcher who loves building solutions. What started with robotics evolved into computer vision and eventually a deep dive into AI, spanning everything from gesture-controlled systems and robotics to LLMs, AI pipelines, and agentic architectures. Today, I’m focused on building intelligent systems that go beyond generating outputs — systems that reason, use tools, and turn ambitious ideas into real-world solutions. <br/><br/> 
                Outside of AI, I love travelling, gaming, and falling down rabbit holes ranging from obscure history to quantum mechanics. At my core, I’m a builder driven by curiosity and an appetite for the seemingly impossible. Give me a weird problem and ask, “Can you build this?” — I’ll figure it out.</p>
              </div>
              <aside className="about-card" aria-label="Profile links">
                <div className="about-links">
                  <a className="key key-sm" href={profile.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a className="key key-sm" href={profile.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                  <a className="key key-sm" href="/resume.pdf" download="resume.pdf">
                    <DownloadIcon />
                    Resume
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="section" id="projects">
          <div className="wrap">
            <SectionHeading
              title="Selected projects"
              note={`${projects.length} projects`}
            />
            <div className="project-grid">
              {projects.map((item, index) => {
                const tint = screenModes[index % screenModes.length];
                return (
                  <article className="project-card" key={item.id}>
                    <button
                      className="project-screen"
                      type="button"
                      onClick={() => openProject(item)}
                      aria-label={`Open details for ${item.title}`}
                      style={{ "--screen-fg": tint.fg, "--screen-bg": tint.bg } as CSSProperties}
                    >
                      <span className="project-category">{item.category}</span>
                      <span className="project-title">{item.title}</span>
                      <span className="project-open" aria-hidden="true">
                        Open details
                      </span>
                    </button>
                    <div className="project-body">
                      <span className="project-status">{item.status}</span>
                      <p>{item.description}</p>
                      <div className="rocker" role="group" aria-label={`${item.title} actions`}>
                        <button type="button" onClick={() => openProject(item)}>
                          <DetailsIcon />
                          Details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <a
              className="text-link"
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              More projects on GitHub
            </a>
          </div>
        </section>

        <section className="section section-alt" id="experience">
          <div className="wrap">
            <SectionHeading title="Work experience" large />
            <div className="xp">
              {experience.map((item, index) => {
                const [start, end] = item.date.split(/\s+[—–-]\s+/);
                const current = item.date.includes("Present");
                const className = [
                  "xp-row",
                  index === 0 && "is-first",
                  index === experience.length - 1 && "is-last",
                  current && "is-current",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <article className={className} key={`${item.company}-${item.role}`}>
                    <div className="xp-rail" aria-hidden="true">
                      <span className="xp-node" />
                    </div>
                    <div className="xp-when">
                      <span className="lcd">
                        {start ?? item.date}
                        {end && (
                          <>
                            <br />
                            {end}
                          </>
                        )}
                      </span>
                      {current && (
                        <span className="xp-now">
                          <i />
                          Current role
                        </span>
                      )}
                      <span className="xp-place">
                        <PinIcon />
                        {item.location}
                      </span>
                    </div>
                    <div className="xp-what">
                      <h3>{item.role}</h3>
                      <p className="xp-company">{item.company}</p>
                      <p className="xp-desc">{item.description}</p>
                      <div className="keycaps keycaps-sm">
                        {item.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <a className="key key-sm timeline-resume" href="/resume.pdf" download="resume.pdf">
              <DownloadIcon />
              Download full resume (PDF)
            </a>
          </div>
        </section>

        <section className="section" id="education">
          <div className="wrap">
            <SectionHeading title="Education" />
            <div className="edu-track">
              {educationPath.map((item, index) => (
                <Fragment key={item.institution}>
                  {index > 0 && (
                    <div className="edu-link" aria-hidden="true">
                      <span className="edu-link-line" />
                      <span className="edu-link-key">
                        <SendIcon />
                      </span>
                    </div>
                  )}
                  <article className="edu-slot">
                    <div className="edu-slot-top">
                      <span className="edu-level">{item.level}</span>
                      <span className="lcd lcd-sm">{item.years}</span>
                    </div>
                    <h3>{item.degree}</h3>
                    <p className="edu-school">{item.institution}</p>
                    <p className="edu-place">
                      <PinIcon />
                      {item.location}
                    </p>
                  </article>
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt" id="publications">
          <div className="wrap">
            <SectionHeading
              title="Publications"
              note={`${publications.length} papers`}
            />
            <div className="pub-list">
              {publicationsByYear.map((publication) => (
                <article className="pub-row" key={publication.title}>
                  <span className="pub-year">{publication.year || ""}</span>
                  <div className="pub-main">
                    <h3>{publication.title}</h3>
                    <p className="pub-authors">
                      {publication.authorsBefore}
                      {publication.authorsSelf && (
                        <strong className="pub-me">{publication.authorsSelf}</strong>
                      )}
                      {publication.authorsAfter}
                    </p>
                    <p className="pub-venue">{publication.venue}</p>
                  </div>
                  <div className="pub-actions">
                    {publication.doi && (
                      <a
                        className="key key-sm"
                        href={`https://doi.org/${publication.doi}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        DOI
                        <ExternalIcon />
                      </a>
                    )}
                    {publication.url && (
                      <a
                        className="key key-sm"
                        href={publication.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        arXiv
                        <ExternalIcon />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="skills">
          <div className="wrap">
            <SectionHeading title="Skills and tools" />
            <div className="skill-grid">
              {skillGroups.map((group) => (
                <article className="skill-group" key={group.title}>
                  <div className="skill-head">
                    <span className="skill-icon">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        {group.icon}
                      </span>
                    </span>
                    <h3>{group.title}</h3>
                    <span className="skill-count">{group.tags.length} skills</span>
                  </div>
                  <p>{group.description}</p>
                  <div className="keycaps keycaps-well">
                    {group.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="wrap">
            <div className="contact-panel">
              <div className="contact-copy">
                <span className="contact-prompt">
                  {`${assistantName.toUpperCase()}> READY WHEN YOU ARE`}
                  <span className="screen-cursor" aria-hidden="true">█</span>
                </span>
                <h2>Let&apos;s connect.</h2>
                <p>
                  Want to discuss AI research, engineering, or an opportunity?
                  Pick whichever way suits you.
                </p>
              </div>
              <div className="contact-actions">
                <a className="key key-accent" href={`mailto:${profile.email}`}>
                  Email me
                </a>
                <a className="contact-link" href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a className="contact-link" href={profile.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </div>
            </div>
            <footer className="site-footer">
              <span>© {profile.name}</span>
              <a href="#chat">Back to chat</a>
            </footer>
          </div>
        </section>
      </main>

      <a
        className={`key key-sm back-to-chat${heroInView ? "" : " is-visible"}`}
        href="#chat"
        aria-hidden={heroInView}
        tabIndex={heroInView ? -1 : 0}
      >
        <ArrowUpIcon />
        Back to chat
      </a>

      {project && (
        <div
          className={`modal-layer ${modalOpen ? "is-open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <button
            className="modal-scrim"
            aria-label="Close project details"
            onClick={closeProject}
          />
          <div className="project-modal">
            <div className="modal-top">
              <div className="modal-meta">
                <span>{project.category}</span>
                <span>{project.status}</span>
              </div>
              <button
                className="key key-sm modal-close"
                onClick={closeProject}
                aria-label="Close project details"
                title="Close (Esc)"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </div>
            <h2 id="modal-title">{project.title}</h2>
            {"repositoryUrl" in project && project.repositoryUrl && (
              <a
                className="text-link"
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
              >
                View repository
              </a>
            )}
            <div className="modal-section">
              <h3>Overview</h3>
              <p>{project.overview}</p>
            </div>
            <div className="modal-section">
              <h3>Details</h3>
              <div className="highlight-grid">
                {project.highlights.map((highlight) => (
                  <div key={highlight.title}>
                    <strong>{highlight.title}</strong>
                    <p>{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-section">
              <h3>Technical areas</h3>
              <div className="chips">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeading({
  title,
  note,
  large,
}: {
  title: string;
  note?: string;
  large?: boolean;
}) {
  return (
    <div className="section-heading">
      <h2 className={large ? "is-large" : undefined}>{title}</h2>
      {note && <span>{note}</span>}
    </div>
  );
}

function Screw({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg className={className} aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6" fill="var(--screw)" stroke="var(--line)" />
      <path
        d={flip ? "M3.5 3.5l7 7" : "M3.5 10.5l7-7"}
        stroke="var(--muted)"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function SpeakerGrille() {
  const rows = [0, 1, 2, 3];
  return (
    <svg aria-hidden="true" width="132" height="76" viewBox="0 0 132 76">
      <g fill="var(--grille)">
        {rows.map((row) =>
          Array.from({ length: row % 2 === 0 ? 7 : 6 }, (_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={(row % 2 === 0 ? 6 : 16) + col * 20}
              cy={6 + row * 21}
              r="4"
            />
          ))
        )}
      </g>
    </svg>
  );
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function DownloadIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M12 4v11" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  );
}

function DetailsIcon() {
  return (
    <svg {...iconProps} width={16} height={16} strokeWidth={2}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg {...iconProps} width={16} height={16} strokeWidth={2}>
      <path d="M4 5h16v11H9l-5 4z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg {...iconProps} width={14} height={14} strokeWidth={2}>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg {...iconProps} width={14} height={14}>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg {...iconProps} width={16} height={16} className="toggle-icon">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg {...iconProps} width={16} height={16} className="toggle-icon">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9 10l-5 5 5 5" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
