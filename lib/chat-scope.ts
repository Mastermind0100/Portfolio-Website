const resumeContextTerms =
  /\b(?:atharva|he|him|his|resume|profile|portfolio|education|degree|university|school|stud(?:y|ies|ied)|experience|career|employer|project|publication|paper|skill|expertise|research|achievement|award|intern(?:ship)?|robot(?:ics)?|llm|rag|retrieval|agentic|multimodal|computer vision|machine learning|artificial intelligence)\b/i;

const smallTalkReplies = [
  {
    pattern:
      /^(?:hi|hello|hey|howdy|good morning|good afternoon|good evening)(?: there)?$/,
    reply:
      "Hi! I’m Atharva’s portfolio assistant. What would you like to know about his experience, projects, education, or skills?",
  },
  {
    pattern:
      /^(?:(?:you know )?you(?:'re| are) (?:awesome|great|amazing|wonderful|fantastic|the best|so helpful)(?: right)?|(?:you(?:'re| are) )?(?:a )?(?:great|awesome|amazing) (?:assistant|bot|chatbot))$/,
    reply:
      "Thank you! I’m here as Atharva’s portfolio assistant. What would you like to know about his experience, projects, education, or skills?",
  },
  {
    pattern:
      /^(?:thanks?(?: so much| a lot)?|thank you(?: so much| very much)?|i appreciate it|much appreciated)$/,
    reply:
      "You’re welcome! I can help with questions about Atharva’s experience, projects, education, or skills.",
  },
  {
    pattern:
      /^(?:how are you(?: doing)?|how(?:'s| is) it going|how(?:'s| is) your day(?: going)?|what(?:'s| is) up|what are you up to|how do you do)$/,
    reply:
      "I’m here to help with Atharva’s portfolio. What would you like to know about his profile?",
  },
  {
    pattern:
      /^(?:bye|goodbye|see you(?: later)?|take care|have a (?:good|great|nice) day)$/,
    reply:
      "Thanks for stopping by! Feel free to ask about Atharva’s experience, projects, education, or skills.",
  },
];

export function getSmallTalkReply(message: string): string | undefined {
  const normalizedMessage = message
    .trim()
    .replace(/[.!?]+$/, "")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase();

  return smallTalkReplies.find(({ pattern }) => pattern.test(normalizedMessage))
    ?.reply;
}

export function isResumeRelatedQuestion(question: string): boolean {
  return resumeContextTerms.test(question);
}
