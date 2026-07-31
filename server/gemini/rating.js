const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildPrompt = (player) => {
    return `
  You are a cricket analyst rating a player for a fantasy auction. Based on the stats below, give an overall rating from 1 to 10, where 10 is an elite, must-buy player and 1 is a very weak player.
  
  Consider the player's role when judging — for example, a bowler's batting average matters far less than their bowling average and wickets, and vice versa for a pure batsman. An all-rounder should be judged on both disciplines combined.
  
  Player details:
  Role: ${player.role}
  Matches: ${player.stats.matches}
  Runs: ${player.stats.runs}
  Batting Average: ${player.stats.average}
  Strike Rate: ${player.stats.strikeRate}
  Wickets: ${player.stats.wickets}
  
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