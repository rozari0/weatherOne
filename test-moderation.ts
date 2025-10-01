// Test script for Gemini-based content moderation
// Run with: npx tsx test-moderation.ts

import { moderateContentWithGemini } from './src/lib/gemini-moderation';

async function testModeration() {
  console.log('🧪 Testing Gemini-based Content Moderation\n');

  const testCases = [
    {
      name: 'Valid weather post',
      content: 'Beautiful sunny day today! Perfect weather for a picnic in the park. The temperature is just right at 75°F.'
    },
    {
      name: 'Spam content',
      content: 'BUY NOW! URGENT DEAL! Click here to make money fast! Limited time offer!!!'
    },
    {
      name: 'Inappropriate content',
      content: 'This is some inappropriate NSFW content that should be blocked.'
    },
    {
      name: 'Short content',
      content: 'Hi'
    },
    {
      name: 'Weather discussion',
      content: 'Has anyone noticed the unusual weather patterns this winter? The temperatures have been fluctuating quite a bit in my area.'
    },
    {
      name: 'Empty content',
      content: ''
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`Content: "${testCase.content}"`);
    
    try {
      const result = await moderateContentWithGemini(testCase.content);
      console.log(`✅ Result: ${result.isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
      console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(0)}%`);
      if (result.reason) {
        console.log(`📝 Reason: ${result.reason}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
  }

  console.log('\n🎉 Moderation testing complete!');
}

// Run the test if GEMINI_API_KEY is set
if (process.env.GEMINI_API_KEY) {
  testModeration().catch(console.error);
} else {
  console.log('⚠️  GEMINI_API_KEY not set. Skipping Gemini moderation tests.');
  console.log('The system will use fallback moderation when no API key is available.');
}