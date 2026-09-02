const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildPrompt = (player) => {
  const { role, stats } = player;

  let statLines = '';
  let guidance = '';

  if (role === 'batsman' || role === 'wicketkeeper') {
    statLines = `
Matches: ${stats.matches}
Runs: ${stats.runs}
Batting Average: ${stats.average}
Strike Rate: ${stats.strikeRate}`;
    guidance = `Judge this player purely as a batter. Prioritize batting average and strike rate as the strongest signals of quality, with total runs and matches indicating consistency and experience. Ignore bowling entirely.`;
  } else if (role === 'bowler') {
    statLines = `
Matches: ${stats.matches}
Wickets: ${stats.wickets}
Bowling Average: ${stats.average}`;
    guidance = `Judge this player purely as a bowler. Prioritize wickets taken and bowling average (lower average is better) as the strongest signals of quality, with matches indicating experience. Ignore batting entirely.`;
  } else if (role === 'all-rounder') {
    statLines = `
Matches: ${stats.matches}
Runs: ${stats.runs}
Batting Average: ${stats.average}
Strike Rate: ${stats.strikeRate}
Wickets: ${stats.wickets}`;
    guidance = `Judge this player as an all-rounder. Weigh both batting (runs, batting average, strike rate) and bowling (wickets) roughly equally — a genuinely strong all-rounder contributes meaningfully in both disciplines, not just one.`;
  }

  return `
You are a cricket analyst rating a player for a fantasy auction. Give an overall rating from 1 to 10, where 10 is an elite, must-buy player and 1 is a very weak player.

Role: ${role}
${guidance}

Player stats:${statLines}

Respond with ONLY a single integer from 1 to 10. No words, no explanation, no punctuation — just the number.
  `.trim();
};

  const getRating = async (player) => {
    const model = genAI.getGenerativeModel({model: 'gemini-3.5-flash-lite'});
    const prompt = buildPrompt(player);
    const result =  await model.generateContent(prompt);
    const text = result.response.text().trim();
    const rating = parseInt(text,10);

    if (isNaN(rating) || rating < 1 || rating > 10) {
        throw new Error(`Unexpected Gemini response: "${text}"`);
    }

    return rating;
}

const ratingToPool = (rating) => {
    if (rating >= 8) return 'marquee';
    if (rating >= 4) return 'elite';
    return 'rookie';
};

module.exports = { ratingToPool, getRating };