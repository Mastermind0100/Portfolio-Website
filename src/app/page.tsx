"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Highlight = { title: string; description: string };
type Metric = { label: string; value: string; color: "cyan" | "sky" };
type Project = {
  id: string; category: string; categoryColor: "cyan" | "sky"; status: string;
  title: string; description: string; overview: string; tags: string[];
  metric: Metric; metrics: Metric[]; highlights: Highlight[]; github: string; demo: string;
};

const projects: Project[] = [
  {
    id: "synapsescale", category: "01 // DISTRIBUTED SERVING", categoryColor: "cyan", status: "Active Production",
    title: "SynapseScale // Distributed vLLM Engine",
    description: "High-throughput speculative decoding engine serving multi-tenant fine-tuned 70B models with dynamic continuous batching over InfiniBand fabric.",
    overview: "SynapseScale is an ultra-low latency distributed inference platform architected to serve multi-tenant fine-tuned 70B parameter LLMs under continuous SLA bounds. By leveraging asynchronous speculative token generation paired with cross-node tensor-parallel sharding across Nvidia H100 clusters, SynapseScale sustains extreme query density with zero cold-start tail penalties.",
    tags: ["PyTorch", "CUDA", "vLLM", "Ray", "TensorRT-LLM", "InfiniBand", "Kubernetes", "Prometheus"],
    metric: { label: "P95 TTFT", value: "<38ms", color: "cyan" },
    highlights: [
      { title: "Speculative Token Verifier", description: "Custom Triton kernel speculative verifier executing 5 draft tokens simultaneously on a paired 7B model." },
      { title: "Dynamic Continuous Batching", description: "Non-blocking token-level preemption scheduling to maximize GPU memory utilization without starvation." },
      { title: "InfiniBand RDMA Sharding", description: "Sub-microsecond KV-cache layer exchanges across node interconnects bypassing the OS networking stack." },
      { title: "vLLM PagedAttention v2", description: "Zero-fragmentation virtual memory allocation scheme reducing GPU VRAM waste to under 3.5%." },
    ],
    metrics: [{ label: "TTFT (P95)", value: "<38ms", color: "cyan" }, { label: "Cluster SLA", value: "99.98%", color: "sky" }, { label: "Throughput", value: "4.2x Lift", color: "cyan" }],
    github: "https://github.com", demo: "https://benchmark.chen.systems",
  },
  {
    id: "omnigraph", category: "02 // AGENT ARCHITECTURE", categoryColor: "sky", status: "Open Source",
    title: "OmniGraph // Autonomous Agent Memory Subsystem",
    description: "Long-term episodic and procedural memory for autonomous swarms, combining temporal reasoning with graph-augmented vector indexing.",
    overview: "OmniGraph is a hybrid temporal reasoning memory substrate designed for long-running autonomous agent swarms. It unifies high-dimensional vector similarity retrieval with an explicitly typed Neo4j graph ontology, allowing swarms to reconstruct contextual causality, audit agent beliefs, and persist hierarchical memory structures across weeks of continuous execution.",
    tags: ["LangGraph", "Neo4j", "Rust", "VectorDB", "FastAPI", "AsyncIO", "Docker", "HuggingFace"],
    metric: { label: "Hallucination Delta", value: "-85%", color: "sky" },
    highlights: [
      { title: "Episodic & Procedural Graph", description: "Hierarchical sub-graph mapping agent decisions, actions taken, and validated world state transitions." },
      { title: "Asynchronous Rust Engine", description: "Zero-copy query compiler converting natural language graph queries into cypher statements in under 12ms." },
      { title: "Hallucination Suppression", description: "Fact-consistency validator checking generated output against topological facts before emission." },
      { title: "Multi-Agent State Sync", description: "Conflict-free replicated data types (CRDT) ensuring concurrent agent modifications reconcile seamlessly." },
    ],
    metrics: [{ label: "Hallucination Delta", value: "-85%", color: "sky" }, { label: "Sub-Graph Traverse", value: "12ms", color: "cyan" }, { label: "Swarm Concurrency", value: "64 Agents", color: "cyan" }],
    github: "https://github.com", demo: "https://omnigraph.chen.systems",
  },
  {
    id: "neuroprune", category: "03 // MODEL OPTIMIZATION", categoryColor: "cyan", status: "NeurIPS '24",
    title: "NeuroPrune // Structural Compression Toolkit",
    description: "Gradient-free 4-bit weight and activation quantization with zero degradation on GSM8K and MMLU, compiling custom Triton kernels.",
    overview: "Presented at NeurIPS 2024, NeuroPrune is a zero-gradient, post-training structural quantization framework for modern decoder LLMs. Utilizing second-order Hessian approximation and layer-by-layer channel pruning, NeuroPrune compresses 70B models to 4-bit representation with 99.1% intact benchmark parity on MMLU and GSM8K reasoning tests.",
    tags: ["PyTorch", "Triton", "CUDA", "ONNX Runtime", "C++20", "HuggingFace", "Slurm", "FlashAttention-2"],
    metric: { label: "VRAM Footprint", value: "3.2x Drop", color: "cyan" },
    highlights: [
      { title: "Gradient-Free Quantization", description: "Compresses weights and activations without requiring full fine-tuning loops or massive calibration sets." },
      { title: "Custom Triton Dequant Kernels", description: "Memory-bandwidth bound INT4/FP16 mixed-precision fused kernels achieving compute parity on Hopper GPUs." },
      { title: "Layer Sensitivity Analyzer", description: "Automated ranking preserving critical attention heads while aggressively compressing feed-forward blocks." },
      { title: "Zero MMLU Accuracy Loss", description: "Retains complex multi-step reasoning capabilities where conventional naive INT4 methods degrade drastically." },
    ],
    metrics: [{ label: "VRAM Footprint", value: "3.2x Drop", color: "cyan" }, { label: "MMLU Parity", value: "99.1%", color: "cyan" }, { label: "Kernel Speedup", value: "1.8x GEMM", color: "sky" }],
    github: "https://github.com", demo: "https://arxiv.org",
  },
  {
    id: "pulsesight", category: "04 // COMPUTER VISION", categoryColor: "sky", status: "Enterprise Edge",
    title: "PulseSight // Realtime Multimodal Edge Vision",
    description: "Zero-latency edge vision pipeline detecting microscopic industrial manufacturing defects at 120 FPS streamed straight via WebRTC.",
    overview: "PulseSight is a hardware-accelerated computer vision runtime built for microscopic industrial surface quality verification at high velocity. Running custom TensorRT-optimized YOLOv10 backbones, PulseSight classifies surface anomalies on silicon wafers and precision optics at 120 FPS directly on factory edge gateways.",
    tags: ["YOLOv10", "TensorRT", "WebRTC", "Next.js 14", "WebGL", "TypeScript", "Jetson Orin", "Tailwind CSS"],
    metric: { label: "Edge Stream", value: "120 FPS", color: "sky" },
    highlights: [
      { title: "Zero-Latency WebRTC Pipeline", description: "Sub-15ms glass-to-glass latency streaming annotated 4K video feeds directly to client web dashboards." },
      { title: "WebGL Heatmap Overlay", description: "Browser-side hardware-accelerated bounding box and feature-saliency shader visualization at 60 FPS." },
      { title: "Edge Hardware Acceleration", description: "Leverages Nvidia Jetson Orin with INT8 quantization for sub-watt high-density inferencing." },
      { title: "Automated Drift Triggering", description: "Embedded telemetry pipelines detecting optical focal shift and ambient lighting degradation in real-time." },
    ],
    metrics: [{ label: "Edge Throughput", value: "120 FPS", color: "cyan" }, { label: "Glass-to-Glass", value: "<15ms", color: "cyan" }, { label: "Defect Recall", value: "99.82%", color: "sky" }],
    github: "https://github.com", demo: "https://pulsesight.chen.systems",
  },
];

const prompts = [
  { title: "Query Systems & Architecture", description: "Ask about latency benchmarks, vLLM, or papers.", prompt: "Query Systems & Architecture: latency benchmarks, vLLM, and papers", icon: "database" },
  { title: "Explore Architectures", description: "See what Atharva's models and systems can do.", prompt: "Explore Architectures: see what Atharva's models and systems can do", icon: "explore" },
];
type ChatMessage = { from: "user" | "assistant"; text: string };

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const chatStreamRef = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactBusy, setContactBusy] = useState(false);

  useEffect(() => {
    const chatStream = chatStreamRef.current;
    if (chatStream) chatStream.scrollTo({ top: chatStream.scrollHeight, behavior: "instant" });
  }, [messages]);

  useEffect(() => {
    const canvas = document.getElementById("neural-bg") as HTMLCanvasElement | null;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    const mouse = { x: 0, y: 0, active: false };
    const connectionDistance = 140;
    const mouseRadius = 100;
    const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    resize();
    const particles = Array.from({ length: 75 }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 1) * (reducedMotion ? .05 : .45), vy: (Math.random() - 1) * (reducedMotion ? .05 : .45),
      radius: Math.random() * 1.8 + 1.2, color: Math.random() > .4 ? "rgba(0, 242, 254," : "rgba(56, 189, 248,",
      pulseSpeed: Math.random() * .02 + .01, pulse: Math.random() * Math.PI,
    }));
    const move = (event: PointerEvent) => { mouse.x = event.clientX; mouse.y = event.clientY; mouse.active = true; };
    const leave = () => { mouse.active = false; };
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        particle.x += particle.vx; particle.y += particle.vy;
        if (particle.x < 0) particle.x = width; else if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height; else if (particle.y > height) particle.y = 0;
        particle.pulse += particle.pulseSpeed;
        if (mouse.active) {
          const dx = mouse.x - particle.x; const dy = mouse.y - particle.y; const distance = Math.hypot(dx, dy);
          if (distance < mouseRadius) { const force = (1 - distance / mouseRadius) * .4; particle.x += dx * force * .04; particle.y += dy * force * .04; }
        }
        for (let next = index + 1; next < particles.length; next += 1) {
          const other = particles[next]; const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < connectionDistance) {
            ctx.beginPath(); ctx.moveTo(particle.x, particle.y); ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${(1 - distance / connectionDistance) * .18})`; ctx.lineWidth = .8; ctx.stroke();
          }
        }
        const distance = mouse.active ? Math.hypot(mouse.x - particle.x, mouse.y - particle.y) : Infinity;
        const nearMouse = distance < mouseRadius;
        if (nearMouse) {
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(particle.x, particle.y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${(1 - distance / mouseRadius) * .45})`; ctx.lineWidth = 1.2; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(particle.x, particle.y, nearMouse ? particle.radius * 1.5 : particle.radius, 0, Math.PI * 2);
        const particleAlpha = nearMouse ? "0.9)" : `${.35 + Math.sin(particle.pulse) * .2})`;
        ctx.fillStyle = particle.color + particleAlpha;
        ctx.shadowBlur = nearMouse ? 12 : 5; ctx.shadowColor = "#00f2fe"; ctx.fill(); ctx.shadowBlur = 0;
      });
      frame = requestAnimationFrame(animate);
    };
    window.addEventListener("resize", resize); window.addEventListener("pointermove", move); window.addEventListener("pointerleave", leave);
    frame = requestAnimationFrame(animate);
    return () => { window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); window.removeEventListener("pointerleave", leave); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    if (!project) return;
    const frame = requestAnimationFrame(() => setModalOpen(true));
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") closeProject(); };
    document.body.style.overflow = "hidden"; window.addEventListener("keydown", escape);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("keydown", escape); document.body.style.overflow = ""; };
  }, [project]);

  async function ask(prompt: string) {
    setMessages((current) => [...current, { from: "user", text: prompt }]);
    setIsResponding(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt }),
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
          text: error instanceof Error
            ? error.message
            : "Resume search failed. Please try again.",
        },
      ]);
    } finally {
      setIsResponding(false);
    }
  }
  function submitChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const value = input.trim(); if (!value) return;
    setInput("");
    void ask(value);
  }
  function closeProject() { setModalOpen(false); window.setTimeout(() => setProject(null), 250); }
  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setContactBusy(true);
    window.setTimeout(() => { setContactSent(true); form.reset(); window.setTimeout(() => setContactBusy(false), 3000); }, 600);
  }

  return <div className="site-shell">
    <canvas id="neural-bg" className="neural-bg" aria-hidden="true" />
    <header className="topbar"><div className="topbar-inner">
      <div className="identity"><div className="identity-name"><strong>Atharva Hudlikar</strong><span>{"// Systems Architect"}</span></div><em><i />Online (vLLM Engine)</em></div>
      <nav aria-label="Main navigation"><a href="#terminal">Terminal / Chat</a><a href="#portfolio">Projects</a><a href="#stack-matrix">Stack Matrix</a><a href="#timeline">Timeline</a><a href="#contact">Contact</a></nav>
      <div className="header-actions"><a className="resume" href="#"><span className="material-symbols-outlined">description</span><span>Resume</span></a><img className="profile" alt="Atharva Hudlikar" src="https://lh3.googleusercontent.com/aida/AEtjO1VVfpd3VccSL_0iVo3f86zYw1D8BE3xon0uVxCOMXLRwDdGIkcxWRDhQSSRIxh8qhqodXdMhhwsE_4HtMjbTjaJvirY9vqzYMnV8r_ykQY7ez7LcPp5ITUVXahM9MjK65HYHVaMCvgrx3HLnw6Ncimxfk9mASjKU_E8vtpd5yuymBgao3Nna5F5few8YtQ0LpXT132sETemRLMQlJU5IjXms8Qb3sQt6cYD3NeayH7sc_wSN2RyteF_h_M" /></div>
    </div></header>
    <main>
      <section className={`hero${messages.length > 0 ? " chat-active" : ""}`} id="terminal"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="ambient ambient-three" />
        <div className="status-line"><span><i /><b>NODE_ID // AC-US-WEST4</b><b className="status-separator">::</b><span className="inference-ready">INFERENCE READY</span></span><span className="status-right"><em>TPU v5e Cluster</em><span>v2.4 Kernel</span></span></div>
        <div className="hero-content"><div className="welcome-copy"><h1>Hello!</h1><h2>I am Atharva&apos;s Resume Assistant.</h2><p>Ask away about his education, work, skills, projects, or experience.</p></div>
          {messages.length > 0 && <div className="chat-heading"><span className="material-symbols-outlined" aria-hidden="true">forum</span><span>Resume assistant</span><span className="chat-heading-hint">Ask a follow-up or explore the portfolio below</span></div>}
          {messages.length === 0 && <div className="prompt-grid">{prompts.map((item) => <button className="prompt-card" key={item.title} onClick={() => void ask(item.prompt)}><span className="prompt-copy"><strong>{item.title}</strong><span>{item.description}</span></span><span className="prompt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.icon === "database" ? <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="m14 17 4 4 4-4" /></> : <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>}</svg></span></button>)}</div>}
          {messages.length > 0 && <div className="chat-stream" ref={chatStreamRef} aria-live="polite">{messages.map((message, index) => <div className={`message ${message.from}`} key={`${message.from}-${index}`}><span className="message-mark">{message.from === "assistant" ? <span className="material-symbols-outlined">terminal</span> : "U"}</span><div className="message-content">{message.from === "assistant" ? <ReactMarkdown>{message.text}</ReactMarkdown> : <p>{message.text}</p>}</div></div>)}{isResponding && <p role="status">Searching the resume…</p>}</div>}
          <form className="chat-form" onSubmit={submitChat}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter a prompt here..." aria-label="Ask the resume assistant" disabled={isResponding} /><button aria-label="Send prompt" title="Send prompt" type="submit" disabled={isResponding || !input.trim()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg></button></form>
          <p className="attribution">Powered by Groq + NextJS · Built by Atharva.</p>
        </div><a className="scroll-cue" href="#portfolio"><span>OR SCROLL TO VIEW TRADITIONAL PORTFOLIO</span><span className="material-symbols-outlined">keyboard_arrow_down</span></a>
      </section>

      <section className="content-section" id="portfolio">
        <section className="content-block"><SectionHeading eyebrow="SELECTED WORKS // CASE STUDIES" title="Selected Architectures & Works" count="4 PRODUCTION ARCHITECTURES" />
          <div className="project-grid">{projects.map((item) => <button className="project-card" key={item.id} onClick={() => { setProject(item); setModalOpen(false); }}>
            <span className="project-main"><span className="project-meta"><span className={`category-${item.categoryColor}`}>{item.category}</span><em><i />{item.status}</em></span><span className="project-title">{item.title}</span><span className="project-description">{item.description}</span><span className="tags">{item.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</span></span>
            <span className="project-footer"><span className="project-metric"><small>{item.metric.label}:</small><strong className={`metric-${item.metric.color}`}>{item.metric.value}</strong><small className="metric-note">{item.id === "synapsescale" ? "(4.2x Throughput)" : item.id === "omnigraph" ? "(12ms Traverse)" : item.id === "neuroprune" ? "(99.1% MMLU)" : "(<15ms G2G)"}</small></span><span className="project-link">{item.id === "omnigraph" || item.id === "pulsesight" ? "Inspect Deep-Dive" : "Explore Architecture"}<span className="material-symbols-outlined">{item.id === "omnigraph" || item.id === "pulsesight" ? "arrow_forward" : "north_east"}</span></span></span>
          </button>)}</div>
        </section>
        <div className="divider" />
        <section className="content-block" id="stack-matrix"><SectionHeading eyebrow="SYSTEM TOPOLOGY & TOOLING" title="Technical Stack Matrix" subtitle="Core competencies distributed across model architectures, high-performance runtime environments, and distributed deployment infrastructure." />
          <div className="stack-grid"><StackCard title="01 // LLMs & ORCHESTRATION" icon="psychology" description="Core model training, fine-tuning, KV caching, and multi-agent coordination frameworks." tags={["PyTorch", "vLLM", "TensorRT-LLM", "LangGraph", "LlamaIndex", "LoRA / QLoRA", "FlashAttention-2", "DeepSpeed"]} /><StackCard title="02 // MLOps & Infrastructure" icon="hub" description="Cluster scheduling, accelerator provisioning, metric observability, and zero-downtime serving." tags={["Kubernetes", "Triton Server", "Ray Cluster", "Slurm", "Docker", "AWS / GCP TPU", "Prometheus", "Weights & Biases"]} /><StackCard title="03 // Systems & Runtimes" icon="terminal" description="Low-level systems programming, vector storage layers, concurrent event loops, and interfaces." tags={["Rust", "Python", "TypeScript", "Next.js 14", "Tailwind CSS", "PostgreSQL / pgvector", "Redis", "WebGL"]} /></div>
        </section>
        <div className="divider" />
        <section className="content-block" id="timeline"><SectionHeading eyebrow="CAREER CHRONOLOGY" title="Experience & Leadership" />
          <div className="timeline"><TimelineItem date="2023 — PRESENT" location="San Francisco, CA" role="Staff AI Systems Architect" company="Nexus Intelligence" description="Directing inference platform engineering scaling from 100k to 5M daily queries. Architected custom tensor cache sharding layer reducing GPU memory consumption by 38% across our 512x H100 production cluster. Mentoring a team of 9 distributed ML and kernel engineers." tags={["Cluster Orchestration", "vLLM Speculation", "GPU Memory Topologies"]} /><TimelineItem date="2021 — 2023" location="Palo Alto, CA" role="Senior Deep Learning Engineer" company="DeepPulse AI" description="Authored low-latency quantization algorithms and Triton kernels for on-device and edge deployment. Awarded 3 US patents in non-uniform weight pruning and activation sparsification for transformer architectures." tags={["3 US Patents", "CUDA Kernels", "Edge Quantization"]} /><TimelineItem date="2019 — 2021" location="Stanford, CA" role="AI Research Scientist" company="Stanford Vision & Learning Lab" description="Investigated cross-modal foundation models and synthetic data distillation for low-shot robotic manipulation tasks. Published 4 top-tier conference papers (CVPR, NeurIPS)." tags={["4 Peer-Reviewed Papers", "Vision-Language Models"]} /></div>
        </section>
        <section className="contact-panel" id="contact">
          <div className="contact-copy"><span className="eyebrow">DIRECT CHANNEL</span><h2>Let&apos;s Discuss Systems Architecture</h2><p>Available for technical advisory roles, high-impact consulting engagements, foundation model infrastructure reviews, and keynote research discussions.</p><div className="social-block"><span className="eyebrow">VERIFIED COORDINATES</span><div className="socials"><a href="https://github.com" target="_blank" rel="noreferrer"><span className="material-symbols-outlined">terminal</span>GitHub</a><a href="https://linkedin.com" target="_blank" rel="noreferrer"><span className="material-symbols-outlined">work</span>LinkedIn</a><a href="https://x.com" target="_blank" rel="noreferrer"><span className="material-symbols-outlined">tag</span>X / Twitter</a><a href="https://scholar.google.com" target="_blank" rel="noreferrer"><span className="material-symbols-outlined">school</span>Scholar</a></div><a className="email-link" href="mailto:hudlikaratharva@gmail.com"><span className="material-symbols-outlined">mail</span>hudlikaratharva@gmail.com</a></div><a className="back-top" href="#terminal"><span className="material-symbols-outlined">arrow_upward</span>Back to Top Chat Terminal</a></div>
          <form className="contact-form" onSubmit={submitContact}><div className="form-row"><label>Name // Identity<input required placeholder="Dr. Sarah Lin" /></label><label>Email Coordinate<input required type="email" placeholder="sarah@anthropic.com" /></label></div><label>Nature of Engagement<select defaultValue="advisory"><option value="advisory">Inference Optimization Advisory</option><option value="consulting">Custom Agent Systems Engineering</option><option value="speaking">Technical Keynote / Academic Panel</option><option value="other">General Engineering Inquiry</option></select></label><label>Message &amp; Architectural Context<textarea required rows={4} placeholder="Detail your system throughput target, current hardware stack, or research objectives..." /></label><button type="submit" disabled={contactBusy}><span>{contactBusy ? "Transmitting..." : "Transmit Inquiry"}</span><span className="material-symbols-outlined">send</span></button>{contactSent && <p className="contact-success" role="status">✓ Transmission acknowledged. Atharva will respond within 24 hours.</p>}</form>
          <div className="contact-bottom"><span>© 2025 Atharva Hudlikar. Deep Aerospace Navy &amp; Cobalt Cyber Architecture.</span><span>SHA: <b>8a4f91e // PROD-STABLE</b></span></div>
        </section>
      </section>
    </main>
    <footer><div><strong>© 2025 Atharva Hudlikar</strong><span>•</span><span>Deep Aerospace Navy &amp; Cobalt Architecture</span></div><div><span>Latency: ~18ms p99</span><span>vLLM v0.6.4</span></div></footer>
    {project && <div className={`modal-layer ${modalOpen ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-scrim" aria-label="Close project details" onClick={closeProject} /><div className="project-modal"><div className="modal-top"><div><span className={`eyebrow category-${project.categoryColor}`}>{project.category}</span><span className="modal-status"><i />{project.status}</span></div><button className="close-modal" onClick={closeProject} aria-label="Close project details" title="Close modal (Esc)"><span className="material-symbols-outlined">close</span></button></div><div className="modal-title-row"><h2 id="modal-title">{project.title}</h2><div className="modal-links"><a href={project.github} target="_blank" rel="noreferrer"><span className="material-symbols-outlined">code</span>View on GitHub ↗</a><a href={project.demo} target="_blank" rel="noreferrer"><span className="material-symbols-outlined">monitoring</span>Live Benchmark</a></div></div><div className="modal-section"><span className="eyebrow">ARCHITECTURAL OVERVIEW</span><p>{project.overview}</p></div><div className="modal-section"><span className="eyebrow">CORE ENGINEERING HIGHLIGHTS</span><div className="highlight-grid">{project.highlights.map((highlight) => <div key={highlight.title}><strong><i />{highlight.title}</strong><p>{highlight.description}</p></div>)}</div></div><div className="modal-section"><span className="eyebrow">QUANTIFIED BENCHMARKS &amp; METRICS</span><div className="modal-metrics">{project.metrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong className={`metric-${metric.color}`}>{metric.value}</strong></div>)}</div></div><div className="modal-section"><span className="eyebrow">TECHNOLOGY STACK &amp; SUBSYSTEMS</span><div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></div></div>}
  </div>;
}

function SectionHeading({ eyebrow, title, subtitle, count }: { eyebrow: string; title: string; subtitle?: string; count?: string }) {
  return <div className="section-heading"><div><span className="eyebrow"><i />{eyebrow}</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{count && <small>{count}</small>}</div>;
}
function StackCard({ title, icon, description, tags }: { title: string; icon: string; description: string; tags: string[] }) {
  return <article className="stack-card"><div className="stack-card-heading"><h3>{title}</h3><span className="material-symbols-outlined">{icon}</span></div><p>{description}</p><div className="stack-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>;
}
function TimelineItem({ date, location, role, company, description, tags }: { date: string; location: string; role: string; company: string; description: string; tags: string[] }) {
  return <article className="timeline-item"><span className="timeline-date">{date}</span><span className="timeline-location">{location}</span><h3>{role} <b>@ {company}</b></h3><p>{description}</p><div className="timeline-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>;
}
