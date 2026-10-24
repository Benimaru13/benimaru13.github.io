/** Project content is separate from the reader renderer so titles, links and
 * future media can be edited without changing navigation. Null URLs/dates mean
 * unverified, never guessed. Repo upload dates are not project completion dates.
 * Sources: the user's resumes, LinkedIn project entries and public GitHub READMEs.
 */
export const projectGroups = [
  {
    title: "Group Projects",
    items: [
      {
        title: "SignWave",
        date: "May 2026",
        repo: "https://github.com/Benimaru13/Sign-Wave-Project",
        description:
          "A gesture-controlled smart toy car built with a four-person team. I developed software connecting camera-based video to a Raspberry Pi and transmitting gesture commands over UDP.",
        links: [],
        media: {
          src: "/assets/photos/signwave-demo.gif",
          poster: "/assets/photos/signwave-poster.jpg",
          alt: "SignWave gesture-controlled toy car demonstration",
        },
      },
      {
        title: "LeSafety",
        date: "October 2026",
        repo: "https://github.com/Andrew4436/storm-hackathon-2026",
        description:
          "Built with a team at StormHacks 2026, LeSafety maps Vancouver’s reported-incident trends and forecasts activity relative to each neighbourhood’s own history. I worked on the ML model, feature development, evaluation and uncertainty estimates, using a Poisson GLM for the forecasts.",
        links: [
          { label: "Devpost ↗", url: "https://devpost.com/software/le-safety" },
          {
            label: "Live demo ↗",
            url: "https://www.i-have-no-idea-what-i-am-doing.tech",
          },
        ],
        media: {
          src: "/assets/photos/le-safety-ss.png",
          alt: "LeSafety Vancouver neighbourhood incident trend map",
        },
      },
      {
        title: "SPEAK Up BC",
        date: "March 2026",
        repo: "https://github.com/Benimaru13/SPEAK-Up-BC",
        description:
          "A student-built prototype for reporting racist incidents and tracking case updates in BC high schools. I contributed as Tech & Demo Lead in our four-person YEEP Hackathon team, which won the $3,000 grand prize.",
        links: [],
        media: {
          src: "/assets/photos/speakupbc-frontend.png",
          alt: "SPEAK Up BC student reporting platform homepage",
        },
      },
    ],
  },
  {
    title: "Personal Projects",
    items: [
      {
        title: "Handwriting Classifier",
        date: "August 2025 · In progress",
        repo: "https://github.com/Benimaru13/Personal-Projects/tree/main/Handwriting-Distinguisher",
        description:
          "An ongoing TensorFlow/Keras CNN experiment to distinguish handwriting styles using samples from my siblings and me. I’m exploring preprocessing, model architecture and the challenges of learning from a small dataset.",
        links: [],
        media: {
          src: "/assets/photos/handwriting-in-progress.jpg",
          alt: "Under construction tape indicating the handwriting classifier is in progress",
        },
      },
      {
        title: "Basketball Shot Predictor",
        date: "May–June 2025",
        repo: "https://github.com/Benimaru13/Personal-Projects/tree/main/basketball-shot-predictor",
        description:
          "A machine learning project exploring shot-success prediction from data from Lebron James' 2024-25 NBA season and contextual features. I experimented with Logistic Regression and Random Forest models, combining coding with my interest in basketball.",
        links: [],
        media: {
          src: "/assets/photos/bb-shot-chart.png",
          alt: "Basketball shot locations plotted on a court",
        },
      },
    ],
  },
];
