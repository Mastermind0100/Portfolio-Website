"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
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

const prompts = [
  {
    title: "AI research & engineering",
    description: "Explore work across RAG, multimodal AI, and production ML.",
    prompt: "What areas of AI research and engineering has Atharva worked in?",
    icon: "database",
  },
  {
    title: "Education",
    description: "Ask about degrees, universities, or study.",
    prompt: "Where did Atharva study?",
    icon: "school",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const chatStreamRef = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    chatStreamRef.current?.scrollTo({
      top: chatStreamRef.current.scrollHeight,
      behavior: "instant",
    });
  }, [messages]);

  useEffect(() => {
    const canvas = document.getElementById("neural-bg") as HTMLCanvasElement | null;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    const mouse = { x: 0, y: 0, active: false };
    const connectionDistance = 140;
    const mouseRadius = 100;
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();

    const particles = Array.from({ length: 75 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 1) * (reducedMotion ? 0.05 : 0.45),
      vy: (Math.random() - 1) * (reducedMotion ? 0.05 : 0.45),
      radius: Math.random() * 1.8 + 1.2,
      color:
        Math.random() > 0.4 ? "rgba(0, 242, 254," : "rgba(56, 189, 248,",
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulse: Math.random() * Math.PI,
    }));

    const move = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };
    const leave = () => {
      mouse.active = false;
    };
    const animate = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0) particle.x = width;
        else if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        else if (particle.y > height) particle.y = 0;
        particle.pulse += particle.pulseSpeed;

        if (mouse.active) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance < mouseRadius) {
            const force = (1 - distance / mouseRadius) * 0.4;
            particle.x += dx * force * 0.04;
            particle.y += dy * force * 0.04;
          }
        }

        for (let next = index + 1; next < particles.length; next += 1) {
          const other = particles[next];
          const distance = Math.hypot(
            particle.x - other.x,
            particle.y - other.y
          );
          if (distance < connectionDistance) {
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(0, 242, 254, ${
              (1 - distance / connectionDistance) * 0.18
            })`;
            context.lineWidth = 0.8;
            context.stroke();
          }
        }

        const distance = mouse.active
          ? Math.hypot(mouse.x - particle.x, mouse.y - particle.y)
          : Infinity;
        const nearMouse = distance < mouseRadius;
        if (nearMouse) {
          context.beginPath();
          context.moveTo(mouse.x, mouse.y);
          context.lineTo(particle.x, particle.y);
          context.strokeStyle = `rgba(0, 242, 254, ${
            (1 - distance / mouseRadius) * 0.45
          })`;
          context.lineWidth = 1.2;
          context.stroke();
        }

        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          nearMouse ? particle.radius * 1.5 : particle.radius,
          0,
          Math.PI * 2
        );
        const alpha = nearMouse
          ? "0.9)"
          : `${0.35 + Math.sin(particle.pulse) * 0.2})`;
        context.fillStyle = particle.color + alpha;
        context.shadowBlur = nearMouse ? 12 : 5;
        context.shadowColor = "#00f2fe";
        context.fill();
        context.shadowBlur = 0;
      });
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    frame = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
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

  function openProject(item: PortfolioProject) {
    setProject(item);
    setModalOpen(false);
  }

  function closeProject() {
    setModalOpen(false);
    window.setTimeout(() => setProject(null), 250);
  }

  return (
    <div className="site-shell">
      <canvas id="neural-bg" className="neural-bg" aria-hidden="true" />
      <header className="topbar">
        <div className="topbar-inner">
          <a className="identity" href="/">
            <span className="identity-name">
              <strong>{profile.name}</strong>
            </span>

          </a>
          <nav aria-label="Main navigation">
            <a href="#terminal">Ask me</a>
            <a href="#portfolio">Projects</a>
            <a href="#stack-matrix">Expertise</a>
            <a href="#timeline">Experience</a>
            <a href="#publications">Publications</a>
            <a href="#education">Education</a>
          </nav>
          <div className="header-actions">
            <a className="resume" href="/resume.pdf" download="resume.pdf">
              <span className="material-symbols-outlined">download</span>
              <span>Download Resume</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section
          className={`hero${messages.length > 0 ? " chat-active" : ""}`}
          id="terminal"
        >
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <div className="ambient ambient-three" />
          <div className="hero-content">
            <div className="welcome-copy">
              <h1>Hi! I am Atharva's Portfolio Assistant.</h1>
              <p>Ask me anything to do with Atharva's profile!</p>
              <span className="hero-location">{profile.location}</span>
            </div>
            {messages.length > 0 && (
              <div className="chat-heading">
                <span className="material-symbols-outlined" aria-hidden="true">
                  forum
                </span>
                <span>Resume assistant</span>
                <span className="chat-heading-hint">
                  Ask a follow-up or explore the portfolio below
                </span>
              </div>
            )}
            {messages.length === 0 && (
              <div className="prompt-grid">
                {prompts.map((item) => (
                  <button
                    className="prompt-card"
                    key={item.title}
                    onClick={() => void ask(item.prompt)}
                  >
                    <span className="prompt-copy">
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </span>
                    <span className="prompt-icon">
                      <span className="material-symbols-outlined">
                        {item.icon}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {messages.length > 0 && (
              <div
                className="chat-stream"
                ref={chatStreamRef}
                aria-live="polite"
              >
                {messages.map((message, index) => (
                  <div
                    className={`message ${message.from}`}
                    key={`${message.from}-${index}`}
                  >
                    <span className="message-mark">
                      {message.from === "assistant" ? (
                        <span className="material-symbols-outlined">forum</span>
                      ) : (
                        "U"
                      )}
                    </span>
                    <div className="message-content">
                      {message.from === "assistant" ? (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isResponding && <p role="status">Searching the resume…</p>}
              </div>
            )}
            <form className="chat-form" onSubmit={submitChat}>
              <input
                id="chatinputbox"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about my work, research, or education..."
                aria-label="Ask the resume assistant"
                disabled={isResponding}
              />
              <button
                aria-label="Send prompt"
                title="Send prompt"
                type="submit"
                disabled={isResponding || !input.trim()}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
          <a className="scroll-cue" href="#portfolio">
            <span>OR SCROLL TO EXPLORE MY WORK</span>
            <span className="material-symbols-outlined">keyboard_arrow_down</span>
          </a>
        </section>

        <section className="content-section" id="portfolio">
          <section className="content-block">
            <SectionHeading
              eyebrow="RESEARCH & ENGINEERING"
              title="Selected Projects"
              count={`${projects.length} PROJECTS`}
              subtitle="Work across agentic retrieval, multimodal robotics, and generative modeling, including a medical-imaging application."
            />
            <div className="project-grid">
              {projects.map((item) => (
                <button
                  className="project-card"
                  key={item.id}
                  onClick={() => openProject(item)}
                >
                  <span className="project-main">
                    <span className="project-meta">
                      <span className={`category-${item.categoryColor}`}>
                        {item.category}
                      </span>
                      <em>
                        <i />
                        {item.status}
                      </em>
                    </span>
                    <span className="project-title">{item.title}</span>
                    <span className="project-description">
                      {item.description}
                    </span>
                    <span className="tags">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                  </span>
                  <span className="project-footer">
                    <span className="project-link">
                      Explore project details
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="divider" />

          <section className="content-block" id="stack-matrix">
            <SectionHeading
              eyebrow="TECHNICAL EXPERTISE"
              title="Skills & Tools"
              subtitle="Skills and technologies listed in my resume, grouped by the work they support."
            />
            <div className="stack-grid">
              {skillGroups.map((group) => (
                <StackCard
                  key={group.title}
                  title={group.title}
                  icon={group.icon}
                  description={group.description}
                  tags={group.tags}
                />
              ))}
            </div>
          </section>

          <div className="divider" />

          <section className="content-block" id="timeline">
            <SectionHeading
              eyebrow="CAREER HISTORY"
              title="Experience"
              subtitle="Research, product engineering, and internships as listed in my resume."
            />
            <div className="timeline">
              {experience.map((item) => (
                <TimelineItem key={`${item.company}-${item.role}`} {...item} />
              ))}
            </div>
          </section>

          <div className="divider" />

          <section className="content-block" id="publications">
            <SectionHeading
              eyebrow="RESEARCH CONTRIBUTIONS"
              title="Selected Publications"
              count={`${publications.length} PUBLICATIONS`}
              subtitle="Five publications across AI-enabled imaging, computer vision, and cryptography."
            />
            <div className="publication-list">
              {publications.map((publication) => (
                <article className="publication-card" key={publication.title}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    article
                  </span>
                  <div>
                    <h3>{publication.title}</h3>
                    <p className="publication-authors">{publication.authors}</p>
                    <p>{publication.venue}</p>
                    {publication.doi && (
                      <a
                        href={`https://doi.org/${publication.doi}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        DOI: {publication.doi}
                      </a>
                    )}
                    {publication.url && (
                      <a
                        href={publication.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on arXiv
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="divider" />

          <section className="content-block" id="education">
            <SectionHeading
              eyebrow="EDUCATION"
              title="Academic Background"
            />
            <div className="education-grid">
              {education.map((item) => (
                <article className="education-card" key={item.institution}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    school
                  </span>
                  <span className="timeline-date">{item.date}</span>
                  <h3>{item.degree}</h3>
                  <p>{item.institution}</p>
                  <span className="timeline-location">{item.location}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="contact-panel" id="contact">
            <div className="contact-copy">
              <span className="eyebrow">GET IN TOUCH</span>
              <h2>Let&apos;s connect</h2>
              <p>
                For questions about my research or engineering experience, reach
                out by email or connect with me on GitHub or LinkedIn.
              </p>
              <div className="social-block">
                <span className="eyebrow">CONTACT & PROFILES</span>
                <div className="socials">
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="material-symbols-outlined">code</span>
                    GitHub
                  </a>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="material-symbols-outlined">work</span>
                    LinkedIn
                  </a>
                </div>
                <a className="email-link" href={`mailto:${profile.email}`}>
                  <span className="material-symbols-outlined">mail</span>
                  {profile.email}
                </a>
              </div>
              <a className="back-top" href="#terminal">
                <span className="material-symbols-outlined">arrow_upward</span>
                Back to chat
              </a>
            </div>
            <div className="contact-bottom">
              <span>© {profile.name}</span>
              <span>{profile.location} · AI Research & Engineering</span>
            </div>
          </section>
        </section>
      </main>

      <footer>
        <div>
          <strong>{profile.name}</strong>
          <span>·</span>
          <span>{profile.headline}</span>
        </div>
        <div>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
      </footer>

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
              <div>
                <span className={`eyebrow category-${project.categoryColor}`}>
                  {project.category}
                </span>
                <span className="modal-status">
                  <i />
                  {project.status}
                </span>
              </div>
              <button
                className="close-modal"
                onClick={closeProject}
                aria-label="Close project details"
                title="Close modal (Esc)"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-title-row">
              <h2 id="modal-title">{project.title}</h2>
            </div>
            <div className="modal-section">
              <span className="eyebrow">PROJECT OVERVIEW</span>
              <p>{project.overview}</p>
            </div>
            <div className="modal-section">
              <span className="eyebrow">PROJECT DETAILS</span>
              <div className="highlight-grid">
                {project.highlights.map((highlight) => (
                  <div key={highlight.title}>
                    <strong>
                      <i />
                      {highlight.title}
                    </strong>
                    <p>{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-section">
              <span className="eyebrow">TECHNICAL AREAS</span>
              <div className="tags">
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
  eyebrow,
  title,
  subtitle,
  count,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">
          <i />
          {eyebrow}
        </span>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {count && <small>{count}</small>}
    </div>
  );
}

function StackCard({
  title,
  icon,
  description,
  tags,
}: {
  title: string;
  icon: string;
  description: string;
  tags: string[];
}) {
  return (
    <article className="stack-card">
      <div className="stack-card-heading">
        <h3>{title}</h3>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p>{description}</p>
      <div className="stack-tags">
        {tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}

function TimelineItem({
  date,
  location,
  role,
  company,
  description,
  tags,
}: (typeof experience)[number]) {
  return (
    <article className="timeline-item">
      <span className="timeline-date">{date}</span>
      <span className="timeline-location">{location}</span>
      <h3>
        {role} <b>@ {company}</b>
      </h3>
      <p>{description}</p>
      <div className="timeline-tags">
        {tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}
