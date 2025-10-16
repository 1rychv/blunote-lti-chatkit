import { ChatKit, useChatKit } from '@openai/chatkit-react';

interface ChatKitWidgetProps {
  userId?: string;
  courseId?: string;
  role?: string;
  className?: string;
}

export function ChatKitWidget({ userId, courseId, role, className = 'h-[600px] w-[320px]' }: ChatKitWidgetProps) {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // Implement session refresh if needed
          // For now, we'll create a new session
        }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatkit/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            courseId,
            role,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to create ChatKit session: ${res.statusText}`);
        }

        const data = await res.json();
        return data.client_secret;
      },
    },
  });

  return <ChatKit control={control} className={className} />;
}
