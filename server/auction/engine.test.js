const {getIncrementForBid} = require("./engine");

const rules = [
    { upTo: 10000000, increment: 500000 },
  { upTo: 20000000, increment: 1000000 },
  { upTo: 50000000, increment: 2000000 },
  { upTo: 100000000, increment: 5000000 },
  { upTo: Infinity, increment: 10000000 }
];

test('returns lowest tier increment for a low bid',()=>{
    expect(getIncrementForBid(5000000,rules)).toBe(500000);
});

test('returns correct increment right at a tier boundary', () => {
    expect(getIncrementForBid(10000000, rules)).toBe(1000000);
});
  
test('returns highest tier increment for a very large bid', () => {
    expect(getIncrementForBid(500000000, rules)).toBe(10000000);
});
  
test('returns 0 if rules array is empty', () => {
    expect(getIncrementForBid(999999999, [])).toBe(0);
});