import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ParaphraseOptions {
  originalCaption: string;
  profileUsername: string;
  sampleCaptions: string[];
}

export async function paraphraseCaption(options: ParaphraseOptions): Promise<string> {
  const { originalCaption, profileUsername, sampleCaptions } = options;

  try {
    const sampleCaptionsText = sampleCaptions.slice(0, 10).join('\n---\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing and mimicking social media writing styles. Your task is to paraphrase Instagram captions while maintaining the unique voice, tone, lingo, and style of @${profileUsername}. 

Study their writing patterns including:
- Word choice and vocabulary
- Sentence structure and length
- Use of emojis, hashtags, and punctuation
- Tone (casual, professional, playful, etc.)
- Common phrases or expressions
- Formatting patterns

Create a natural paraphrase that sounds like it came from the same person, but with different wording.`,
        },
        {
          role: "user",
          content: `Here are sample captions from @${profileUsername} to learn their style from:

${sampleCaptionsText}

---

Now paraphrase this caption in @${profileUsername}'s style:

${originalCaption}

Return ONLY the paraphrased caption, nothing else. Keep it natural and authentic to their voice.`,
        },
      ],
      max_completion_tokens: 500,
    });

    return response.choices[0].message.content?.trim() || originalCaption;
  } catch (error) {
    console.error('Caption paraphrasing error:', error);
    // Fallback to original caption if paraphrasing fails
    return originalCaption;
  }
}

export async function analyzeProfileStyle(captions: string[]): Promise<{
  tone: string;
  commonWords: string[];
  avgLength: number;
  emojiUsage: boolean;
  hashtagStyle: string;
}> {
  try {
    const captionsText = captions.slice(0, 20).join('\n---\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a social media analyst. Analyze the writing style of these Instagram captions and return a JSON object with: tone (string), commonWords (array of 5-10 frequently used words), avgLength (number), emojiUsage (boolean), hashtagStyle (string: 'minimal', 'moderate', 'heavy').",
        },
        {
          role: "user",
          content: captionsText,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Style analysis error:', error);
    return {
      tone: 'casual',
      commonWords: [],
      avgLength: 100,
      emojiUsage: false,
      hashtagStyle: 'moderate',
    };
  }
}
