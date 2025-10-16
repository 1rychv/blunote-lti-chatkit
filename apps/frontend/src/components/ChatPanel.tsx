import { useState, useRef, useEffect } from 'react';
import { sendMessage, ChatResponse } from '../lib/api';
import { Card, Col, Row, Text, Divider, Button, Spacer } from './ui';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  userId: string;
  courseId: string;
  role: 'student' | 'instructor';
  initialMessage?: string;
}

export function ChatPanel({ userId, courseId, role, initialMessage }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitialMessage = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage && !hasSentInitialMessage.current) {
      handleSendMessage(initialMessage);
      hasSentInitialMessage.current = true;
    }
  }, [initialMessage]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await sendMessage({
        message: text,
        user_id: userId,
        course_id: courseId,
        role,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card size="md">
      <Col gap={3}>
        <Row>
          <Text value="BluNote Assistant" size="md" weight="semibold" />
        </Row>

        <Divider />

        {/* Messages Area */}
        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '8px 0',
          }}
        >
          {messages.length === 0 && (
            <Text
              value="Ask me anything about your course! I'm here to help."
              size="sm"
              color="secondary"
            />
          )}
          {messages.map(message => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: message.role === 'user' ? '#2563eb' : '#f3f4f6',
                  color: message.role === 'user' ? '#fff' : '#111827',
                }}
              >
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>
                  {message.content}
                </p>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  marginTop: '4px',
                }}
              >
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#9ca3af',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                BluNote is thinking...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <Divider />

        {/* Input Area */}
        <Col gap={2}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: '14px',
              minHeight: '60px',
              boxSizing: 'border-box',
            }}
          />
          <Row>
            <Spacer />
            <Button
              label={isLoading ? 'Sending...' : 'Send'}
              style="primary"
              iconStart="mail"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
            />
          </Row>
        </Col>
      </Col>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </Card>
  );
}
