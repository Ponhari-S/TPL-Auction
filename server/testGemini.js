require('dotenv').config();
const {getRating,ratingToPool} = require('./gemini/rating');


const testPlayer = {
  role: 'batsman',
  stats: { matches: 45, runs: 1800, average: 42.5, strikeRate: 138.2, wickets: 0 }
};

const run = async () =>{
  const rating = await getRating(testPlayer);
  const pool = ratingToPool(rating);
  console.log(`Rating: ${rating}, Pool: ${pool}`);
}

run();