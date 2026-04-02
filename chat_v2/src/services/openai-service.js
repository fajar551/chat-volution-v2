import OpenAI from 'openai';
import apiKeyService from './api-key-service.js';

class OpenAIService {
  constructor() {
    this.client = null;
    this.threads = new Map();
    this.assistantId = 'asst_hKXiL8LD3dEMsjh48BOQvAyC';
    this.isInitialized = false;
  }

  async initializeClient() {
    try {
      if (this.isInitialized && this.client) {
        return this.client;
      }

      const apiKey = await apiKeyService.getApiKey('openai');

      this.client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      this.isInitialized = true;
      return this.client;
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      throw error;
    }
  }

  async generateResponse(phone, userMessage) {
    try {
      await this.initializeClient();

      const apiKey = await apiKeyService.getApiKey('openai');

      let threadId = this.threads.get(phone);
      if (!threadId) {
        const threadResponse = await fetch('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({})
        });

        const thread = await threadResponse.json();
        threadId = thread.id;
        this.threads.set(phone, threadId);
      }

      if (!threadId) {
        throw new Error('Failed to create or retrieve thread ID');
      }

      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: userMessage
        })
      });

      await messageResponse.json();

      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: this.assistantId
        })
      });

      const run = await runResponse.json();

      if (!threadId || !run.id) {
        throw new Error(`Invalid parameters - threadId: ${threadId}, runId: ${run.id}`);
      }

      let runStatus = run;
      let attempts = 0;
      const maxAttempts = 30;

      while (runStatus.status !== 'completed' && runStatus.status !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        runStatus = await statusResponse.json();
        attempts++;
      }

      if (runStatus.status === 'failed') {
        throw new Error(`Run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
      }

      if (attempts >= maxAttempts) {
        throw new Error('Run timeout - assistant took too long to respond');
      }

      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      const messages = await messagesResponse.json();

      const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
      if (assistantMessages.length === 0) {
        throw new Error('No assistant response found');
      }

      const latestMessage = assistantMessages[0];
      const aiResponse = latestMessage.content[0].text.value;

      return {
        success: true,
        response: aiResponse,
        messageId: `assistant_${Date.now()}_${phone}`,
        isOpenAI: true,
        threadId: threadId
      };

    } catch (error) {
      console.error('Error generating AI response:', error);

      let fallbackResponse;
      const userMessageLower = userMessage.toLowerCase();

      if (userMessageLower.includes('halo') || userMessageLower.includes('hai') || userMessageLower.includes('hi')) {
        fallbackResponse = 'Halo! Terima kasih sudah menghubungi kami. Ada yang bisa saya bantu?';
      } else if (userMessageLower.includes('terima kasih') || userMessageLower.includes('thanks')) {
        fallbackResponse = 'Sama-sama! Ada yang bisa saya bantu lagi?';
      } else if (userMessageLower.includes('harga') || userMessageLower.includes('price')) {
        fallbackResponse = 'Untuk informasi harga, silakan hubungi tim sales kami. Ada yang bisa saya bantu lainnya?';
      } else if (userMessageLower.includes('jam') || userMessageLower.includes('waktu')) {
        fallbackResponse = 'Kami buka 24/7 untuk melayani Anda. Ada yang bisa saya bantu?';
      } else {
        const fallbackResponses = [
          'Terima kasih atas pesan Anda. Tim kami akan segera merespons.',
          'Halo! Selamat datang. Bagaimana saya bisa membantu Anda hari ini?',
          'Terima kasih sudah menghubungi kami. Ada yang bisa saya bantu?',
          'Pesan Anda sudah diterima. Tim kami akan segera menghubungi Anda.'
        ];
        fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }

      return {
        success: true,
        response: fallbackResponse,
        messageId: `fallback_${Date.now()}_${phone}`,
        isFallback: true
      };
    }
  }

  async clearThread(phone) {
    const threadId = this.threads.get(phone);
    if (threadId) {
      try {
        await this.client.beta.threads.del(threadId);
      } catch (error) {
        console.error('Error deleting thread:', error);
      }
    }
    this.threads.delete(phone);
  }

  getThreadId(phone) {
    return this.threads.get(phone);
  }

  setThreadId(phone, threadId) {
    this.threads.set(phone, threadId);
  }

  getAllThreads() {
    return Array.from(this.threads.entries());
  }
}

const openaiService = new OpenAIService();
export default openaiService;