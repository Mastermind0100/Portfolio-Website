const resumeContextTerms =
  /\b(?:atharva|he|him|his|resume|profile|portfolio|education|degree|university|school|stud(?:y|ies|ied)|experience|career|employer|project|publication|paper|skill|expertise|research|achievement|award|intern(?:ship)?|robot(?:ics)?|llm|rag|retrieval|agentic|multimodal|computer vision|machine learning|artificial intelligence)\b/i;

export function isResumeRelatedQuestion(question: string): boolean {
  return resumeContextTerms.test(question);
}
