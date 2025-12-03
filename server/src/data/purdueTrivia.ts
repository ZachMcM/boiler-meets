export interface TriviaQuestion {
  id: number;
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correctIndex: number;
  category: string;
}

export const purdueTrivia: TriviaQuestion[] = [
  // HISTORY (50 questions)
  {
    id: 1,
    question: "What year was Purdue University founded?",
    type: "multiple_choice",
    options: ["1865", "1869", "1874", "1880"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 2,
    question: "Who was Purdue University named after?",
    type: "multiple_choice",
    options: ["John Purdue", "Edward Purdue", "Robert Purdue", "James Purdue"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 3,
    question: "John Purdue donated $150,000 to establish the university.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 4,
    question: "Which famous astronaut was a Purdue alumnus and walked on the moon?",
    type: "multiple_choice",
    options: ["Buzz Aldrin", "Neil Armstrong", "Eugene Cernan", "Alan Shepard"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 5,
    question: "Purdue was the first university to offer credit for flight training.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 6,
    question: "What was Purdue's first president's name?",
    type: "multiple_choice",
    options: ["Richard Owen", "Emerson White", "Abraham Shortridge", "James Smart"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 7,
    question: "Purdue admitted women students from its founding in 1869.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 8,
    question: "What year did Purdue admit its first female students?",
    type: "multiple_choice",
    options: ["1869", "1875", "1887", "1900"],
    correctIndex: 2,
    category: "history"
  },
  {
    id: 9,
    question: "Which astronaut, known as 'the last man on the moon', was a Purdue graduate?",
    type: "multiple_choice",
    options: ["Neil Armstrong", "Eugene Cernan", "Gus Grissom", "Roger Chaffee"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 10,
    question: "Gus Grissom, one of the original Mercury Seven astronauts, graduated from Purdue.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 11,
    question: "What is Purdue's official founding date?",
    type: "multiple_choice",
    options: ["May 6, 1869", "September 16, 1874", "January 1, 1870", "July 4, 1869"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 12,
    question: "Purdue University was originally designated as a land-grant institution.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 13,
    question: "Which Purdue alumnus was the first person to walk on the moon?",
    type: "multiple_choice",
    options: ["Eugene Cernan", "Neil Armstrong", "Virgil Grissom", "Mark Polansky"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 14,
    question: "Amelia Earhart worked at Purdue as a career counselor.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 15,
    question: "In what decade did Purdue's enrollment first exceed 10,000 students?",
    type: "multiple_choice",
    options: ["1920s", "1940s", "1960s", "1980s"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 16,
    question: "The Purdue Research Foundation was established in 1930.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 17,
    question: "How many Purdue alumni have traveled to space?",
    type: "multiple_choice",
    options: ["10", "15", "25", "Over 25"],
    correctIndex: 3,
    category: "history"
  },
  {
    id: 18,
    question: "Purdue opened its first residence hall in 1924.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 19,
    question: "What was the name of Purdue's first building?",
    type: "multiple_choice",
    options: ["University Hall", "Memorial Union", "Heavilon Hall", "Eliza Fowler Hall"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 20,
    question: "David Ross donated significant funds to Purdue in the 1930s.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 21,
    question: "Which war caused a significant drop in Purdue's enrollment?",
    type: "multiple_choice",
    options: ["Civil War", "World War I", "World War II", "Korean War"],
    correctIndex: 2,
    category: "history"
  },
  {
    id: 22,
    question: "Purdue's airport was the first university-owned airport in the United States.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 23,
    question: "Who established the George Ade Fund at Purdue?",
    type: "multiple_choice",
    options: ["David Ross", "George Ade", "John Purdue", "Edward Elliott"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 24,
    question: "Purdue granted its first doctorate degree in 1897.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 25,
    question: "What year did Purdue establish its first fraternity?",
    type: "multiple_choice",
    options: ["1875", "1888", "1900", "1912"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 26,
    question: "The Purduesignal was Purdue's first student newspaper.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 27,
    question: "Which president of Purdue served the longest term?",
    type: "multiple_choice",
    options: ["Frederick Hovde", "Edward Elliott", "Steven Beering", "Martin Jischke"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 28,
    question: "Purdue's Veterinary School was established in 1959.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 29,
    question: "What year did Purdue establish the School of Management?",
    type: "multiple_choice",
    options: ["1958", "1962", "1975", "1988"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 30,
    question: "The Memorial Union was built to honor Purdue students who served in World War I.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 31,
    question: "Which Purdue alumnus invented the television?",
    type: "multiple_choice",
    options: ["Philo Farnsworth", "Thomas Edison", "Nikola Tesla", "John Baird"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 32,
    question: "Purdue's Glee Club was founded in the 1890s.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 33,
    question: "When was the Purdue Research Park established?",
    type: "multiple_choice",
    options: ["1961", "1975", "1984", "1992"],
    correctIndex: 2,
    category: "history"
  },
  {
    id: 34,
    question: "Purdue received its first Rhodes Scholar in the 1920s.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 35,
    question: "What was the original enrollment when Purdue first opened?",
    type: "multiple_choice",
    options: ["39 students", "104 students", "250 students", "500 students"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 36,
    question: "Purdue's Band Day tradition started in the 1940s.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 37,
    question: "Who was Purdue's first African American graduate?",
    type: "multiple_choice",
    options: ["David Robert Lewis", "Roy Wilkins", "Charles Reason", "Henry Baker"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 38,
    question: "Purdue established its Honors College in 2017.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 39,
    question: "When did Purdue join the Big Ten Conference?",
    type: "multiple_choice",
    options: ["1889", "1896", "1912", "1920"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 40,
    question: "Purdue was a founding member of the Big Ten Conference.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 41,
    question: "What year did Mitch Daniels become Purdue's president?",
    type: "multiple_choice",
    options: ["2009", "2011", "2013", "2015"],
    correctIndex: 2,
    category: "history"
  },
  {
    id: 42,
    question: "Purdue froze tuition from 2013 to 2024.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 43,
    question: "Which building was Purdue's first women's residence hall?",
    type: "multiple_choice",
    options: ["Ladies Hall", "Windsor Halls", "Duhme Hall", "Shealy Hall"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 44,
    question: "Purdue Global was acquired in 2018 from Kaplan University.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },
  {
    id: 45,
    question: "What was the enrollment cap Purdue set in recent years?",
    type: "multiple_choice",
    options: ["30,000", "40,000", "50,000", "No cap"],
    correctIndex: 3,
    category: "history"
  },
  {
    id: 46,
    question: "Purdue's motto is 'Education, Research, Service'.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 47,
    question: "How many Nobel Prize winners have been associated with Purdue?",
    type: "multiple_choice",
    options: ["1", "3", "5", "13"],
    correctIndex: 3,
    category: "history"
  },
  {
    id: 48,
    question: "Purdue was the birthplace of the integrated circuit.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "history"
  },
  {
    id: 49,
    question: "When did Purdue Northwest officially join the Purdue system?",
    type: "multiple_choice",
    options: ["2010", "2014", "2016", "2018"],
    correctIndex: 2,
    category: "history"
  },
  {
    id: 50,
    question: "Purdue Fort Wayne was formerly known as IPFW.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "history"
  },

  // CAMPUS & BUILDINGS (50 questions)
  {
    id: 51,
    question: "What is the tallest building on Purdue's campus?",
    type: "multiple_choice",
    options: ["Elliott Hall of Music", "Honors College", "Meredith Hall", "Harrison Hall"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 52,
    question: "The Bell Tower plays the fight song 'Hail Purdue' daily at noon.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 53,
    question: "What does WALC stand for?",
    type: "multiple_choice",
    options: ["West Academic Learning Center", "Wilmeth Active Learning Center", "Wilson Advanced Learning Complex", "Wayne Academic Library Complex"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 54,
    question: "Hovde Hall is named after a former Purdue president.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 55,
    question: "Which building houses Purdue's main undergraduate library?",
    type: "multiple_choice",
    options: ["Hicks Library", "WALC", "Stewart Center", "Mechanical Engineering Building"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 56,
    question: "The Engineering Fountain is a popular spot for students to run through on their birthdays.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 57,
    question: "What is the official name of the fountain at the center of campus?",
    type: "multiple_choice",
    options: ["Loeb Fountain", "Engineering Fountain", "Memorial Fountain", "Purdue Fountain"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 58,
    question: "Ross-Ade Stadium is named after two major Purdue donors.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 59,
    question: "How many seats does Ross-Ade Stadium hold?",
    type: "multiple_choice",
    options: ["45,000", "53,000", "61,000", "70,000"],
    correctIndex: 2,
    category: "campus"
  },
  {
    id: 60,
    question: "Mackey Arena is named after basketball coach Guy Mackey.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 61,
    question: "What is the nickname for Mackey Arena?",
    type: "multiple_choice",
    options: ["The Boiler Room", "The Mackey Madhouse", "The Paint Crew Palace", "The Arena of Champions"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 62,
    question: "The Purdue Memorial Union was the largest student union in the world when it opened.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 63,
    question: "Which dining court is known for its castle-like architecture?",
    type: "multiple_choice",
    options: ["Earhart", "Windsor", "Wiley", "Ford"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 64,
    question: "There are tunnels connecting many buildings under Purdue's campus.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 65,
    question: "What building houses the Purdue Student Government?",
    type: "multiple_choice",
    options: ["Hovde Hall", "Stewart Center", "Purdue Memorial Union", "WALC"],
    correctIndex: 2,
    category: "campus"
  },
  {
    id: 66,
    question: "The Bell Tower was originally built in 1995.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 67,
    question: "Which residence hall is known as the 'Honors' dorm?",
    type: "multiple_choice",
    options: ["Honors College & Residences", "Tarkington", "Shreve", "Meredith"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 68,
    question: "Purdue has its own on-campus airport.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 69,
    question: "What is the name of Purdue's airport?",
    type: "multiple_choice",
    options: ["Purdue Airport", "Amelia Earhart Airport", "Boilermaker Field", "West Lafayette Regional"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 70,
    question: "Elliott Hall of Music can seat over 6,000 people.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 71,
    question: "Which building is home to Purdue's radio station?",
    type: "multiple_choice",
    options: ["Stewart Center", "WBAA Building", "Elliott Hall", "Communication Building"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 72,
    question: "The Armory Building once served as a military training facility.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 73,
    question: "What landmark sits at the heart of Purdue's campus?",
    type: "multiple_choice",
    options: ["The Bell Tower", "Engineering Fountain", "Memorial Mall", "All of the above"],
    correctIndex: 3,
    category: "campus"
  },
  {
    id: 74,
    question: "Purdue's Boiler Gold Rush student section is located in Mackey Arena.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 75,
    question: "Which building houses Purdue's physics department?",
    type: "multiple_choice",
    options: ["Stanley Coulter Hall", "Physics Building", "Heavilon Hall", "Lawson Computer Science Building"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 76,
    question: "The Purdue Research Park is adjacent to the main campus.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 77,
    question: "What street runs along the eastern edge of Purdue's campus?",
    type: "multiple_choice",
    options: ["Grant Street", "Northwestern Avenue", "University Street", "State Street"],
    correctIndex: 2,
    category: "campus"
  },
  {
    id: 78,
    question: "Purdue's campus is bisected by the Wabash River.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 79,
    question: "Which building is named after Purdue's first woman president?",
    type: "multiple_choice",
    options: ["France A. Córdova Hall", "Shealy Hall", "No building yet", "Windsor Halls"],
    correctIndex: 2,
    category: "campus"
  },
  {
    id: 80,
    question: "Lambert Fieldhouse was Purdue's basketball arena before Mackey.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 81,
    question: "What is the name of Purdue's newest academic building completed in 2021?",
    type: "multiple_choice",
    options: ["Honors College & Residences", "Mitchell E. Daniels Jr. Building", "John Martinson Entrepreneurship Center", "Felix Haas Hall"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 82,
    question: "Purdue's campus spans over 2,400 acres.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 83,
    question: "Where is the Purdue All-American Marching Band housed?",
    type: "multiple_choice",
    options: ["Elliott Hall of Music", "Stewart Center", "Armory Building", "Loeb Stadium"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 84,
    question: "The Krannert School of Management has its own building complex.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 85,
    question: "Which hall houses the School of Liberal Arts?",
    type: "multiple_choice",
    options: ["Heavilon Hall", "Beering Hall", "Stanley Coulter Hall", "University Hall"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 86,
    question: "Purdue's veterinary teaching hospital treats both large and small animals.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 87,
    question: "What building is located at the intersection of State Street and Grant Street?",
    type: "multiple_choice",
    options: ["Hovde Hall", "Stewart Center", "Lawson Computer Science", "Hicks Library"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 88,
    question: "Purdue has a nuclear reactor on campus for research purposes.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 89,
    question: "Which bridge connects the main campus to the athletic facilities?",
    type: "multiple_choice",
    options: ["Northwestern Avenue Bridge", "State Street Bridge", "John Purdue Bridge", "Memorial Bridge"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 90,
    question: "The Purdue Visitor Center is located in the Purdue Memorial Union.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 91,
    question: "What is housed in the Bechtel Innovation Design Center?",
    type: "multiple_choice",
    options: ["Student startup incubator", "Maker spaces and design studios", "Business school classrooms", "Art galleries"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 92,
    question: "Purdue has a dedicated building for data science.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 93,
    question: "Which dining court is the largest on campus?",
    type: "multiple_choice",
    options: ["Windsor", "Wiley", "Earhart", "Hillenbrand"],
    correctIndex: 2,
    category: "campus"
  },
  {
    id: 94,
    question: "Slayter Center of Performing Arts opened in 2014.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 95,
    question: "What color are the bricks on most Purdue buildings?",
    type: "multiple_choice",
    options: ["Red", "Brown", "Tan/Beige", "Gray"],
    correctIndex: 2,
    category: "campus"
  },
  {
    id: 96,
    question: "Purdue has a dedicated interfaith center on campus.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "campus"
  },
  {
    id: 97,
    question: "Which building complex houses engineering classrooms and labs?",
    type: "multiple_choice",
    options: ["ARMS", "HAMP", "MSEE", "All of the above"],
    correctIndex: 3,
    category: "campus"
  },
  {
    id: 98,
    question: "Purdue's Steam Plant provides heating to most campus buildings.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 99,
    question: "Where is the Purdue University Bands office located?",
    type: "multiple_choice",
    options: ["Elliott Hall of Music", "Mackey Arena", "Stewart Center", "Armory"],
    correctIndex: 0,
    category: "campus"
  },
  {
    id: 100,
    question: "The CityBus provides free transportation for Purdue students.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "campus"
  },

  // TRADITIONS & CULTURE (50 questions)
  {
    id: 101,
    question: "What is Purdue's official mascot?",
    type: "multiple_choice",
    options: ["Boilermaker Pete", "Purdue Pete", "Special Pete", "Pete the Boilermaker"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 102,
    question: "The Boilermaker Special is a replica locomotive.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 103,
    question: "What are Purdue's official colors?",
    type: "multiple_choice",
    options: ["Black and Gold", "Old Gold and Black", "Gold and Black", "Yellow and Black"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 104,
    question: "Students traditionally run through the Engineering Fountain on their birthdays.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 105,
    question: "What is the name of Purdue's student section for basketball games?",
    type: "multiple_choice",
    options: ["Gold Rush", "Paint Crew", "Boiler Brigade", "Pete's Posse"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 106,
    question: "The Old Oaken Bucket trophy is awarded to the winner of the Purdue-IU football game.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 107,
    question: "What time does the Purdue 'All-American' Marching Band perform at pregame?",
    type: "multiple_choice",
    options: ["30 minutes before kickoff", "1 hour before kickoff", "15 minutes before kickoff", "Immediately before kickoff"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 108,
    question: "Grand Prix is Purdue's annual go-kart race held in April.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 109,
    question: "How many laps does the Grand Prix race consist of?",
    type: "multiple_choice",
    options: ["33 laps", "50 laps", "100 laps", "150 laps"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 110,
    question: "Breakfast Club happens on gameday mornings at local bars.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 111,
    question: "What song does the Purdue band play after a touchdown?",
    type: "multiple_choice",
    options: ["Hail Purdue", "Fight Song", "Purdue Hymn", "Boilermaker March"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 112,
    question: "Bug Bowl is an annual event featuring insect-related activities and races.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 113,
    question: "What do students shout during Purdue's fight song?",
    type: "multiple_choice",
    options: ["Go Boilers!", "Boiler Up!", "I-U Sucks!", "Hail Purdue!"],
    correctIndex: 2,
    category: "traditions"
  },
  {
    id: 114,
    question: "Purdue students traditionally kiss under the Kissing Bridge.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 115,
    question: "What is the name of Purdue's annual dance marathon?",
    type: "multiple_choice",
    options: ["Boiler Dance", "Dance Marathon", "Purdue For The Kids", "All-Night Dance"],
    correctIndex: 2,
    category: "traditions"
  },
  {
    id: 116,
    question: "Purdue Pete originally had a more friendly, cartoon-like appearance.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 117,
    question: "What is the Boilermaker Special made from?",
    type: "multiple_choice",
    options: ["Wood and metal", "An old truck chassis", "A golf cart", "A small locomotive"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 118,
    question: "Purdue's fight song is called 'Hail Purdue'.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 119,
    question: "What annual tradition involves building massive structures?",
    type: "multiple_choice",
    options: ["Homecoming", "Grand Prix", "Engineering Week", "Spirit Week"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 120,
    question: "The World's Largest Drum belongs to Purdue's marching band.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 121,
    question: "What do Purdue fans wave during games?",
    type: "multiple_choice",
    options: ["Foam fingers", "Gold flags", "Yellow towels", "Train whistles"],
    correctIndex: 2,
    category: "traditions"
  },
  {
    id: 122,
    question: "Purdue students camp out for basketball tickets during 'Tent City'.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 123,
    question: "What is the name of Purdue's student newspaper?",
    type: "multiple_choice",
    options: ["The Purdue Times", "The Boilermaker", "The Purdue Exponent", "The Daily Purdue"],
    correctIndex: 2,
    category: "traditions"
  },
  {
    id: 124,
    question: "Silver Taps is a memorial ceremony for deceased students.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 125,
    question: "Which Greek organization was founded at Purdue?",
    type: "multiple_choice",
    options: ["Sigma Chi", "Delta Delta Delta", "Phi Delta Theta", "Kappa Kappa Gamma"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 126,
    question: "Purdue's alma mater is sung at the end of events.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 127,
    question: "What is Purdue's official motto?",
    type: "multiple_choice",
    options: ["Education, Research, Service", "Boiler Up", "Ever True", "Knowledge and Faith"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 128,
    question: "The Iron Key society is Purdue's oldest honor society.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 129,
    question: "What is the name of the annual variety show at Purdue?",
    type: "multiple_choice",
    options: ["Purdue Presents", "Gala", "Varsity Varieties", "Spring Fest"],
    correctIndex: 2,
    category: "traditions"
  },
  {
    id: 130,
    question: "Purdue students are known as 'Boilermakers'.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 131,
    question: "What tradition involves throwing a ceremonial switch?",
    type: "multiple_choice",
    options: ["Grand Prix start", "Basketball season opener", "Homecoming kickoff", "Christmas lighting ceremony"],
    correctIndex: 3,
    category: "traditions"
  },
  {
    id: 132,
    question: "The Boilermaker Special has appeared at every home football game since 1940.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 133,
    question: "What color do Purdue fans wear to 'Gold Out' games?",
    type: "multiple_choice",
    options: ["Black", "Old Gold", "Yellow", "White"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 134,
    question: "Purdue students receive a 'Book of Great Teachers' award.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 135,
    question: "How many versions of the Boilermaker Special have there been?",
    type: "multiple_choice",
    options: ["3", "5", "7", "10"],
    correctIndex: 2,
    category: "traditions"
  },
  {
    id: 136,
    question: "The Spirit of Sandra is Purdue's philanthropic giving campaign.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 137,
    question: "What event features a 5K run around campus?",
    type: "multiple_choice",
    options: ["Boiler Run", "Grand Prix 5K", "Dawn of the Dread", "Spirit Run"],
    correctIndex: 2,
    category: "traditions"
  },
  {
    id: 138,
    question: "Purdue has an official seal that appears on diplomas.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 139,
    question: "What animal is featured on the Old Oaken Bucket trophy?",
    type: "multiple_choice",
    options: ["Eagle", "Train", "No animal", "Boilermaker"],
    correctIndex: 2,
    category: "traditions"
  },
  {
    id: 140,
    question: "Purdue's marching band is called the 'All-American' Marching Band.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 141,
    question: "What is the student organization that runs Grand Prix?",
    type: "multiple_choice",
    options: ["Grand Prix Foundation", "Purdue Grand Prix", "Student Activities", "Engineering Council"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 142,
    question: "Purdue has a tradition of ringing a bell after athletic victories.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 143,
    question: "What is the name of Purdue's comedy improv group?",
    type: "multiple_choice",
    options: ["No Refund Theatre", "Boiler Comedy", "Improv Club", "Laugh Factory"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 144,
    question: "Purdue's official hashtag is #BoilerUp.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 145,
    question: "Which tradition honors outstanding seniors?",
    type: "multiple_choice",
    options: ["Senior Week", "Mortar Board", "Graduation Honors", "Senior Salute"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 146,
    question: "The Iron Key is given to the top male scholar-athletes.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "traditions"
  },
  {
    id: 147,
    question: "What do students receive during Week of Welcome?",
    type: "multiple_choice",
    options: ["Free textbooks", "T-shirts", "Welcome packets", "All of the above"],
    correctIndex: 2,
    category: "traditions"
  },
  {
    id: 148,
    question: "Purdue has an official university mace used in ceremonies.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 149,
    question: "What is the spring concert series called?",
    type: "multiple_choice",
    options: ["Spring Fest", "Boiler Bash", "April Fest", "Spring Concert"],
    correctIndex: 0,
    category: "traditions"
  },
  {
    id: 150,
    question: "Purdue students traditionally throw streamers at football games.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "traditions"
  },

  // SPORTS & ATHLETICS (50 questions)
  {
    id: 151,
    question: "What conference is Purdue a member of?",
    type: "multiple_choice",
    options: ["Big Ten", "Big 12", "ACC", "SEC"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 152,
    question: "Purdue has won multiple NCAA basketball championships.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 153,
    question: "Who is Purdue's all-time leading scorer in men's basketball?",
    type: "multiple_choice",
    options: ["Rick Mount", "Caleb Swanigan", "Carsen Edwards", "Joe Barry Carroll"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 154,
    question: "Purdue's football team has won a Rose Bowl.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 155,
    question: "Which legendary coach led Purdue basketball for 25 years?",
    type: "multiple_choice",
    options: ["Gene Keady", "Matt Painter", "Lee Rose", "George King"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 156,
    question: "Purdue's women's basketball team has made multiple Final Four appearances.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 157,
    question: "What is Purdue's current football coach's name?",
    type: "multiple_choice",
    options: ["Jeff Brohm", "Ryan Walters", "Darrell Hazell", "Joe Tiller"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 158,
    question: "Purdue is known as a 'basketball school'.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 159,
    question: "How many Big Ten football championships has Purdue won?",
    type: "multiple_choice",
    options: ["8", "12", "15", "20"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 160,
    question: "Drew Brees played quarterback at Purdue.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 161,
    question: "Which year did Purdue go to the NCAA championship game in basketball?",
    type: "multiple_choice",
    options: ["1969", "1980", "1994", "Never"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 162,
    question: "Purdue has produced multiple Heisman Trophy winners.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 163,
    question: "Who is Purdue's current men's basketball coach?",
    type: "multiple_choice",
    options: ["Gene Keady", "Matt Painter", "Brian Cardinal", "Cuonzo Martin"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 164,
    question: "Purdue's volleyball team plays in Holloway Gymnasium.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 165,
    question: "What is Purdue's biggest football rivalry?",
    type: "multiple_choice",
    options: ["Notre Dame", "Indiana", "Illinois", "Ohio State"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 166,
    question: "Purdue has won the Old Oaken Bucket more than Indiana.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 167,
    question: "Which Purdue athlete won an Olympic gold medal in swimming?",
    type: "multiple_choice",
    options: ["Lilly King", "Matt Grevers", "David Boudia", "All of the above"],
    correctIndex: 3,
    category: "sports"
  },
  {
    id: 168,
    question: "Purdue's softball team has won a national championship.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 169,
    question: "What is the name of Purdue's athletic complex?",
    type: "multiple_choice",
    options: ["Boiler Athletic Center", "Mollenkopf Athletic Center", "Purdue Sports Complex", "Mackey Complex"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 170,
    question: "Purdue has an NCAA Division I wrestling program.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 171,
    question: "Which Purdue center was the #1 overall NBA draft pick?",
    type: "multiple_choice",
    options: ["Joe Barry Carroll", "Glenn Robinson", "JaJuan Johnson", "Zach Edey"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 172,
    question: "Purdue's baseball team plays at Alexander Field.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 173,
    question: "What is the Paint Crew?",
    type: "multiple_choice",
    options: ["Student section for basketball", "Athletic department staff", "Painting club", "Homecoming committee"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 174,
    question: "Purdue defeated the #1 ranked team in basketball multiple times.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 175,
    question: "Which legendary Purdue coach has a statue outside Mackey Arena?",
    type: "multiple_choice",
    options: ["Gene Keady", "John Wooden", "Ward Lambert", "All of the above"],
    correctIndex: 3,
    category: "sports"
  },
  {
    id: 176,
    question: "John Wooden played basketball at Purdue.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 177,
    question: "What year did Purdue football win the Rose Bowl?",
    type: "multiple_choice",
    options: ["1967", "2001", "Never", "2022"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 178,
    question: "Purdue's track and field team competes in the Big Ten championships.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 179,
    question: "Which NBA superstar played at Purdue?",
    type: "multiple_choice",
    options: ["Glenn Robinson", "LeBron James", "Kevin Durant", "Kobe Bryant"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 180,
    question: "Purdue has had players drafted #1 overall in the NBA draft.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 181,
    question: "What is Purdue's women's basketball arena?",
    type: "multiple_choice",
    options: ["Mackey Arena", "Holloway Gymnasium", "Lambert Fieldhouse", "Women's Sports Center"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 182,
    question: "Purdue's soccer team has won Big Ten championships.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 183,
    question: "Which Purdue quarterback set numerous school records?",
    type: "multiple_choice",
    options: ["Kyle Orton", "Drew Brees", "Curtis Painter", "Jim Everett"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 184,
    question: "Purdue has a men's ice hockey team.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 185,
    question: "What trophy does Purdue compete for against Illinois?",
    type: "multiple_choice",
    options: ["Bronze Cannon", "Purdue Cannon", "No trophy", "Old Brass Spittoon"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 186,
    question: "Purdue's women's golf team has won national championships.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 187,
    question: "Which Purdue athlete won Olympic gold in diving?",
    type: "multiple_choice",
    options: ["David Boudia", "Steele Johnson", "Matt Grevers", "Amy Cozad"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 188,
    question: "Purdue's mascot, Purdue Pete, appears at all sporting events.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 189,
    question: "What is the capacity of Mackey Arena?",
    type: "multiple_choice",
    options: ["10,000", "12,000", "14,000", "16,000"],
    correctIndex: 2,
    category: "sports"
  },
  {
    id: 190,
    question: "Purdue's athletic teams are called the Boilermakers.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 191,
    question: "Who holds the Purdue record for most career rebounds?",
    type: "multiple_choice",
    options: ["Joe Barry Carroll", "Terry Dischinger", "Zach Edey", "Carroll Williams"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 192,
    question: "Purdue has won a bowl game on New Year's Day.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 193,
    question: "What year did Purdue reach the Final Four most recently?",
    type: "multiple_choice",
    options: ["1980", "2000", "2019", "2024"],
    correctIndex: 2,
    category: "sports"
  },
  {
    id: 194,
    question: "Purdue's tennis teams play at the Schwartz Tennis Center.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 195,
    question: "Which coach led Purdue football to a Rose Bowl victory?",
    type: "multiple_choice",
    options: ["Joe Tiller", "Jack Mollenkopf", "Jeff Brohm", "Jim Young"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 196,
    question: "Purdue's rowing team competes on the Wabash River.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "sports"
  },
  {
    id: 197,
    question: "What is the Boiler Gold Rush?",
    type: "multiple_choice",
    options: ["Student section for football", "Fundraising campaign", "Homecoming tradition", "Alumni event"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 198,
    question: "Purdue has an equestrian team.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },
  {
    id: 199,
    question: "Which Purdue athlete won the Wooden Award?",
    type: "multiple_choice",
    options: ["Caleb Swanigan", "Zach Edey", "Glenn Robinson", "All of the above"],
    correctIndex: 3,
    category: "sports"
  },
  {
    id: 200,
    question: "Purdue's colors in athletics are Old Gold and Black.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "sports"
  },

  // ACADEMICS (50 questions)
  {
    id: 201,
    question: "What is Purdue's most famous engineering program?",
    type: "multiple_choice",
    options: ["Mechanical Engineering", "Aeronautical & Astronautical Engineering", "Civil Engineering", "Electrical Engineering"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 202,
    question: "Purdue is ranked as a top 10 engineering school in the nation.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 203,
    question: "How many colleges does Purdue have?",
    type: "multiple_choice",
    options: ["8", "10", "13", "15"],
    correctIndex: 2,
    category: "academics"
  },
  {
    id: 204,
    question: "Purdue offers a degree in Aviation Management.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 205,
    question: "What is the name of Purdue's business school?",
    type: "multiple_choice",
    options: ["Krannert School of Management", "Kelley School of Business", "Daniels School of Business", "Mitchell School of Management"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 206,
    question: "Purdue has a College of Pharmacy.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 207,
    question: "Which college at Purdue focuses on liberal arts?",
    type: "multiple_choice",
    options: ["College of Liberal Arts", "College of Humanities", "College of Arts", "Liberal Studies College"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 208,
    question: "Purdue has a medical school on its West Lafayette campus.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 209,
    question: "What is Purdue Polytechnic known for?",
    type: "multiple_choice",
    options: ["Technology programs", "Liberal arts", "Medicine", "Law"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 210,
    question: "Purdue offers over 200 undergraduate majors.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 211,
    question: "Which college houses the Computer Science program?",
    type: "multiple_choice",
    options: ["College of Engineering", "College of Science", "Polytechnic Institute", "All of the above"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 212,
    question: "Purdue's pharmacy program is consistently ranked #1 in the nation.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 213,
    question: "What is the name of Purdue's agricultural college?",
    type: "multiple_choice",
    options: ["College of Agriculture", "School of Agriculture", "Agricultural Sciences", "Purdue Agriculture"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 214,
    question: "Purdue has a veterinary school.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 215,
    question: "Which program is Purdue NOT known for?",
    type: "multiple_choice",
    options: ["Engineering", "Marine Biology", "Agriculture", "Technology"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 216,
    question: "Purdue's College of Education prepares future teachers.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 217,
    question: "What is the student-to-faculty ratio at Purdue?",
    type: "multiple_choice",
    options: ["10:1", "13:1", "18:1", "25:1"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 218,
    question: "Purdue offers online degree programs through Purdue Global.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 219,
    question: "Which Purdue program is nicknamed 'Cradle of Astronauts'?",
    type: "multiple_choice",
    options: ["Aeronautical & Astronautical Engineering", "Physics", "Astronomy", "Mechanical Engineering"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 220,
    question: "Purdue has a law school.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 221,
    question: "What is Purdue's undergraduate acceptance rate?",
    type: "multiple_choice",
    options: ["50-60%", "60-70%", "70-80%", "80-90%"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 222,
    question: "Purdue has one of the largest international student populations in the US.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 223,
    question: "Which of these is a Purdue research area?",
    type: "multiple_choice",
    options: ["Nanotechnology", "Cybersecurity", "Sustainable energy", "All of the above"],
    correctIndex: 3,
    category: "academics"
  },
  {
    id: 224,
    question: "Purdue offers a dual degree program with IUPUI.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 225,
    question: "What year was the Honors College established?",
    type: "multiple_choice",
    options: ["2000", "2010", "2017", "2020"],
    correctIndex: 2,
    category: "academics"
  },
  {
    id: 226,
    question: "Purdue's First-Year Engineering program is required for all engineering students.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 227,
    question: "Which college offers Actuarial Science?",
    type: "multiple_choice",
    options: ["Krannert", "College of Science", "College of Engineering", "Both A and B"],
    correctIndex: 3,
    category: "academics"
  },
  {
    id: 228,
    question: "Purdue has a School of Nursing.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 229,
    question: "What is the average class size for undergraduate courses?",
    type: "multiple_choice",
    options: ["20", "35", "50", "Varies widely"],
    correctIndex: 3,
    category: "academics"
  },
  {
    id: 230,
    question: "Purdue requires all students to take a first-year writing course.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 231,
    question: "Which program is part of Purdue Polytechnic?",
    type: "multiple_choice",
    options: ["Aviation", "Computer Graphics Technology", "Construction Management", "All of the above"],
    correctIndex: 3,
    category: "academics"
  },
  {
    id: 232,
    question: "Purdue offers study abroad programs in over 50 countries.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 233,
    question: "What is Purdue's research expenditure per year?",
    type: "multiple_choice",
    options: ["$100 million", "$300 million", "$500 million", "$700+ million"],
    correctIndex: 3,
    category: "academics"
  },
  {
    id: 234,
    question: "Purdue has a Data Science program.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 235,
    question: "Which college offers a degree in Wildlife?",
    type: "multiple_choice",
    options: ["College of Agriculture", "College of Science", "Forestry & Natural Resources", "College of Veterinary Medicine"],
    correctIndex: 2,
    category: "academics"
  },
  {
    id: 236,
    question: "Purdue offers a minor in Entrepreneurship.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 237,
    question: "What percentage of Purdue students are in STEM fields?",
    type: "multiple_choice",
    options: ["40%", "50%", "60%", "70%"],
    correctIndex: 2,
    category: "academics"
  },
  {
    id: 238,
    question: "Purdue has a School of Hospitality and Tourism Management.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 239,
    question: "Which building houses the Department of Chemistry?",
    type: "multiple_choice",
    options: ["Brown Laboratory", "Wetherill Laboratory", "Stanley Coulter", "BRNG"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 240,
    question: "Purdue offers cooperative education (co-op) programs.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 241,
    question: "What is Purdue's undergraduate enrollment?",
    type: "multiple_choice",
    options: ["25,000", "35,000", "45,000", "55,000"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 242,
    question: "Purdue has a College of Health and Human Sciences.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 243,
    question: "Which program leads to the most astronauts?",
    type: "multiple_choice",
    options: ["Aeronautical & Astronautical Engineering", "Mechanical Engineering", "Physics", "Computer Science"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 244,
    question: "Purdue's graduation rate is above 80%.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 245,
    question: "What is unique about Purdue's tuition since 2013?",
    type: "multiple_choice",
    options: ["It's free", "It's been frozen", "It decreased", "It doubled"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 246,
    question: "Purdue offers certificates in addition to degrees.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 247,
    question: "Which resource helps students with career planning?",
    type: "multiple_choice",
    options: ["Career Center", "CCO (Center for Career Opportunities)", "Handshake", "All of the above"],
    correctIndex: 3,
    category: "academics"
  },
  {
    id: 248,
    question: "Purdue has a School of Materials Engineering.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
  {
    id: 249,
    question: "What is Purdue's total enrollment (including graduate students)?",
    type: "multiple_choice",
    options: ["35,000", "45,000", "50,000", "60,000"],
    correctIndex: 1,
    category: "academics"
  },
  {
    id: 250,
    question: "Purdue is classified as an R1 research university.",
    type: "true_false",
    options: ["True", "False"],
    correctIndex: 0,
    category: "academics"
  },
];
