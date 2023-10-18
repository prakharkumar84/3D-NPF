/* eslint-disable no-unused-vars */
import { p } from "maath/dist/misc-7d870b3c.esm";
import {
  mobile,
  python,
  backend,
  creator,
  verticalaerospace,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  carrent,
  jobit,
  tripguide,
  threejs,
  infor,
  astonmartin,
  flexfab,
  newwaysselectronics,
  groupecanam,
  car1,
  car2,
  car3,
  castle1,
  castle2,
  castle3,
  castle4,
  castle5,
  castle6,
  dust1,
  dust2,
  dust3,
  dust4,
  landscape1,
  landscape2,
  landscape3,
  lp1,
  lp2,
  mustang1,
  mustang2,
  mustang3,
  mustang4,
  spartan1,
  spartan2,
  spartan3,
  spartan4,
  game1,
  game2,
  game3,
  carVid,
  carVid1,
  im,
  dance,
  pekka,
  spartan,
  todo1,
  todo,
  bgc,
  counter,
  calculator,
  cc,
  dice,
  listacc,
  passwordGenerator,
  stopwatch,
  TicTacToe,
  colorChanger,
  travellers,
  calender,
  amazonclone,
  carRental,
  magento,
  sql,
  portfolio,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "contact",
    title: "Contact",
  },
  {
    id: "projects",
    title: "Projects",
  },
];

const services = [
  {
    id: 1,
    title: "Web Developer",
    icon: web,
  },
  {
    id: 2,
    title: "React Native Developer",
    icon: mobile,
  },
  {
    id: 3,
    title: "Game Developer",
    icon: backend,
  },
  {
    id: 4,
    title: "Animation / Graphics",
    icon: creator,
  },
];

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Redux",
    icon: redux,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "SQL",
    icon: sql,
  },
  {
    name: "Three JS",
    icon: threejs,
  },
  {
    name: "git",
    icon: git,
  },

  {
    name: "python",
    icon: python,
  },
];

const company = [
  {
    id: 1,
    title: "Associate Technical Consultant",
    company_name: "Infor India PVT LTD",
    icon: infor,
    iconBg: "#383E56",
    date: "April 2022 - Current",
    points: [
      "Requirement Gathering and Analysis",
      "Solution Design and Configuration",
      "Implementation and Deployment",
      "Customization and Integration",
      "Training and User Support",
      "System Upgrades and Enhancements",
      "Troubleshooting and Issue Resolution",
    ],
  },
];

const experiences = [
  {
    title: "Infor Mingle Cloudsuite Portal V2",
    company_name: "Infor (Hyderabad: Offsite)",
    icon: infor,
    iconBg: "#383E56",
    date: "dec 2022",
    points: [
      "Created interactive analytic view using React, incorporating graphs and pie charts to provide comprehensive data visualization.",
      "Integrated microservices and workspaces into dropdown menu within the widget drawer using React.js and Material‑UI, stream‑lining access and navigation for users.",
      "Implemented efficient search functionality utilizing debouncing techniques, enhancing the user experience and optimizing the search process.",
      "Integrated API functionality to dynamically add additional workspaces as menu options within the widget box, facilitating a flexible and scalable user interface.",
      "Developed a tabular view feature to display data in a structured format, enhancing data readability and accessibility for end-users.",
    ],
    tags: [
      {
        name: "Reactjs",
        color: "blue-text-gradient",
      },
      {
        name: "SQL",
        color: "green-text-gradient",
      },
      {
        name: "Javascript",
        color: "pink-text-gradient",
      },
    ],
  },
  {
    title: "XML-to-JSON coversion using java for API calls",
    company_name: "Magento (Hyderabad: Offsite)",
    icon: magento,
    iconBg: "#383E56",
    date: "Oct 2023",
    points: [
      "Developed a robust data processing pipeline, facilitating seamless conversion of XML data from LN to ION platform using Java.",
      "Orchestrated the integration of the Java‑based module with the internal Web Service, ensuring real‑time data communication between systems.",
      "Collaborated with the front‑end development team to integrate JSON data effectively into client‑side applications, ensuring a smooth user experience and optimized data representation.",
    ],
    tags: [
      {
        name: "Java",
        color: "blue-text-gradient",
      },
      {
        name: "SQL",
        color: "green-text-gradient",
      },
      {
        name: "XML",
        color: "pink-text-gradient",
      },
    ],
  },
  {
    title: "Webservice and API Development",
    company_name: "CANAM (Hyderabad: Offsite)",
    icon: groupecanam,
    iconBg: "#383E56",
    date: "May 2023",
    points: [
      "Developed custom scripts and UI for automated purchase order date reminders.",
      "Created custom scripts and UIto facilitate document transfer via APIs between internal servers and document management servers for customers.",
      "Worked on workflows and XSLT development,involving SQL for workflow parameters, data retrieval, and creating XSLT mappings, alongside Web Service creation and API calls for data updates in LN.",
    ],
    tags: [
      {
        name: "BaanC",
        color: "blue-text-gradient",
      },
      {
        name: "SQL",
        color: "green-text-gradient",
      },
      {
        name: "XSLT",
        color: "pink-text-gradient",
      },
    ],
  },
  // {
  //   title: "Purchase Reminder Notification to Customer",
  //   company_name: "Vertical Aerospace (Hyderabad: Offsite)",
  //   icon: verticalaerospace,
  //   iconBg: "#383E56",
  //   date: "April 2023",
  //   points: [
  //     "Its a UK based company.",
  //     "Worked on custom UI and scripts to send notification to use in case they do not update the purchase order dates for open purchase orders .",
  //     "Developed custom BODs and Monitors which checks and send notifications at interval of 1 day in case purchase order date crosses the current date.",
  //   ],
  //   tags: [
  //     {
  //       name: "C Programming",
  //       color: "blue-text-gradient",
  //     },
  //     {
  //       name: "SQL",
  //       color: "green-text-gradient",
  //     },
  //     {
  //       name: "Programming SQL",
  //       color: "pink-text-gradient",
  //     },
  //   ],
  // },
  // {
  //   title: "Document Transfer through APIs on Cloud",
  //   company_name: "Company : Aston Martin (Offsite)",
  //   icon: astonmartin,
  //   iconBg: "#E6DEDD",
  //   date: "Feb 2023 - Apr 2023",
  //   points: [
  //     "Developed Custom scripts used to call APIs ",
  //     "Developed Custom UI to select documents to transfer",
  //     "Documents to transfer from internal LN server  to LN document management server for customers to retrieve easily.",
  //   ],
  //   tags: [
  //     {
  //       name: "C Programming",
  //       color: "blue-text-gradient",
  //     },
  //     {
  //       name: "SQL",
  //       color: "green-text-gradient",
  //     },
  //     {
  //       name: "Programming SQL",
  //       color: "pink-text-gradient",
  //     },
  //   ],
  // },
  // {
  //   title: "Data Migration Between databases of old and new system on Cloud",
  //   company_name: "FlexFab (Offsite)",
  //   icon: flexfab,
  //   iconBg: "#383E56",
  //   date: "Feb 2023 - Present",
  //   points: [
  //     "USA based company.",
  //     "Worked on Data migration from old system to new using python scripts.",
  //     "Use of MS SQL Server to query through complex data and extract data in required format by the new system.",
  //     "Includes daily interactions with both china teams and customers.",
  //   ],
  //   tags: [
  //     {
  //       name: "C Programming",
  //       color: "blue-text-gradient",
  //     },
  //     {
  //       name: "SQL",
  //       color: "green-text-gradient",
  //     },
  //     {
  //       name: "Programming SQL",
  //       color: "pink-text-gradient",
  //     },
  //     {
  //       name: "Python Srcipting",
  //       color: "orange-text-gradient",
  //     },
  //     {
  //       name: "MS SQL Server",
  //       color: "brown-text-gradient",
  //     },
  //   ],
  // },
  // {
  //   title: "Data Import and Migration Between different Companies on Cloud",
  //   company_name: "NewWays Electronics (Offsite)",
  //   icon: newwaysselectronics,
  //   iconBg: "#E6DEDD",
  //   date: "May 2023",
  //   points: [
  //     "NetherLands based company. ",
  //     "Worked on Data import and migration between differnt companies on cloud using python scripts , C , SQL and Import PLSQL scripts. ",
  //     "Use of MS SQL Server to query through complex data and extract data in required format by the new system. ",
  //   ],
  //   tags: [
  //     {
  //       name: "C Programming",
  //       color: "blue-text-gradient",
  //     },
  //     {
  //       name: "SQL",
  //       color: "green-text-gradient",
  //     },
  //     {
  //       name: "Programming SQL",
  //       color: "pink-text-gradient",
  //     },
  //     {
  //       name: "Python Srcipting",
  //       color: "orange-text-gradient",
  //     },
  //     {
  //       name: "MS SQL Server",
  //       color: "red-text-gradient",
  //     },
  //   ],
  // },
  // {
  //   title: "Workflows and XSLT development",
  //   company_name: "Groupe CANAM (Offsite)",
  //   icon: groupecanam,
  //   iconBg: "#E6DEDD",
  //   date: "April 2023 - Present",
  //   points: [
  //     "Use of Programming SQL to write scripts for workflow parameters .",
  //     "Retrieval of necessary data for workflow activation using SQL queries.",
  //     "Creating activation policies.",
  //     "Creating XSLT mappings to map data from one system to another.",
  //   ],
  //   tags: [
  //     {
  //       name: "C Programming",
  //       color: "blue-text-gradient",
  //     },
  //     {
  //       name: "SQL",
  //       color: "green-text-gradient",
  //     },
  //     {
  //       name: "Programming SQL",
  //       color: "pink-text-gradient",
  //     },
  //   ],
  // },
];

const testimonials = [
  {
    testimonial:
      "I thought it was impossible to make a website as beautiful as our product, but Rick proved me wrong.",
    name: "Sara Lee",
    designation: "CFO",
    company: "Acme Co",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    testimonial:
      "I've never met a web developer who truly cares about their clients' success like Rick does.",
    name: "Chris Brown",
    designation: "COO",
    company: "DEF Corp",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    testimonial:
      "After Rick optimized our website, our traffic increased by 50%. We can't thank them enough!",
    name: "Lisa Wang",
    designation: "CTO",
    company: "456 Enterprises",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
];

const projects = [
  {
    name: "Car Rent",
    description:
      "Web-based platform that allows users to search, book, and manage car rentals from various providers, providing a convenient and efficient solution for transportation needs.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "reactstrap",
        color: "green-text-gradient",
      },
      {
        name: "bootstrap",
        color: "pink-text-gradient",
      },
    ],
    image: carRental,
    source_code_link:
      "https://car-rental-kt8164f1f-prakhar-kumars-projects.vercel.app",
  },
  {
    name: "Portfolio",
    description:
      "collection of an individual's best work samples and achievements, often used to showcase skills and experience to potential employers or clients.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "threejs",
        color: "green-text-gradient",
      },
      {
        name: "tailwind css",
        color: "pink-text-gradient",
      },
    ],
    image: portfolio,
    source_code_link: "https://prakhar-portfolio-84.netlify.app/",
  },
  {
    name: "Amazon Clone",
    description:
      "Deals with add to cart,remove from cart, business logic to calculate orders and proceed to checkout. Created to look like original amazon website.",
    tags: [
      {
        name: "Reactjs",
        color: "blue-text-gradient",
      },
      {
        name: "html",
        color: "green-text-gradient",
      },
      {
        name: "css",
        color: "pink-text-gradient",
      },
    ],
    image: amazonclone,
    source_code_link: "https://checkout-functionality.vercel.app/",
  },
];

const animation = [
  {
    key: 1,
    id: 1,
    url: car1,
  },
  {
    key: 2,
    id: 1,
    url: car2,
  },
  {
    key: 3,
    id: 1,
    url: car3,
  },
  {
    key: 4,
    id: 2,
    url: castle1,
  },
  {
    key: 5,
    id: 2,
    url: castle2,
  },
  {
    key: 6,
    id: 2,
    url: castle3,
  },
  {
    key: 7,
    id: 2,
    url: castle4,
  },
  {
    key: 8,
    id: 2,
    url: castle5,
  },
  {
    key: 9,
    id: 2,
    url: castle6,
  },
  {
    key: 10,
    id: 3,
    url: dust1,
  },
  {
    key: 11,
    id: 3,
    url: dust2,
  },
  {
    key: 12,
    id: 3,
    url: dust3,
  },
  {
    key: 13,
    id: 3,
    url: dust4,
  },
  {
    key: 14,
    id: 4,
    url: landscape1,
  },
  {
    key: 15,
    id: 4,
    url: landscape2,
  },
  {
    key: 16,
    id: 4,
    url: landscape3,
  },
  {
    key: 17,
    id: 5,
    url: lp1,
  },
  {
    key: 18,
    id: 5,
    url: lp2,
  },
  {
    key: 19,
    id: 6,
    url: mustang1,
  },
  {
    key: 20,
    id: 6,
    url: mustang2,
  },
  {
    key: 21,
    id: 6,
    url: mustang3,
  },
  {
    key: 22,
    id: 6,
    url: mustang4,
  },
  {
    key: 23,
    id: 7,
    url: spartan1,
  },
  {
    key: 24,
    id: 7,
    url: spartan2,
  },
  {
    key: 25,
    id: 7,
    url: spartan3,
  },
  {
    key: 26,
    id: 7,
    url: spartan4,
  },
  {
    key: 27,
    id: 8,
    url: pekka,
  },
];

const AnimationVideos = [
  {
    id: 1,
    url: carVid,
  },
  {
    id: 2,
    url: carVid1,
  },
  {
    id: 3,
    url: dance,
  },
  {
    id: 4,
    url: im,
  },
  {
    id: 5,
    url: spartan,
  },
];

const game = [
  {
    id: 1,
    str: "Number Wizard",
    url: game1,
    play: "https://github.com/prakharkumar84/NumberWizard",
    description:
      "The game was created using a combination of Unity, Blender, C#, and 3D modeling techniques. It is a visually immersive and interactive experience that showcases the integration of these powerful tools and technologies.",
    tags: [
      {
        name: "C-Sharp",
        color: "blue-text-gradient",
      },
      {
        name: "Unity",
        color: "green-text-gradient",
      },
      {
        name: "Blender",
        color: "pink-text-gradient",
      },
      {
        name: "Gimp",
        color: "orange-text-gradient",
      },
    ],
  },
  {
    id: 2,
    str: "Cube Runner",
    url: game2,
    play: "https://github.com/prakharkumar84/Cube-Runner",
    description:
      "The game was created using a combination of Unity, Blender, C#, and 3D modeling techniques. It is a visually immersive and interactive experience that showcases the integration of these powerful tools and technologies.",
    tags: [
      {
        name: "C-Sharp",
        color: "blue-text-gradient",
      },
      {
        name: "Unity",
        color: "green-text-gradient",
      },
      {
        name: "Blender",
        color: "pink-text-gradient",
      },
      {
        name: "Gimp",
        color: "orange-text-gradient",
      },
    ],
  },
  {
    id: 3,
    str: "Maze Runner",
    url: game3,
    play: "https://github.com/prakharkumar84/MazeRunner",
    description:
      "The game was created using a combination of Unity, Blender, C#, and 3D modeling techniques. It is a visually immersive and interactive experience that showcases the integration of these powerful tools and technologies.",
    tags: [
      {
        name: "C-Sharp",
        color: "blue-text-gradient",
      },
      {
        name: "Unity",
        color: "green-text-gradient",
      },
      {
        name: "Blender",
        color: "pink-text-gradient",
      },
      {
        name: "Gimp",
        color: "orange-text-gradient",
      },
    ],
  },
];
const native = [
  {
    id: 1,
    str: "Advanced Todo",
    url: todo,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/Todo01",
    description: `The Todo app is a powerful and user-friendly task management application built using React Native and TypeScript. It incorporates various features such as a FlatList component, hooks, checkboxes for task completion, task assignment, and a dropdown menu based on an array.
The app's interface is designed to provide a seamless and intuitive user experience. Users can easily add, view, edit, and delete tasks within the app. The FlatList component is utilized to display the list of tasks, ensuring smooth scrolling and optimal performance even with a large number of tasks.`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },

      {
        name: "datetimepicker",
        color: "pink-text-gradient",
      },
      {
        name: "bouncy-checkbox",
        color: "green-text-gradient",
      },
    ],
  },
  {
    id: 2,
    str: "StopWatch",
    url: stopwatch,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/Stopwatch",
    description: `The Stopwatch app is a handy time-tracking tool developed using TypeScript and React Native. It provides users with a simple and intuitive interface to measure elapsed time accurately and efficiently.
The app's main screen displays a large digital timer at the center, indicating the elapsed time in hours, minutes, seconds, and milliseconds. Users can start, pause, and reset the stopwatch using easily accessible buttons below the timer.
`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },
      {
        name: "React Hooks",
        color: "orange-text-gradient",
      },
    ],
  },
  {
    id: 3,
    str: "TicTacToe",
    url: TicTacToe,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/TicTacToe",
    description: `The Tic Tac Toe app is a mobile application built using TypeScript and React Native. It brings the classic game of Tic Tac Toe to your fingertips, allowing you to play against an AI opponent or challenge your friends in a turn-based gameplay.
With a user-friendly interface and intuitive controls, the app provides an enjoyable gaming experience. The game board is displayed on the screen, divided into a 3x3 grid. Each player takes turns marking their symbol (either "X" or "O") in an empty cell of their choice.`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },
      {
        name: "React Hooks",
        color: "orange-text-gradient",
      },
      {
        name: "snackbar",
        color: "pink-text-gradient",
      },
      {
        name: "vector-icons",
        color: "white-text-gradient",
      },
    ],
  },
  {
    id: 4,
    str: "Counter",
    url: counter,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/Counter",
    description: `The Counter App is a simple mobile application developed using TypeScript and React Native. It provides a user-friendly interface that allows users to increment and decrement a counter value with just a few taps.
Upon launching the app, users are greeted with a clean and intuitive screen displaying the current counter value. The interface consists of a large numerical display, accompanied by two buttons labeled 'Increment' and 'Decrement.'`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },
      {
        name: "React Hooks",
        color: "orange-text-gradient",
      },
    ],
  },
  {
    id: 5,
    str: "BackGround Changer",
    url: bgc,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/BgChanger",
    description: `The Background Changer app is a mobile application built using TypeScript and React Native. It allows users to dynamically change the background color of their device's screen, providing a personalized and customizable experience.

With the app, users can easily select and apply different background colors at random or create their own custom colors. The intuitive user interface enables smooth navigation and effortless color selection.`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },
      {
        name: "React Hooks",
        color: "orange-text-gradient",
      },
    ],
  },
  {
    id: 6,
    str: "Color Changer",
    url: colorChanger,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/ColorChanger",
    description: `The Component Color Changer app is a mobile application developed using TypeScript and React Native. It provides users with a simple and intuitive interface to change the color of a component in real-time.
Upon launching the app, users are greeted with a screen that displays a preview of the component and a color change button at random. `,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },
      {
        name: "React Hooks",
        color: "orange-text-gradient",
      },
    ],
  },
  {
    id: 7,
    str: "Currency Converter",
    url: cc,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/CurrencyConverter",
    description: `The Currency Converter app is a mobile application developed using React Native, TypeScript, and various hooks, such as useState and useEffect. It provides users with a convenient way to convert currencies based on real-time exchange rates.
The app utilizes the FlatList component, which is a powerful tool in React Native for efficiently rendering lists of data. It allows users to scroll through a list of currencies and select the ones they want to convert.
Using hooks like useState, the app keeps track of the selected currencies and the conversion rates. When the user selects a currency, the app fetches the latest exchange rate using an API and updates the conversion rate accordingly.`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },
      {
        name: "React Hooks",
        color: "orange-text-gradient",
      },
      {
        name: "react-native-snackbar",
        color: "pink-text-gradient",
      },
    ],
  },
  {
    id: 8,
    str: "Dice Roll",
    url: dice,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/DiceRoll",
    description: `The Dice Roll app is a fun and interactive mobile application developed using TypeScript and React Native. It allows users to simulate rolling dice on their device by simply tapping the screen.
The app utilizes hooks, a feature introduced in React, to manage the state and handle user interactions. With hooks, the app can maintain the current dice face value and update it dynamically with each roll.`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "react-native-haptic-feedback",
        color: "pink-text-gradient",
      },
    ],
  },
  {
    id: 9,
    str: "List Accordian",
    url: listacc,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/ListAccordian",
    description: `The app is a React Native application built with React Native Paper, TypeScript, and hooks. It allows users to fetch data from a JSON file hosted at a specific link and dynamically create a list of accordions based on the fetched data.
The app starts by making an HTTP request to the provided link to retrieve the JSON file. It utilizes the fetch API to perform the request. Once the data is successfully fetched, it is stored in the application's state using hook useState.
Using the data from the fetched JSON file, the app dynamically generates a list of accordions. Each accordion represents an item from the JSON data and contains relevant information. The React Native Paper library is used to create the accordion component, which provides a collapsible and expandable interface.`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },

      {
        name: "vector-icons",
        color: "orange-text-gradient",
      },
      {
        name: "react-native-paper",
        color: "blue-text-gradient",
      },
    ],
  },

  {
    id: 10,
    str: "Travellers",
    url: travellers,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/project05",
    description: `The Traveling App is a mobile application developed using React Native, TypeScript, and various modern techniques such as FlatList and Hooks. It aims to provide users with a convenient and intuitive platform to explore and plan their travel adventures.

With the Traveling App, users can browse through a curated list of popular destinations, hotels, attractions, and activities. The app leverages the power of the FlatList component, which efficiently renders large lists of items with optimal performance. The list of travel options dynamically updates as the user scrolls, ensuring a smooth and seamless experience.`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },

      {
        name: "react-navigation/native-stack",
        color: "pink-text-gradient",
      },
    ],
  },
  {
    id: 11,
    str: "Password Generator",
    url: passwordGenerator,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/project04",
    description: `SecurePass is a powerful and user-friendly password generator app designed to help you create secure and unique passwords with ease. With its intuitive interface and robust features, SecurePass ensures that your online accounts and sensitive information stay protected.
Key Features:
1-Formik Integration
2-Yup Validation
3-Bouncy Checkbox
4-Copy to Clipboard
5-Dark Mode Support`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },
      {
        name: "React Hooks",
        color: "orange-text-gradient",
      },
      {
        name: "Formik",
        color: "pink-text-gradient",
      },
      {
        name: "Yup",
        color: "white-text-gradient",
      },
    ],
  },
  {
    id: 12,
    str: "Calculator",
    url: calculator,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/project06",
    description: `The Calculator App is a user-friendly mobile application built with React Native and TypeScript. It provides a simple and intuitive interface for performing basic arithmetic calculations on a mobile device. Whether you need to add, subtract, multiply, or divide numbers, this app has got you covered.`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },
      {
        name: "React Hooks",
        color: "orange-text-gradient",
      },
    ],
  },
  {
    id: 12,
    str: "Calender",
    url: calender,
    play: "https://github.com/prakharkumar84/React-Native/tree/main/calender",
    description: `The Calendar App is a mobile application built using React Native and TypeScript that allows users to manage their schedules, events, and tasks efficiently. The app provides a user-friendly interface for viewing, creating, editing, and deleting events and tasks in a calendar format.The app displays a monthly calendar view that shows the current month with the ability to navigate to previous and future months.
Each day on the calendar displays the events and tasks scheduled for that day.`,
    tags: [
      {
        name: "React Native",
        color: "blue-text-gradient",
      },
      {
        name: "TypeScript",
        color: "green-text-gradient",
      },
      {
        name: "Java",
        color: "pink-text-gradient",
      },
      {
        name: "React Hooks",
        color: "orange-text-gradient",
      },
    ],
  },
];
const contact = [
  {
    id: 1,
    url: "https://img.icons8.com/office/40/000000/email.png",
    link: "#mailme",
    tag: "Send a mail",
  },
  {
    id: 2,
    url: "https://img.icons8.com/ultraviolet/40/000000/phone.png",
    link: "tel:+917905671093",
    tag: "Give me a call",
  },
  {
    id: 3,
    url: "https://img.icons8.com/ultraviolet/40/000000/facebook-new.png",
    link: "https://www.facebook.com/prakharsingh.singh10/",
    tag: "/prakhar.kumar",
  },
  {
    id: 4,
    url: "https://img.icons8.com/ultraviolet/40/000000/twitter.png",
    link: "https://twitter.com/Prakhar1251",
    tag: "/prakhar88",
  },
  {
    id: 5,
    url: "https://img.icons8.com/ultraviolet/40/000000/instagram-new.png",
    link: "https://www.instagram.com/pk._.boss/",
    tag: "/kumar_prakhar",
  },
  {
    id: 6,
    url: "https://img.icons8.com/office/40/000000/linkedin.png",
    link: "https://www.linkedin.com/in/prakhar-k-54265493/",
    tag: "prakhar-k",
  },
];

export {
  contact,
  game,
  animation,
  company,
  services,
  technologies,
  experiences,
  testimonials,
  projects,
  AnimationVideos,
  native,
};
