export type Bit = 0 | 1;

export type ModuleDef = {
  key: string;
  options: readonly string[];
};

export type SchemaMapEntry = {
  key: string;
  offset: number;
  options: readonly string[];
  optionIndexByNormalized: Record<string, number>;
};

export type SchemaMapLayout = {
  totalOptionCount: number;
  entries: SchemaMapEntry[];
  modulesByKey: Record<string, SchemaMapEntry>;
};

// Inputted Profile
export type ProfileInput = {
  modules: Array<{
    id: number;
    type: string;
    title: string;
    gridX: number;
    gridY: number;
    gridWidth: number;
    gridHeight: number;
    visible?: boolean;
    data: Array<{
      id: number;
      content?: string;
      selectedOption?: string;
    }>;
  }>;
};

export const ModuleMap: readonly ModuleDef[] = [
  {
    key: "favoriteFood",
    options: [
      "Pizza",
      "Sushi",
      "Burgers",
      "Tacos",
      "Pasta",
      "Salad",
      "Stir Fry",
      "Sandwiches",
    ],
  },
  {
    key: "loveLanguage",
    options: [
      "Words of Affirmation",
      "Acts of Service",
      "Receiving Gifts",
      "Quality Time",
      "Physical Touch",
    ],
  },
  {
    key: "zodiacSign",
    options: [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ],
  },
  {
    key: "purdueFavorite",
    options: [
      "Campus",
      "Sports",
      "Academics",
      "Social Life",
      "Clubs",
      "Research",
      "Traditions",
      "People",
    ],
  },
  {
    key: "diningHall",
    options: [
      "Earhart",
      "Wiley",
      "Ford",
      "Hillenbrand",
      "Windsor",
      "They all suck",
    ],
  },
  {
    key: "residence",
    options: [
      "Cary",
      "Earhart",
      "First Street Towers",
      "Harrison",
      "Hawkins",
      "Hillenbrand",
      "Honors College",
      "McCutcheon",
      "Meredith",
      "Owen",
      "Shreve",
      "Tarkington",
      "Third Street Suites",
      "Wiley",
      "Windsor",
      "Off-Campus",
    ],
  },
  {
    key: "hometown",
    options: [
      "Indiana",
      "Midwest",
      "East Coast",
      "West Coast",
      "South",
      "International",
      "Chicago Area",
      "Indy Area",
    ],
  },
  {
    key: "studySpot",
    options: [
      "WALC",
      "Hicks",
      "STEW",
      "MATH",
      "My Room",
      "Coffee Shop",
      "Library",
      "KRACH",
      "Lawson",
    ],
  },
  {
    key: "coffeeOrder",
    options: [
      "Black Coffee",
      "Latte",
      "Cappuccino",
      "Iced Coffee",
      "Espresso",
      "Frappuccino",
      "Tea",
      "I don't drink coffee",
    ],
  },
  {
    key: "weekendActivity",
    options: [
      "Go Out",
      "Stay In",
      "Explore Lafayette",
      "Sleep",
      "Study",
      "Workout",
      "Hang with Friends",
      "Netflix",
    ],
  },
  {
    key: "morningPerson",
    options: [
      "Morning Person",
      "Night Owl",
      "Afternoon Person",
      "Always Tired",
    ],
  },
  {
    key: "exercisePreference",
    options: [
      "Cardio",
      "Weightlifting",
      "Sports",
      "Yoga",
      "Running",
      "Cycling",
      "Swimming",
      "I don't work out",
    ],
  },
  {
    key: "purdueSpirit",
    options: [
      "Everything",
      "Football Season",
      "Basketball Season",
      "School Pride",
      "Community",
      "Tradition",
      "Winning",
    ],
  },
  {
    key: "favoriteSport",
    options: [
      "Football",
      "Basketball",
      "Volleyball",
      "Soccer",
      "Wrestling",
      "Swimming",
      "Track",
      "I don't watch sports",
    ],
  },
  {
    key: "musicGenre",
    options: [
      "Pop",
      "Hip Hop",
      "Rock",
      "Country",
      "EDM",
      "Indie",
      "R&B",
      "Classical",
      "Everything",
    ],
  },
  {
    key: "movieGenre",
    options: [
      "Action",
      "Comedy",
      "Drama",
      "Horror",
      "Sci-Fi",
      "Romance",
      "Thriller",
      "Documentary",
      "Animated",
    ],
  },
  {
    key: "stressRelief",
    options: [
      "Exercise",
      "Sleep",
      "Eat",
      "Talk to Friends",
      "Watch TV",
      "Listen to Music",
      "Go for a Walk",
      "Cry",
    ],
  },
  {
    key: "petPreference",
    options: [
      "Dog Person",
      "Cat Person",
      "Both",
      "Neither",
      "Reptile Person",
      "Bird Person",
    ],
  },
  {
    key: "travelStyle",
    options: [
      "Beach",
      "Mountains",
      "City",
      "Road Trip",
      "Camping",
      "International",
      "Staycation",
      "Adventure",
    ],
  },
  { key: "phoneChoice", options: ["iPhone", "Android", "Other"] },
  {
    key: "socialMedia",
    options: [
      "Instagram",
      "TikTok",
      "Snapchat",
      "Twitter/X",
      "Clash Royale",
      "LinkedIn",
      "Facebook",
      "Reddit",
      "YouTube",
    ],
  },
  {
    key: "sleepSchedule",
    options: [
      "Before 10pm",
      "10pm-12am",
      "12am-2am",
      "After 2am",
      "Whenever I Can",
      "All Day",
    ],
  },
  {
    key: "campusTransport",
    options: [
      "Walking",
      "Bike",
      "Scooter",
      "Bus",
      "Car",
      "Skateboard",
      "Longboard",
    ],
  },
  { key: "seasonPreference", options: ["Spring", "Summer", "Fall", "Winter"] },
  {
    key: "internshipStatus",
    options: [
      "Have One Lined Up",
      "Currently Searching",
      "Not Looking Yet",
      "Have Had Multiple",
      "Not Interested",
    ],
  },
  {
    key: "careerGoal",
    options: [
      "Industry Job",
      "Grad School",
      "Start a Business",
      "Travel",
      "Undecided",
      "Research",
      "Government",
    ],
  },
  {
    key: "groupProject",
    options: [
      "Leader",
      "Organizer",
      "Worker",
      "Creative",
      "Procrastinator",
      "Communicator",
      "Free Rider (jk)",
    ],
  },
  {
    key: "examStrategy",
    options: [
      "Study Days in Advance",
      "All-Nighter",
      "Study Groups",
      "Practice Problems",
      "Review Notes",
      "Wing It",
      "Panic",
    ],
  },
  {
    key: "courseLoad",
    options: [
      "12-14 Credits",
      "15-16 Credits",
      "17-18 Credits",
      "19+ Credits",
      "Part-Time",
    ],
  },
  {
    key: "clubInvolvement",
    options: [
      "Multiple Clubs",
      "One Main Club",
      "Greek Life",
      "Sports Team",
      "Research",
      "Job",
      "Not Much",
      "Everything",
    ],
  },
  {
    key: "foodieLevel",
    options: [
      "Master Chef",
      "Pretty Good",
      "Basic",
      "Microwave Expert",
      "Ramen Only",
      "Can't Cook",
    ],
  },
  {
    key: "purdueMemory",
    options: [
      "Football Game",
      "Basketball Game",
      "Grand Prix",
      "Friend Moments",
      "Academic Achievement",
      "Club Event",
      "First Day",
      "Homecoming",
    ],
  },
  {
    key: "breakfastHabit",
    options: [
      "Never Skip",
      "Sometimes Eat",
      "Coffee Only",
      "Skip It",
      "Big Meal",
      "Grab and Go",
    ],
  },
  {
    key: "libraryNoise",
    options: [
      "Complete Silence",
      "White Noise",
      "Music",
      "Background Chatter",
      "Anything Works",
      "TV On",
    ],
  },
  {
    key: "procrastination",
    options: [
      "Plan Ahead",
      "Slight Procrastinator",
      "Major Procrastinator",
      "Last Minute Hero",
      "Deadline is Tomorrow?!",
    ],
  },
  {
    key: "purdueBuilding",
    options: [
      "WALC",
      "Union",
      "STEW",
      "ARMS",
      "LILY",
      "HSSE",
      "MATH",
      "PHYS",
      "CIVL",
      "ME",
      "CL50",
      "LWSN",
    ],
  },
  {
    key: "relationshipStatus",
    options: [
      "Single",
      "Taken",
      "Complicated",
      "Talking to Someone",
      "Situationship",
      "Married to My Studies",
    ],
  },
] as const;
