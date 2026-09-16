export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export function validateChatContext(input: unknown): ChatMessage[]
