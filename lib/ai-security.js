const MAX_CHAT_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 4000

function validateChatContext(input) {
  if (!Array.isArray(input)) {
    throw new Error('chat context must be an array')
  }

  if (input.length > MAX_CHAT_MESSAGES) {
    throw new Error('too many messages')
  }

  return input.map((message) => {
    if (!message || typeof message !== 'object') {
      throw new Error('each message must be an object')
    }

    if (message.role === 'system') {
      throw new Error('system messages are not accepted')
    }

    if (message.role !== 'user' && message.role !== 'assistant') {
      throw new Error('unsupported message role')
    }

    if (typeof message.content !== 'string' || message.content.trim() === '') {
      throw new Error('message content must be a non-empty string')
    }

    if (message.content.length > MAX_MESSAGE_LENGTH) {
      throw new Error('message content is too long')
    }

    return {
      role: message.role,
      content: message.content.trim(),
    }
  })
}

module.exports = {
  validateChatContext,
}
