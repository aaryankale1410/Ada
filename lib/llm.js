/**
 * Gemini 2.5 Flash LLM integration — JS port of llm.py.
 * Server-only — uses GEMINI_API_KEY env var.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = 'gemini-2.5-flash-lite';

async function generate(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error('LLM Error:', e);
    return 'Abhi AI thoda busy hai, baad mein try karo! 😅';
  }
}

// ─── OPEN WHEN ───

export async function openWhenSad() {
  return generate(
    'You are writing a short, heartfelt message for someone\'s girlfriend who is feeling sad. ' +
    'Write ONE sentence that is funny, sweet, comforting, and makes her feel loved and safe. ' +
    'It should feel like a warm hug in words and it should be funny. Use simple English. ' +
    'Don\'t use quotes. Don\'t label it. Just the message. Keep it under 20 words. ' +
    'Be genuine, not cheesy. Make it feel personal, like her boyfriend Aaryan wrote it for Akshada.'
  );
}

export async function openWhenMissMe() {
  return generate(
    'You are writing a short, funny, sweet message for someone\'s girlfriend who is missing her boyfriend. ' +
    'Write ONE sentence that is funny, comforting, romantic, and reassuring. ' +
    'It should make her smile through the longing. Use simple English. ' +
    'Don\'t use quotes. Don\'t label it. Just the message. Keep it under 20 words. ' +
    'Make it feel like Aaryan is right there with Akshada even when apart.'
  );
}

export async function openWhenCantSleep() {
  return generate(
    'You are writing a short, cute and playful bedtime message for someone\'s girlfriend who can\'t sleep. ' +
    'Write ONE sentence that is adorable, slightly funny, and soothing. ' +
    'It should make her giggle and then feel sleepy. Use simple English. ' +
    'Don\'t use quotes. Don\'t label it. Just the message. Keep it under 20 words. ' +
    'Make it feel like a cute goodnight text from Aaryan to Akshada.'
  );
}

export const OPEN_WHEN_HANDLERS = {
  sad: openWhenSad,
  'miss-me': openWhenMissMe,
  'cant-sleep': openWhenCantSleep,
};

// ─── PERIOD TRACKER ───

export async function periodComment(daysSince, daysUntil) {
  const prompt =
    `You're a cheeky, funny relationship advisor for a couple — Aaryan (boyfriend) and Akshada (girlfriend). ` +
    `Akshada's last period was ${daysSince} days ago. Her next period is expected in ${daysUntil} days. ` +
    `Give TWO separate one-sentence responses:\n` +
    `1. FOR HER (Akshada): A caring but funny tip about her cycle. Be sweet but humorous.\n` +
    `2. FOR HIM (Aaryan): A hilarious survival tip. Be dramatic and funny.\n` +
    `Format EXACTLY as:\nHER: [message]\nHIM: [message]\n Keep each under 15 words. Be genuinely funny, not cringe.`;

  const response = await generate(prompt);
  const lines = response.trim().split('\n');
  let herMsg = 'Take care of yourself, queen! 👑';
  let himMsg = 'Bhai, chocolate leke ready reh! 🍫';
  for (const line of lines) {
    const t = line.trim();
    if (t.toUpperCase().startsWith('HER:')) herMsg = t.slice(4).trim();
    else if (t.toUpperCase().startsWith('HIM:')) himMsg = t.slice(4).trim();
  }
  return { for_her: herMsg, for_him: himMsg };
}

// ─── LAST MET ───

export async function lastMetComment(daysSince) {
  let prompt;
  if (daysSince === 0) {
    prompt =
      'You\'re a dramatic Bollywood narrator. Aaryan and Akshada just met today! ' +
      'Give ONE sentence dramatic/funny congratulations in Hinglish. ' +
      'Be over-the-top filmy and excited. Keep under 20 words. No quotes.';
  } else {
    const tone =
      daysSince < 7 ? 'Be mildly concerned.' :
      daysSince < 14 ? 'Be very dramatic and worried.' :
      'Act like this is a national crisis.';
    prompt =
      `You're a dramatic Bollywood narrator observing couple Aaryan and Akshada. ` +
      `They last met ${daysSince} days ago. ` +
      `Give ONE sentence dramatic/funny commentary in Hinglish about how long it's been. ` +
      `${tone} Keep under 20 words. No quotes.`;
  }
  return generate(prompt);
}

// ─── LAST SPECIAL NIGHT ───

export async function lastSpecialComment(daysSince) {
  let prompt;
  if (daysSince === 0) {
    prompt =
      'You\'re a cheeky friend who knows too much. Aaryan and Akshada just had a special night tonight! ' +
      'Give ONE sentence cheeky/funny congratulations in Hinglish. ' +
      'Keep it PG-13 but suggestive. Under 20 words. No quotes.';
  } else {
    const tone =
      daysSince < 14 ? 'Mildly teasing.' :
      daysSince < 30 ? 'Dramatically concerned.' :
      'Act like you are filing a missing report.';
    prompt =
      `You're a cheeky friend who knows too much about couple Aaryan and Akshada. ` +
      `Their last intimate/special night was ${daysSince} days ago. ` +
      `Give ONE sentence cheeky/funny commentary in Hinglish. ` +
      `${tone} Keep it PG-13 but suggestive. Under 20 words. No quotes.`;
  }
  return generate(prompt);
}

// ─── FOOD SUGGESTER ───

export async function suggestFood(foodHistory) {
  const recentMeals = foodHistory.slice(-10);
  const historyStr = recentMeals.length
    ? recentMeals.map((meal) => meal.join(' + ')).join(', ')
    : 'No recent meals recorded';

  const prompt =
    `You are a food decider for a couple — Aaryan and Akshada. ` +
    `They live in Thane. They eat street food mostly. ` +
    `She likes sada dosa and pani puri. They also eat omlette paav, ragda patice, ` +
    `manchurian bhel, manchurian rice, chicken momos. They rarely go to Taco Bell and KFC. ` +
    `\n\nRecent meals they've had: ${historyStr}` +
    `\n\nSuggest 2-3 items they should eat today. ` +
    `Consider what they haven't eaten recently. ` +
    `Response in a funny way. ` +
    `Format each suggestion on a new line with an emoji. ` +
    `Keep the total response under 50 words. Be creative and funny.`;

  return generate(prompt);
}
