export const organizer = {
  name: "Tidewater Cornhole",
  balance: 12784.42,
  available: 9355.18,
  spent: 3019.24,
  withdrawn: 410.0,
};

export const events = [
  {
    name: "Virginia Beach Open",
    slug: "virginia-beach-open",
    date: "Oct 24, 2026",
    paid: 128,
    capacity: 128,
    collected: 6400,
    status: "Sold out",
  },
  {
    name: "Fall League",
    slug: "fall-league",
    date: "Nov 7, 2026",
    paid: 93,
    capacity: 100,
    collected: 4650,
    status: "Open",
  },
  {
    name: "Weekly Blind Draw",
    slug: "weekly-blind-draw",
    date: "Sep 30, 2026",
    paid: 31,
    capacity: 40,
    collected: 620,
    status: "Open",
  },
];

export const transactions = [
  { merchant: "Virginia Beach Field House", meta: "Venue deposit", amount: -750, date: "Today" },
  { merchant: "Meta", meta: "Event advertising", amount: -125, date: "Yesterday" },
  { merchant: "Marriott", meta: "Staff hotel", amount: -486.24, date: "Sep 24" },
  { merchant: "Virginia Beach Open", meta: "Registration payment", amount: 50, date: "Sep 24" },
  { merchant: "Virginia Beach Open", meta: "Registration payment", amount: 50, date: "Sep 24" },
];
