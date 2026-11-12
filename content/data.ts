// All site copy lives here — edit text without touching components.

export const profile = {
  firstName: "Sahana",
  lastName: "Kulal",
  role: "Application Engineer",
  location: "India",
  company: "Ati Motors",
  intro:
    "Application engineer with 3+ years building real-time web apps for industrial automation. I debug production issues across live customer robot fleets and ship reliable React, TypeScript and WebRTC interfaces for 30+ AMRs.",
  rotatingLines: [
    "debug production issues on live robot fleets.",
    "build WebSocket-driven dashboards for AMRs.",
    "stream low-latency teleoperation with WebRTC.",
    "turn LiDAR point clouds into clear 2D views.",
    "track fleet KPIs with Grafana and PostgreSQL.",
    "tune React rendering for high-frequency data.",
  ],
  resumeUrl: "/Sahana_Resume.pdf",
  about: [
    "I'm an application engineer at **Ati Motors**, working on the software that runs **autonomous mobile robots (AMRs)** on factory floors. My work is making what those robots do visible, reliable and easy to fix for the people who run them.",
    "Today I **investigate and resolve production issues** across live customer fleets — reading logs, API responses, **WebSocket** events and browser diagnostics — and support **production deployments** and release verification. I also build **Grafana dashboards** for fleet KPIs like MTTR, travel distance and obstacle time.",
    "Before that, as a software engineer, I built **15+ reusable React/TypeScript components**, a **map-based real-time interface for 20+ Sherpa AMRs**, **TeleOps** with a **WebRTC** video link and a **2D LiDAR overlay**, and alert-prioritized monitoring cards across **30+ AMRs in 3 facilities**.",
    "I'm strongest where **real-time data**, **production debugging** and **thoughtful UI** meet — in **React**, **TypeScript**, **MUI** and **Zustand**, backed by **REST APIs** and **SQL**.",
  ],
  education: {
    school: "Yenepoya Institute of Technology, Moodbidri",
    degree: "BE, Computer Science & Engineering",
    period: "2018 — 2022",
  },
};

export const links = {
  email: "sahanak3149@gmail.com",
  phone: "+91 7676373587",
  linkedin: "https://www.linkedin.com/in/sahana-kulal-831521261/",
};

export const navItems = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export const metrics: { value: number; suffix: string; decimals?: number; label: string }[] = [
  { value: 30, suffix: "+", label: "AMRs on live dashboards" },
  { value: 5, suffix: "+", label: "Factories served" },
  { value: 50, suffix: "%", label: "Faster critical-task response" },
  { value: 35, suffix: "%", label: "App performance boost" },
];

export const experience = [
  {
    company: "Ati Motors",
    role: "Application Engineer",
    period: "Jun 2026 — Present",
    highlights: [
      "Investigated and resolved production issues across live AMR fleets using logs, API responses, WebSocket events and browser diagnostics.",
      "Supported production deployments and post-deployment validation, including build issue investigation and release verification.",
      "Built and maintained Grafana dashboards for fleet KPIs: operating hours, travel distance, errors, MTTR, break counts and obstacle time.",
      "Fixed PostgreSQL query accuracy issues behind the dashboards, including sessions crossing midnight and pre-deployment data skewing KPI totals.",
      "Optimized React rendering with React.memo, Zustand selectors, lazy loading and code splitting for high-frequency real-time dashboards.",
    ],
    tech: ["React", "TypeScript", "Zustand", "Grafana", "PostgreSQL", "Docker"],
  },
  {
    company: "Ati Motors",
    role: "Software Engineer",
    period: "May 2023 — May 2026",
    highlights: [
      "Built 15+ reusable React/TypeScript components for industrial dashboards, cutting development time by 25% and boosting performance by 35%.",
      "Embedded real-time 2D visualization of 3D LiDAR point cloud data into the TeleOps interface.",
      "Developed real-time AMR monitoring cards with alert prioritization (error/warning sorting + 15-second rotation) across 30+ AMRs in 3 facilities.",
      "Connected the frontend with 3+ ERP/MES systems, automating 20% of daily scheduling workflows.",
      "Crafted a map-based real-time interface for 20+ Sherpa AMRs, reducing critical task response time by 50%.",
    ],
    tech: ["React", "TypeScript", "MUI", "WebRTC", "D3.js", "REST APIs"],
  },
];

export type ProjectId = "fleet" | "teleops" | "monitor" | "mts" | "analytics";

export const projects: {
  id: ProjectId;
  index: string;
  title: string;
  kicker: string;
  color: "cyan" | "blue" | "violet";
  stack: string[];
  steps: { title: string; body: string }[];
}[] = [
  {
    id: "fleet",
    index: "01",
    title: "ATI Fleet Manager",
    kicker: "Real-time Operator Dashboards",
    color: "cyan",
    stack: ["React", "TypeScript", "WebSocket", "Chart.js"],
    steps: [
      {
        title: "Map-based control",
        body: "A real-time map UI for 20+ Sherpa AMRs with dynamic task visualization and interactive zoom to inspect terminal lines and precise AMR positions.",
      },
      {
        title: "Sub-second updates",
        body: "Supervisors monitor fleet status, alerts and task execution over sub-second WebSocket updates, with 6-month persistent sessions that survive browser sessions and reconnects.",
      },
      {
        title: "Analytics and traffic control",
        body: "A Chart.js analytics dashboard for trips, distance, takt time and wait times, plus a traffic signal plugin (traffic lights and patlite) with zone-based assignment and full CRUD.",
      },
    ],
  },
  {
    id: "teleops",
    index: "02",
    title: "TeleOps",
    kicker: "Remote Robot Operation",
    color: "blue",
    stack: ["React", "WebRTC", "TypeScript", "LiDAR"],
    steps: [
      {
        title: "Live video and control",
        body: "A WebRTC-based teleoperation system with full remote AMR control.",
      },
      {
        title: "100 ms video latency",
        body: "Low-latency video lets operators navigate remotely with confidence.",
      },
      {
        title: "Sees what the robot sees",
        body: "A real-time 2D LiDAR point cloud overlay gives operators spatial awareness during remote navigation.",
      },
    ],
  },
  {
    id: "monitor",
    index: "03",
    title: "AMR Monitoring",
    kicker: "Alert-driven Dashboard",
    color: "violet",
    stack: ["React", "TypeScript", "MUI", "Real-time"],
    steps: [
      {
        title: "Live status cards",
        body: "Real-time monitoring cards for each AMR, deployed across 30+ AMRs in 3 facilities.",
      },
      {
        title: "Alerts rise to the top",
        body: "AMRs with errors or warnings are sorted to the top automatically.",
      },
      {
        title: "Rotating focus",
        body: "When several alerts fire, the view rotates every 15 seconds so none gets missed.",
      },
    ],
  },
  {
    id: "mts",
    index: "04",
    title: "Material Tracking",
    kicker: "Enterprise Frontend (MTS)",
    color: "cyan",
    stack: ["React", "Zustand", "WebSocket", "Axios", "react-i18next"],
    steps: [
      {
        title: "Frontend architecture",
        body: "Led the complete frontend: 10+ domain modules, Zustand across 10 domain stores for real-time data consistency, a WebSocket client for live AMR event updates, and REST API and event-stream calls through Axios.",
      },
      {
        title: "Order to delivery",
        body: "Order processing, delivery scheduling and AMR integration, with staging area management, device configuration and WIP inventory tracking.",
      },
      {
        title: "Approvals, bulk config, two languages",
        body: "Role-based requester and approver screens for inventory approvals, material configuration with bulk CSV/Excel upload and validation, and an English/Spanish UI built with react-i18next.",
      },
    ],
  },
  {
    id: "analytics",
    index: "05",
    title: "Fleet Analytics",
    kicker: "Grafana KPI Dashboards",
    color: "blue",
    stack: ["Grafana", "PostgreSQL", "SQL", "Docker"],
    steps: [
      {
        title: "Fleet KPIs at a glance",
        body: "Built and maintained Grafana dashboards tracking robot fleet KPIs: operating hours and travel distance per Sherpa.",
      },
      {
        title: "Errors and stoppages",
        body: "Errors, break counts and obstacle time broken down by day, robot and error type, so recurring problems stand out.",
      },
      {
        title: "Numbers you can trust",
        body: "Tracked MTTR, and updated the PostgreSQL queries behind the dashboards to fix data accuracy issues: sessions crossing midnight and pre-deployment data skewing KPI totals.",
      },
    ],
  },
];

export const skills = [
  { group: "Languages", items: ["JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3"] },
  { group: "Frameworks & Libraries", items: ["React.js", "Material UI", "Bootstrap", "D3.js", "Plotly", "Zustand"] },
  { group: "APIs & Protocols", items: ["REST APIs", "WebSocket", "WebRTC"] },
  { group: "Visualization", items: ["LiDAR Point Cloud (2D)", "Real-Time Dashboards", "Grafana"] },
  { group: "Tools", items: ["VS Code", "Vite", "Git", "GitHub", "Docker", "Chrome DevTools"] },
  { group: "Practices & Data", items: ["Agile Scrum", "Component-Based Architecture", "i18n", "SQL"] },
];
