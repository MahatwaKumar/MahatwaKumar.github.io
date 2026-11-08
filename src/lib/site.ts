// One place for personal details used across the site.
export const site = {
  name: 'Mahatwa Kumar',
  title: 'Mahatwa Kumar · Mechanical Engineering',
  headline: 'Mechanical engineering student designing with simulation: CFD, thermal systems and robotics',
  description:
    'Portfolio of Mahatwa Kumar, Mechanical Engineering junior at UCLA: CFD and aerodynamics, thermal and battery systems, CAD, mechatronics and robotics.',
  email: 'mahatwa1856@g.ucla.edu',
  linkedin: 'https://www.linkedin.com/in/mahatwakumar',
  // TODO(Mahatwa): add your GitHub username, e.g. 'mahatwakumar'. The GitHub link stays hidden while this is empty.
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
