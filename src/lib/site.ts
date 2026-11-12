// One place for personal details used across the site.
export const site = {
  name: 'Mahatwa Kumar',
  title: 'Mahatwa Kumar · Mechanical Engineering',
  headline: 'Mechanical engineering student designing with simulation: CFD, thermal systems and robotics',
  description:
    'Portfolio of Mahatwa Kumar, Mechanical Engineering junior at UCLA: CFD and aerodynamics, thermal and battery systems, CAD, mechatronics and robotics.',
  email: 'mahatwa1856@g.ucla.edu',
  linkedin: 'https://www.linkedin.com/in/mahatwakumar',
  githubUser: 'MahatwaKumar',
  school: 'University of California, Los Angeles (UCLA)',
  location: 'Los Angeles, CA',
};

export const githubUrl = site.githubUser ? `https://github.com/${site.githubUser}` : '';

export const filters = [
  { id: 'all', label: 'All' },
  { id: 'cfd', label: 'CFD' },
  { id: 'thermal', label: 'Thermal' },
  { id: 'cad', label: 'CAD' },
  { id: 'embedded', label: 'Embedded' },
  { id: 'robotics', label: 'Robotics' },
  { id: 'data-analysis', label: 'Data analysis' },
] as const;

export type TagId = Exclude<(typeof filters)[number]['id'], 'all'>;

export const statusLabels = {
  complete: 'Complete',
  'build-in-progress': 'Design complete, build in progress',
  'in-progress': 'In progress',
} as const;
export type Status = keyof typeof statusLabels;

// "About me" text shown on the home page and the About page.
export const aboutMe = {
  intro:
    "I'm a Mechanical Engineering junior at UCLA. I like problems where a car, a machine or a device has to meet a hard number, like drag, temperature, torque or range, and I use simulation and careful design to get there. On every project I say what I set out to answer, how I approached it, what the analysis showed and what went wrong along the way.",
  groups: [
    {
      title: 'What I work on',
      points: [
        'External aerodynamics in Ansys Fluent: an F1-style car and an EV, meshed in Fluent Meshing',
        'Thermal design: a liquid-cooled battery cold plate and the bench rig to test it',
        'Mechanical design in SolidWorks and Fusion 360: a robotic arm, an assistive exosuit and an acoustic metamaterial',
        'Physics-based models that turn simulation results into lap time, range or joint torque',
      ],
    },
    {
      title: 'What interests me',
      points: [
        'Motorsport aerodynamics, and why cars struggle to follow each other closely',
        'Making electric vehicles go further through lower drag and better battery cooling',
        'Robots and assistive devices that help people move and work',
        'Taking a design from simulation to a part I can print, build and test',
      ],
    },
    {
      title: "What I'm looking for",
      points: [
        'Internships and research roles in aerodynamics and CFD, thermal and battery systems, or mechanical design',
        'Teams in motorsport, EVs, aerospace or robotics',
        'Work where simulation is checked against hardware and test data',
      ],
    },
  ],
};
