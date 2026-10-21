export const profile = {
  name: "Atharva Hudlikar",
  headline: "AI Researcher & Engineer",
  location: "Singapore",
  summary: "I’m an AI engineer and researcher who loves building solutions. What started with robotics evolved into computer vision and eventually a deep dive into AI, spanning everything from gesture-controlled systems and robotics to LLMs, AI pipelines, and agentic architectures. Today, I’m focused on building intelligent systems that go beyond generating outputs — systems that reason, use tools, and turn ambitious ideas into real-world solutions. Outside of AI, I love travelling, gaming, and falling down rabbit holes ranging from obscure history to quantum mechanics. At my core, I’m a builder driven by curiosity and an appetite for the seemingly impossible. Give me a weird problem and ask, “Can you build this?” — I’ll figure it out.",
  email: "atharvahudlikar@gmail.com",
  linkedin: "https://linkedin.com/in/atharva-hudlikar/",
  github: "https://github.com/Mastermind0100",
};

export const projects = [
  {
    id: "agentic-rag",
    category: "AGENTIC AI",
    categoryColor: "cyan" as const,
    status: "RAG · Agentic AI",
    title: "Agentic Medical Data Analysis",
    description:
      "A deployment-grade RAG assisted system for domain-specific querying on Medical databases and AI-assisted analysis.",
    overview:
      "An end-to-end system that turns domain documents into actionable answers. Its pipeline combines custom document parsing, embedding generation, retrieval, ranking, and reranking with agentic orchestration for multi-step tasks.",
    highlights: [
      {
        title: "End-to-end retrieval",
        description:
          "Covers document parsing, embedding generation, information retrieval, ranking, and reranking.",
      },
      {
        title: "Specialized model orchestration",
        description:
          "Dynamically selects specialized AI models and brings relevant domain knowledge into multi-step analysis.",
      },
      {
        title: "Beyond question answering",
        description:
          "Supports multi-step tasks and action-oriented agent interactions with underlying data and systems.",
      },
    ],
    tags: [
      "RAG",
      "LLMs",
      "Embeddings",
      "Information Retrieval",
      "Ranking",
      "Agentic AI",
      "Domain-specific AI",
    ],
  },
  {
    id: "robot-control",
    category: "MULTIMODAL AI",
    categoryColor: "sky" as const,
    status: "Vision · Robotics",
    title: "Generative AI-Based Robot Control",
    description:
      "A multimodal AI pipeline connecting visual perception with robot actions in dynamic environments.",
    overview:
      "This project explored how vision, depth estimation, and generative models can work together in a robot-control pipeline. System behavior was evaluated across perception and control components, with a focus on robustness and reliable downstream actions.",
    highlights: [
      {
        title: "Multimodal perception",
        description:
          "Integrates vision, depth estimation, and generative models.",
      },
      {
        title: "Generative approaches",
        description:
          "Explores diffusion and neural-rendering approaches for dynamic environments.",
      },
      {
        title: "Perception to action",
        description:
          "Connects visual perception to downstream robot actions and evaluates system-level behavior.",
      },
    ],
    tags: [
      "Multimodal AI",
      "Computer Vision",
      "Depth Estimation",
      "Diffusion Models",
      "Neural Rendering",
      "Robotics",
    ],
    repositoryUrl: "https://github.com/Mastermind0100/syn-robot-control",
  },
  {
    id: "medical-image-generation",
    category: "MEDICAL IMAGING",
    categoryColor: "cyan" as const,
    status: "Generative AI",
    title: "Medical Image Generation",
    description:
      "Generative models for ophthalmological imaging, including OCT and fundus images.",
    overview:
      "A medical-imaging project developing diffusion- and StyleGAN-based models for ophthalmological data. The work included training models from scratch, fine-tuning pretrained models, and comparing synthetic image quality and downstream utility.",
    highlights: [
      {
        title: "Ophthalmological imaging",
        description: "Works with OCT and fundus images.",
      },
      {
        title: "Generative model development",
        description:
          "Trains diffusion and StyleGAN models from scratch and fine-tunes pretrained models.",
      },
      {
        title: "Synthetic data",
        description:
          "Generates datasets for classification research targeting rare ophthalmological diseases.",
      },
    ],
    tags: [
      "Diffusion Models",
      "StyleGAN",
      "OCT",
      "Fundus Imaging",
      "Synthetic Data",
      "Medical Computer Vision",
    ],
  },
  {
    id: "optical-character-recognizer",
    category: "COMPUTER VISION",
    categoryColor: "sky" as const,
    status: "OCR · Python",
    title: "Optical Character Recognizer",
    description:
      "An OCR project that segments an image into individual characters, predicts each character with a pretrained model, and combines the predictions into text.",
    overview:
      "A Python computer-vision project for recognizing text in images. It divides the image into character segments, classifies each segment with a pretrained model, and assembles the predictions into a text string. The repository notes that it does not automatically detect spaces between words.",
    highlights: [
      {
        title: "Character segmentation",
        description:
          "Splits an input image into segments, each intended to contain an individual character.",
      },
      {
        title: "Pretrained character recognition",
        description:
          "Runs a pretrained model on each character segment and predicts the character.",
      },
      {
        title: "Trainable model workflow",
        description:
          "Includes a model script and describes training with a custom dataset.",
      },
    ],
    tags: ["OCR", "Python", "Computer Vision", "Image Processing"],
    repositoryUrl:
      "https://github.com/Mastermind0100/Optical-Character-Recognizer",
  },
];

export const skillGroups = [
  {
    title: "LLM & Generative AI",
    icon: "psychology",
    description:
      "Language-model systems, retrieval, evaluation, and agentic workflows.",
    tags: [
      "Retrieval-Augmented Generation",
      "Large Language Models",
      "LLM Fine-Tuning",
      "Embeddings",
      "Reranking",
      "Agentic AI",
      "Prompt Engineering",
      "LLM Evaluation",
      "Error Analysis",
    ],
  },
  {
    title: "Machine Learning",
    icon: "visibility",
    description:
      "Deep learning methods applied across computer vision, robotics, generative modeling, and other AI problems.",
    tags: [
      "PyTorch",
      "TensorFlow",
      "Vision Transformers",
      "Diffusion Models",
      "Computer Vision",
      "Generative Models",
      "Deep Learning",
    ],
  },
  {
    title: "ML Infrastructure",
    icon: "hub",
    description:
      "Production deployment and optimization for machine-learning systems.",
    tags: [
      "AWS",
      "Docker",
      "Microservices",
      "CI/CD",
      "Model Deployment",
      "MLOps",
      "Production Optimization",
    ],
  },
  {
    title: "Programming",
    icon: "code",
    description: "Languages used across AI research and engineering projects.",
    tags: ["Python", "C", "C++", "TypeScript", "JavaScript", "Java", "Go"],
  },
  {
    title: "Computer Vision & Robotics",
    icon: "precision_manufacturing",
    description:
      "Visual recognition and perception systems, including projects linking vision to robot actions.",
    tags: [
      "Computer Vision",
      "OCR",
      "License Plate Recognition",
      "Image Processing",
      "Depth Estimation",
      "Robotics",
    ],
  },
  {
    title: "AI Products & Information Retrieval",
    icon: "search",
    description:
      "Applied AI systems and search pipelines built for enterprise workflows.",
    tags: [
      "Information Retrieval",
      "Resume Parsing",
      "Entity Extraction",
      "Ranking",
      "Japanese NLP",
      "Full-Stack AI",
    ],
  },
];

export const experience = [
  {
    date: "May 2024 — Present",
    location: "Singapore",
    role: "AI Research Fellow",
    company: "Tan Tock Seng Hospital, PROTON Research Programme",
    description:
      "Leads AI research and production ML initiatives across LLM/RAG systems, multimodal AI, and model deployment. Built a RAG platform used by 50+ global research teams, deployed Vision Transformer models into clinical workflows, and reduced infrastructure costs by approximately 40%.",
    tags: [
      "AI Research",
      "RAG",
      "Multimodal AI",
      "Vision Transformers",
      "ML Infrastructure",
    ],
  },
  {
    date: "June 2021 — April 2023",
    location: "Bangalore, India / Tokyo, Japan",
    role: "AI Product Engineer",
    company: "Goalist India Technologies Pvt. Ltd.",
    description:
      "Developed and deployed AI systems for enterprise workflows. Built an information-retrieval and resume-parsing platform, optimized entity extraction and ranking for multilingual Japanese-language data, and led a team of three engineers building a full-stack AI application.",
    tags: [
      "Information Retrieval",
      "Resume Parsing",
      "Japanese NLP",
      "Team Leadership",
      "Production ML",
    ],
  },
  {
    date: "December 2019 — December 2020",
    location: "Chennai, India",
    role: "AI Engineer Intern",
    company: "MellonAI",
    description:
      "Led development of three AI-driven healthcare systems covering head-pose estimation, facial recognition, and emotion detection. Deployed computer-vision systems adopted by partner hospitals, reducing operational waiting time by approximately 20%.",
    tags: [
      "Healthcare AI",
      "Computer Vision",
      "Facial Recognition",
      "Model Deployment",
    ],
  },
  {
    date: "May 2019 — July 2019",
    location: "Pune, India",
    role: "Computer Vision Engineer Intern",
    company: "Alpha ICT LLP",
    description:
      "Built OCR and automatic license-plate-recognition systems using CNN architectures and custom image preprocessing pipelines. Automated manual identification workflows and reduced annual operational costs by approximately 80%.",
    tags: [
      "OCR",
      "License Plate Recognition",
      "CNNs",
      "Image Processing",
      "Automation",
    ],
  },
];

export const education = [
  {
    date: "August 2023 — July 2025",
    degree: "Master of Science in Computer Control and Automation",
    institution: "Nanyang Technological University",
    location: "Singapore",
  },
  {
    date: "July 2017 — June 2021",
    degree: "Bachelor of Technology in Electrical and Electronics Engineering",
    institution: "Vellore Institute of Technology",
    location: "Vellore, India",
  },
];

export const publications = [
  {
    title:
      "Novel Artificial Intelligence–Based Quantification of Anterior Chamber Inflammation Using Vision Transformers",
    authors:
      "Cifuentes-González, C., Gutiérrez-Sinisterra, L., Rojas-Carabali, W., Boon, J., Hudlikar, A., et al.",
    venue: "Translational Vision Science & Technology, 14(5), 31 (2025)",
    doi: "10.1167/tvst.14.5.31",
  },
  {
    title: "Retinal Vascularity Index in Parkinson's Disease vs Controls",
    authors:
      "Hsu, J., D'Cunha, R. L., Choi, A., Zhu, M., Haystead, A., Hudlikar, A., et al.",
    venue: "Investigative Ophthalmology & Visual Science, 67(7), 3582 (2026)",
  },
  {
    title: "A Novel Chaotic System for Text Encryption Optimized with Genetic Algorithm",
    authors: "Menon, U. M., Menon, A. R., Hudlikar, A., et al.",
    venue: "International Journal of Advanced Computer Science and Applications, 11(10) (2020)",
    doi: "10.14569/IJACSA.2020.0111005",
  },
  {
    title: "Scytale — An Evolutionary Cryptosystem",
    authors: "Menon, U., Hudlikar, A., & Panda, D.",
    venue: "International Journal of Computer Science and Network, 9(4), 153–159 (2020)",
    url: "https://arxiv.org/abs/2008.05290",
  },
  {
    title: "A Hybrid Autoencoder Architecture for Text Encryption",
    authors:
      "Menon, U., Menon, A. R., Hudlikar, A., Sharmila, A., & Mahalakshmi, P.",
    venue:
      "2021 Innovations in Power and Advanced Computing Technologies (i-PACT), pp. 1–7 (2021)",
    doi: "10.1109/i-PACT52855.2021.9696715",
  },
];
