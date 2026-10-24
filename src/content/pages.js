/** Authored biography, preferred experience ordering and photo mapping.
 * Profile sections use [heading, paragraphs, photo key]. Experience objects
 * use named fields and a duties array. A null photo is intentionally text-only. */
export const pages = {
  profile: {
    title: "Hi, Chibueze Here!",
    label: "PERSONAL PROFILE",
    intro: "I’m glad you made it here. Feel free to look around :)",
    sections: [
      [
        "A brief blurb",
        "I’m a first-year General Science student at Kwantlen Polytechnic University with a strong interest in pursuing Computer Science. My dream is to create technology that gives others the opportunity to grow, innovate freely and achieve their dreams. I’m a curious person, and I love working on fun technical projects and building cool things. I love to code, especially in Python! In my spare time, I’m usually working on a coding project, watching basketball, binging One Piece or watching YouTube videos. I also love playing badminton and rugby, keeping up with F1 (DU DU DUDU), and going to the gym once in a while. I’m a geek at heart so I enjoy talking about trendy tech topics, especially AI or machine learning.",
        "Portrait of Chibueze",
      ],
      [
        "The things I enjoy",
        "I enjoy hiking, going to the gym, watching YouTube and playing basketball.",
        "Hobby collage",
      ],
    ],
  },
  experiences: {
    title: "My experiences",
    label: "EXPERIENCES",
    intro:
      "This details my work experiences, volunteer roles, and hackathon photos.",
    // Display order is intentional; each role owns its dates, duties and skills.
    // Optional photoPosition: "50% 50%" adjusts a square crop without editing the image.
    // Use photo: null for roles with no photo instead of adding a placeholder.
    sections: [
      {
        organization: "Ethos Lab",
        location: "North America · On-site",
        role: "Summer Intern",
        dates: "July – August 2026",
        photo: "Ethos Lab experience photo",
        skills: [
          "Volunteer Engagement",
          "Event Management",
          "Leadership",
          "Organization Skills",
          "Architectural Design",
        ],
        duties: [
          "For Ethos Lab’s week-long Youth Takeover, I led spatial planning and organized layouts, visitor flow and signage to create an accessible, easy-to-navigate event space.",
          "To keep preparations aligned, I coordinated with Design, Engineering, Trailer and Marketing teams, and coordinated timelines and physical requirements.",
          "Using limited resources, I helped plan interactive stations such as VR build battles, robotics races and creative activities, for a varied youth experience.",
          "Through planning, setup and cross-team collaboration, I contributed to an event that engaged more than 200 participants throughout the week.",
        ],
      },
      {
        organization: "Thrive-4-Blacks",
        location: "Surrey, BC",
        role: "Youth Coordinator",
        dates: "December 2025 – Present",
        photo: "Thrive-4-Blacks experience photos",
        skills: [
          "Workshop facilitation",
          "Youth engagement",
          "Cross-cultural Communication",
          "Community Outreach",
        ],
        duties: [
          "To support educational programming for youth, I help organize events and assist with their delivery, contributing to the preparation and execution of community programs.",
          "During educational sessions, I present on topics such as scholarships and grants to help participants learn about opportunities available to them.",
          "For cultural events, I volunteer with the organizing team and support event delivery, contributing to activities that bring the community together.",
          "As part of event proceedings, I deliver land acknowledgements and support the program alongside other organizers and volunteers.",
        ],
      },
      {
        organization: "XD Hacks Mini Vancouver",
        location: "Surrey, BC",
        role: "Logistics Director",
        dates: "October 2025 – June 2026",
        photo: "XD Hacks Team Photo",
        skills: [
          "Event Logistics",
          "Stakeholder Coordination",
          "Scheduling",
          "Cross-team Collaboration",
          "Debugging Support",
        ],
        duties: [
          "For HackYourLife 2026 at BCIT’s Burnaby campus, I coordinated logistics and facility setup to prepare the space for the hackathon.",
          "To support the event’s sessions and participant experience, I helped coordinate outreach to speakers, workshop hosts, mentors and judges.",
          "During the hackathon, I helped manage the schedule and troubleshoot operational issues to keep activities moving.",
          "Working across the organizing team, I aligned logistics with other departments and helped participants debug problems so they could continue developing their projects.",
        ],
      },
      {
        organization: "Falcon Technologies Corp.",
        location: "Surrey, BC",
        role: "Software Development Intern",
        dates: "April – May 2026",
        photo: null,
        duties: [
          "To keep developer-tool trend data updated, I developed a Python script that retrieved, cleaned and stored more than 17,000 API records per snapshot.",
          "To make the collected data easier to explore, I built a Flask dashboard with search, filters, interactive charts and CSV/JSON exports.",
          "To identify changes in package activity, I compared SQLite snapshots and visualized the largest movers in rolling 30-day installation data.",
          "To support repeatable data collection and development, I scheduled daily extraction and used Git and GitHub to manage code changes.",
        ],
        skills: [
          "Python",
          "Flask",
          "SQLite",
          "API Integration",
          "Git / GitHub",
          "Data Visualization",
        ],
      },
      {
        organization: "Digital Storyworks",
        location: "Surrey, BC · Remote",
        role: "Team Coordinator Intern",
        dates: "August – October 2025",
        photo: null,
        duties: [
          "For client branding and social media work, I coordinated tasks and timelines across a five-person team to organize delivery.",
          "To support clients’ visual identities, I designed logos and promotional materials around their branding needs.",
          "For brands seeking a stronger social media presence, I helped develop engagement strategies and coordinate the team’s contributions.",
          "To build awareness of Digital Storyworks, I reached out to potential clients and introduced them to its services.",
        ],
        skills: [
          "Team Coordination",
          "Project Scheduling",
          "Graphic Design",
          "Branding",
        ],
      },
      {
        organization: "Freelance Graphic Designer",
        role: "Self-employed",
        dates: "2023",
        photo: null,
        duties: [
          "For clients seeking visual branding materials, I used Photoshop and Canva to create logos, posters and social media assets.",
          "To translate client ideas into designs, I worked with them to understand their needs and develop appropriate visuals.",
          "To support project delivery, I managed timelines and coordinated the completion of client work.",
        ],
        skills: [
          "Photoshop",
          "Canva",
          "Graphic Design",
          "Client Communication",
        ],
      },
    ],
  },
  projects: {
    title: "Things I’ve built",
    label: "03 / PROJECTS",
    intro: "Team efforts, personal experiments and ideas I’m bringing to life.",
    sections: [],
  },
};

// Explicit role mapping prevents unrelated event photos appearing under a job.
export const rolePhotos = {
  "Ethos Lab experience photo": "/assets/photos/ethos-team.jpg",
  "Thrive-4-Blacks experience photos": "/assets/photos/youth-coordinator.jpg",
  "XD Hacks Team Photo": "/assets/photos/xd-hacks.png",
  "YEEP Group Photo": "/assets/photos/yeep-team.png",
  "Daydream Vancouver": "/assets/photos/daydream.png",
};
