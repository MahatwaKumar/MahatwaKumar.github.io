// Content taken from the resume (Mahatwa_Kumar_Resume.pdf), in the same wording.

export const education = {
  school: 'University of California, Los Angeles (UCLA)',
  location: 'Los Angeles, CA',
  degree: 'B.S. Mechanical Engineering, Samueli School of Engineering',
  gpa: '3.61/4.00',
  grad: 'Expected June 2028',
  coursework: ['Fluid Mechanics', 'Intermediate Fluid Mechanics', 'Transport Phenomena', 'Thermodynamics', 'Dynamics', 'Materials Science', 'Dynamic Systems Lab', 'Circuit Measurements Lab', 'Computer-Aided Design'],
};

export const experience = [
  {
    org: 'Indian Institute of Technology Delhi',
    role: 'ASPIRE Summer Research Fellow, Mechanics of Soft Active Materials Lab (Prof. Sushma Santapuri)',
    place: 'New Delhi, India',
    when: 'Summer 2026',
    points: [
      'Modeled an ultra-thin honeycomb underwater acoustic metamaterial in Fusion 360 (rubber-steel-rubber resonator cells), reproducing a published design for prototyping',
      'Adapted it for in-lab fabrication: 3D-printed resin in place of steel, and silicone elastomers selected via Shore-hardness conversion to hit a 0.5 MPa target modulus',
      'Modeled exosuit cable friction with the capstan equation to compare sheath routings and actuator placements',
    ],
  },
  {
    org: 'University of California, Los Angeles',
    role: 'Course Grader, Thermodynamics (Prof. Wei)',
    place: 'Los Angeles, CA',
    when: 'Spring 2026',
    points: ['Graded homework and exams for 102 students in upper-division Thermodynamics, with written feedback on methods'],
  },
  {
    org: 'CO-OPTS',
    role: 'Engineering Design Intern',
    place: 'Remote',
    when: 'Summer 2025',
    points: ['Took a modular product prototype in Fusion 360 from concept to final design, meeting all core functional requirements'],
  },
];

export const skills = [
  { group: 'CFD & Simulation', items: ['Ansys Fluent', 'Fluent Meshing', 'k-ω SST RANS', 'Conjugate heat transfer', 'COMSOL', 'Lap-time simulation'] },
  { group: 'CAD & Prototyping', items: ['SolidWorks', 'Fusion 360 (CAD/CAM)', 'CadQuery', 'Engineering drawings & BOMs', 'FDM, SLA and SLS 3D printing'] },
  { group: 'Programming & Electronics', items: ['Python', 'MATLAB', 'C++', 'Embedded C (ESP32, nRF52)', 'Motor control', 'LaTeX'] },
];

export const publication = {
  text: 'Kumar, M. & Bowal, K. (2021). Exoskeleton for Knee Arthritis Patients. Journal of Student Research, 10.',
  doi: 'https://doi.org/10.47611/jsrhs.v10i4.1924',
};

export const honors = ['UCLA Samueli School of Engineering Scholarship Supplement', 'ASPIRE Summer Research Fellowship, IIT Delhi'];
