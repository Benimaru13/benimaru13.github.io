/** Authored project records: display order, links, media and STAR-style duties.
 * Keep results tied to evidence; ongoing projects need not claim a finished result.
 * The short description remains a fallback for entries without duty bullets.
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
        duties: [
          "For a four-person smart toy car project, I worked on connecting hand gestures to wireless driving commands.",
          "I integrated OpenCV and MediaPipe with UDP messaging to translate three gestures into forward, backward and stop commands.",
          "I helped troubleshoot controller-to-car communication using SSH and network checks, contributing to a working gesture-controlled car demonstration.",
        ],
        skills: ["Python", "OpenCV", "MediaPipe", "Raspberry Pi", "UDP", "SSH"],
      },
      {
        title: "LeSafety",
        date: "October 2026",
        repo: "https://github.com/Andrew4436/storm-hackathon-2026",
        description:
          "Built with a team at StormHacks 2026, LeSafety maps Vancouver’s reported-incident trends and forecasts activity relative to each neighbourhood’s own history. I worked on the ML model, feature development, evaluation and uncertainty estimates, using a Poisson GLM for the forecasts.",
        links: [
          {
            label: "Devpost ↗",
            url: "https://devpost.com/software/le-safety",
          },
          {
            label: "Live demo ↗",
            url: "https://www.i-have-no-idea-what-i-am-doing.tech",
          },
        ],
        media: {
          src: "/assets/photos/le-safety-ss.png",
          alt: "LeSafety Vancouver neighbourhood incident trend map",
        },
        duties: [
          "At StormHacks 2026, our team built a Vancouver map to help people explore reported-incident trends in the context of each neighbourhood’s own history.",
          "I built the ML pipeline, aggregating 942,457 reported incidents into 6,840 neighbourhood-month records and evaluating Poisson regression with activity, seasonality and severity features.",
          "The model achieved 4.3% lower pooled MAE than a 12-month-average baseline across 20 held-out calendar months. I also produced forecast probabilities and 80% uncertainty ranges for the deployed map.",
        ],
        skills: [
          "Python",
          "pandas",
          "NumPy",
          "scikit-learn",
          "Jupyter",
          "Git / GitHub",
        ],
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
        duties: [
          "For the YEEP Hackathon, our four-person team developed a prototype to help BC students report racist incidents and track case updates.",
          "As Tech & Demo Lead, I contributed to the reporting and admin interfaces, which used localStorage for submissions, tracking codes and status updates.",
          "I helped pitch the working prototype and its school-accountability concept; our team won the $3,000 grand prize.",
        ],
        skills: ["JavaScript", "HTML", "CSS", "Pitching", "Prototyping"],
      },
    ],
  },
  {
    title: "Personal Projects",
    items: [
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
        duties: [
          "To combine my interest in basketball with machine learning, I explored shot-success prediction using LeBron James’ 2024–25 NBA season data and contextual features.",
          "I experimented with Logistic Regression and Random Forest models to investigate how those features relate to whether a shot goes in.",
          "The project gave me practice applying classification models to sports data and visualizing shot locations.",
        ],
        skills: [
          "Python",
          "scikit-learn",
          "Classification",
          "Data Visualization",
        ],
      },
      {
        title: "Handwriting Classifier",
        date: "August 2025 · In progress",
        repo: "https://github.com/Benimaru13/Personal-Projects/tree/main/Handwriting-Distinguisher",
        description:
          "An ongoing TensorFlow/Keras CNN experiment to distinguish handwriting styles using samples from my siblings and me. I’m exploring preprocessing, model architecture and the challenges of learning from a small dataset.",
        links: [],
        media: null,
        duties: [
          "To explore how a model can distinguish handwriting styles, I began collecting samples from my siblings and me.",
          "I am experimenting with a TensorFlow/Keras convolutional neural network and preprocessing approaches for this small dataset.",
          "The project is still in progress as I explore model architecture and the challenges of learning from limited samples.",
        ],
        skills: [
          "Python",
          "TensorFlow",
          "Keras",
          "Convolutional Neural Networks",
        ],
      },
    ],
  },
];
