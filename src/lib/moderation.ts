// Simple content moderation utility
// In a production app, you'd want to use more sophisticated services like OpenAI Moderation API

const SPAM_KEYWORDS = [
  'buy now', 'click here', 'free money', 'urgent', 'limited time',
  'act now', 'call now', 'earn money', 'make money fast', 'get rich',
  'guaranteed', 'no questions asked', 'risk free', 'cash bonus',
  'credit card', 'loan', 'debt', 'insurance', 'pharmacy'
];

const NSFW_KEYWORDS = [
  // Add appropriate keywords for your use case
  // This is a minimal example - in production you'd want a more comprehensive list
  'explicit', 'adult content', 'nsfw'
];

const PROFANITY_KEYWORDS = [
  // Add profanity keywords as needed
  // This is a minimal example
];

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  confidence: number;
}

export function moderateContent(content: string): ModerationResult {
  const lowerContent = content.toLowerCase();
  
  // Check for empty content
  if (!content.trim()) {
    return {
      isAllowed: false,
      reason: 'Content cannot be empty',
      confidence: 1.0
    };
  }

  // Check minimum length
  if (content.trim().length < 5) {
    return {
      isAllowed: false,
      reason: 'Content too short',
      confidence: 1.0
    };
  }

  // Check maximum length
  if (content.length > 2000) {
    return {
      isAllowed: false,
      reason: 'Content too long (max 2000 characters)',
      confidence: 1.0
    };
  }

  // Check for spam keywords
  const spamMatches = SPAM_KEYWORDS.filter(keyword => 
    lowerContent.includes(keyword)
  );
  
  if (spamMatches.length > 0) {
    return {
      isAllowed: false,
      reason: 'Content appears to be spam',
      confidence: 0.8
    };
  }

  // Check for NSFW content
  const nsfwMatches = NSFW_KEYWORDS.filter(keyword => 
    lowerContent.includes(keyword)
  );
  
  if (nsfwMatches.length > 0) {
    return {
      isAllowed: false,
      reason: 'Content contains inappropriate material',
      confidence: 0.9
    };
  }

  // Check for excessive capitalization (potential spam)
  const uppercaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (uppercaseRatio > 0.7 && content.length > 20) {
    return {
      isAllowed: false,
      reason: 'Excessive use of capital letters',
      confidence: 0.6
    };
  }

  // Check for repeated characters (potential spam)
  const repeatedChars = /(.)\1{4,}/g;
  if (repeatedChars.test(content)) {
    return {
      isAllowed: false,
      reason: 'Contains excessive repeated characters',
      confidence: 0.7
    };
  }

  // Content passes basic moderation
  return {
    isAllowed: true,
    confidence: 0.9
  };
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