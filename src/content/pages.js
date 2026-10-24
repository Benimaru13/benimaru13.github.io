/** Authored biography, preferred experience ordering and photo mapping.
 * Section tuples are [heading, paragraphs, photo key or null]. Null is an
 * intentional text-only layout, not a missing image to repair. */
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
    label: "02 / EXPERIENCES",
    intro:
      "This details my work experiences, volunteer roles, and hackathon photos.",
    sections: [
      [
        "Ethos Lab · Summer Intern, Architectural Team · July - August 2026",
        "I led spatial planning for a week-long Youth Takeover, coordinating activity layouts, visitor flow, signage and logistics. I collaborated across architecture, engineering, design, trailer and marketing teams on VR, robotics and creative activities for more than 200 youth participants.",
        "Ethos Lab experience photo",
      ],
      // Ordered by my preferred narrative rather than chronology.
      [
        "Thrive-4-Blacks Community Services Society · Youth Coordinator (On-call) · December 2025 - Present",
        "I support workshops for racialized immigrant youth, drawing on my own lived experiences to help students adapt to new social and cultural environments and prepare for their future goals.\n\nI help foster an inclusive community where incoming immigrant students can build confidence, develop soft skills and feel supported through the transition.",
        "Thrive-4-Blacks experience photos",
      ],
      [
        "XD Hacks Mini Vancouver · Logistics Director · October 2025 - June 2026",
        "I coordinated logistics and facility setup for HackYourLife 2026 at BCIT’s Burnaby campus. I also supported communication with speakers, mentors and judges for an event with more than 60 participants.",
        "XD Hacks Team Photo",
      ],
      [
        "Falcon Technologies · Sofware Development Intern · April – May 2026",
        "I developed a Python and Flask application that retrieved and displayed daily data through an external API. I used SQLite to store diagnostic trend data and Git/GitHub for version control.",
        null, // No photo available: render this chapter as a full-width text section.
      ],
      [
        "Digital Storyworks · Team Coordinator Intern · August – October 2025",
        "I coordinated tasks and timelines for a five-person team, designed promotional materials and logos, and supported social media and branding work around client needs.",
        null,
      ],
      [
        "Freelance Graphic Designer · Self-employed · 2023",
        "I created logos, posters and social media assets using Photoshop and Canva, translating client ideas into visuals and managing delivery timelines.",
        null,
      ],
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
