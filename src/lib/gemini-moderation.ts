// Gemini API-based content moderation utility

export interface GeminiModerationResult {
  isAllowed: boolean;
  reason?: string;
  confidence: number;
  details?: {
    isSpam: boolean;
    isNSFW: boolean;
    isProfane: boolean;
    isHarassment: boolean;
    toxicityScore: number;
  };
}

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  confidence: number;
}

// Fallback moderation for when Gemini is not available
function fallbackModeration(content: string): ModerationResult {
  // Basic validation
  if (!content.trim()) {
    return {
      isAllowed: false,
      reason: 'Content cannot be empty',
      confidence: 1.0
    };
  }

  if (content.trim().length < 5) {
    return {
      isAllowed: false,
      reason: 'Content too short',
      confidence: 1.0
    };
  }

  if (content.length > 2000) {
    return {
      isAllowed: false,
      reason: 'Content too long (max 2000 characters)',
      confidence: 1.0
    };
  }

  // Allow content with basic fallback validation
  return {
    isAllowed: true,
    confidence: 0.5 // Lower confidence since it's just basic validation
  };
}

export async function moderateContentWithGemini(content: string): Promise<ModerationResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  
  // If no Gemini key, use fallback
  if (!geminiKey) {
    console.log('No GEMINI_API_KEY configured; using fallback moderation');
    return fallbackModeration(content);
  }

  try {
    // First do basic validation
    const basicValidation = fallbackModeration(content);
    if (!basicValidation.isAllowed) {
      return basicValidation;
    }

    // Prepare the moderation prompt
    const prompt = `You are a content moderation system for a weather community website. Analyze the following user-generated content and determine if it should be allowed.

Consider these criteria:
1. Is it spam or promotional content?
2. Does it contain NSFW/inappropriate content?
3. Does it contain profanity or offensive language?
4. Does it contain harassment or hate speech?
5. Is it relevant to a weather/climate community?
6. Rate toxicity on a scale of 0-1 (0 = not toxic, 1 = very toxic)

Content to analyze:
"${content}"

Respond ONLY with a JSON object in this exact format:
{
  "isAllowed": boolean,
  "reason": "brief explanation if not allowed",
  "confidence": number (0-1),
  "isSpam": boolean,
  "isNSFW": boolean,
  "isProfane": boolean,
  "isHarassment": boolean,
  "toxicityScore": number (0-1)
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.1, // Low temperature for consistent moderation
            maxOutputTokens: 200
          }
        })
      }
    );

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status}`);
      return fallbackModeration(content);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('No response from Gemini API');
      return fallbackModeration(content);
    }

    // Parse the JSON response
    try {
      // Clean the response (remove markdown formatting if present)
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const moderationResult = JSON.parse(cleanedText);

      // Validate the response structure
      if (typeof moderationResult.isAllowed !== 'boolean') {
        throw new Error('Invalid response format from Gemini');
      }

      return {
        isAllowed: moderationResult.isAllowed,
        reason: moderationResult.reason,
        confidence: Math.min(1.0, Math.max(0.0, moderationResult.confidence || 0.8))
      };

    } catch (parseError) {
      console.error('Failed to parse Gemini moderation response:', parseError);
      console.error('Raw response:', generatedText);
      return fallbackModeration(content);
    }

  } catch (error) {
    console.error('Gemini moderation error:', error);
    return fallbackModeration(content);
  }
}

export function moderateEmail(email: string): ModerationResult {
  if (!email) {
    // Email is optional, so empty is allowed
    return {
      isAllowed: true,
      confidence: 1.0
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isAllowed: false,
      reason: 'Invalid email format',
      confidence: 1.0
    };
  }

  // Check for suspicious domains (optional)
  const suspiciousDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain && suspiciousDomains.includes(domain)) {
    return {
      isAllowed: false,
      reason: 'Temporary email addresses not allowed',
      confidence: 0.8
    };
  }

  return {
    isAllowed: true,
    confidence: 1.0
  };
}

export function moderateName(name: string): ModerationResult {
  if (!name.trim()) {
    return {
      isAllowed: false,
      reason: 'Name cannot be empty',
      confidence: 1.0
    };
  }

  if (name.length > 100) {
    return {
      isAllowed: false,
      reason: 'Name too long (max 100 characters)',
      confidence: 1.0
    };
  }

  // Check for obvious fake names or spam
  const spamNames = ['test', 'admin', 'anonymous', 'user', 'name'];
  if (spamNames.includes(name.toLowerCase().trim())) {
    return {
      isAllowed: false,
      reason: 'Please use a real name',
      confidence: 0.7
    };
  }

  return {
    isAllowed: true,
    confidence: 1.0
  };
}