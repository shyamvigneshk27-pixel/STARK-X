export interface StreamOptions {
  tripId: string;
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  onChunk: (text: string) => void;
  onError: (error: string) => void;
  onItinerarySaved: () => void;
  onDone: () => void;
}

export async function streamAriaResponse(options: StreamOptions) {
  const { tripId, message, history, onChunk, onError, onItinerarySaved, onDone } = options;

  try {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/aria/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tripId, message, history }),
    });

    if (!res.ok) {
      let errText = 'Failed to get ARIA response';
      try {
        const errJson = await res.json();
        errText = errJson.error || errText;
      } catch {
        // ignore
      }
      throw new Error(errText);
    }

    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep the last incomplete chunk in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.slice(6);

        if (dataStr === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === 'chunk') {
            onChunk(parsed.content);
          } else if (parsed.type === 'itinerary_saved') {
            onItinerarySaved();
          } else if (parsed.type === 'error') {
            onError(parsed.content);
          }
        } catch (e) {
          console.error('Failed to parse SSE JSON', e, dataStr);
        }
      }
    }

    onDone();
  } catch (error: any) {
    onError(error.message || 'Network error');
  }
}
