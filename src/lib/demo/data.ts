export interface DemoJob {
  id: string;
  title: string;
  company: string;
  initials: string;
  color: string;
  location: string;
  workMode: "Hybrid" | "Remote" | "Onsite";
  salary: string;
  match: number;
  skills: string[];
  posted: string;
  about: string;
  description: string[];
  responsibilities: string[];
  requirements: string[];
  matchReasons: string[];
  missingSkills: string[];
}

export const demoJobs: DemoJob[] = [
  {
    id: "frontend-developer-digital-nusantara",
    title: "Frontend Developer",
    company: "PT Digital Nusantara",
    initials: "DN",
    color: "bg-cyan-500",
    location: "Surabaya",
    workMode: "Hybrid",
    salary: "Rp 8.000.000 - 12.000.000",
    match: 92,
    skills: ["React", "JavaScript", "Git", "Tailwind CSS"],
    posted: "2 hari lalu",
    about:
      "PT Digital Nusantara adalah perusahaan teknologi yang membangun produk digital untuk ritel modern di seluruh Indonesia. Tim engineering kami kecil, kolaboratif, dan fokus pada kualitas.",
    description: [
      "Kami mencari Frontend Developer untuk bergabung dengan tim produk kami. Kamu akan membangun pengalaman web yang cepat, responsif, dan mudah digunakan oleh jutaan pengguna.",
      "Kamu akan bekerja bersama designer dan backend engineer dalam tim yang kecil namun berdampak besar. Kamu bebas berkontribusi mulai dari keputusan arsitektur hingga detail interaksi.",
    ],
    responsibilities: [
      "Membangun serta memelihara aplikasi web menggunakan React dan TypeScript",
      "Menerjemahkan desain Figma menjadi kode yang responsif dan dapat diakses",
      "Menulis test untuk memastikan kualitas dan stabilitas produk",
      "Berkolaborasi dengan designer, product manager, dan backend engineer",
    ],
    requirements: [
      "Paling tidak 2 tahun pengalaman sebagai Frontend Developer",
      "Menguasai React, JavaScript (ES6+), dan HTML/CSS",
      "Paham Git dan alur kerja kolaborasi tim",
      "Familiar dengan Tailwind CSS dan praktik responsive design",
    ],
    matchReasons: ["React", "JavaScript", "Git", "Portfolio Frontend"],
    missingSkills: ["Automated Testing", "TypeScript"],
  },
  {
    id: "ui-ux-designer-creative-studio",
    title: "UI/UX Designer",
    company: "Creative Studio",
    initials: "CS",
    color: "bg-violet-500",
    location: "Jakarta",
    workMode: "Remote",
    salary: "Rp 6.000.000 - 9.000.000",
    match: 88,
    skills: ["Figma", "Design System", "Prototyping", "User Research"],
    posted: "1 hari lalu",
    about:
      "Creative Studio adalah studio desain yang membantu startup membangun produk digital yang disukai pengguna, dari riset hingga detail visual.",
    description: [
      "Kami mengundang UI/UX Designer yang peka terhadap detail untuk bergabung mengerjakan produk klien dari berbagai industri.",
      "Kamu akan memimpin proses desain end-to-end, mulai dari riset pengguna, wireframe, hingga design system yang konsisten.",
    ],
    responsibilities: [
      "Merancang alur dan antarmuka produk web seluler",
      "Membangun serta menjaga design system",
      "Melakukan user research dan usability testing",
      "Berkolaborasi dengan tim engineering saat implementasi",
    ],
    requirements: [
      "Portofolio UI/UX yang kuat",
      "Mahir menggunakan Figma",
      "Paham prinsip design thinking dan accessibility",
      "Komunikasi yang baik dan terbiasa bekerja remote",
    ],
    matchReasons: ["Figma", "Design System", "Prototyping"],
    missingSkills: ["User Research", "Usability Testing"],
  },
  {
    id: "product-designer-tokoplas",
    title: "Product Designer",
    company: "Tokoplas",
    initials: "TP",
    color: "bg-emerald-500",
    location: "Bandung",
    workMode: "Hybrid",
    salary: "Rp 7.000.000 - 11.000.000",
    match: 85,
    skills: ["Figma", "Design Thinking", "Prototyping", "User Testing"],
    posted: "3 hari lalu",
    about:
      "Tokoplas adalah platform e-commerce produk rumah tangga dan industri berbasis di Bandung dengan pertumbuhan pengguna yang pesat.",
    description: [
      "Sebagai Product Designer, kamu akan membantu kami menjadikan pengalaman belanja online lebih sederhana dan menyenangkan.",
      "Kamu akan terlibat dalam seluruh siklus produk — dari memahami masalah pengguna hingga meluncurkan solusi yang terukur.",
    ],
    responsibilities: [
      "Mengidentifikasi masalah pengguna melalui data dan riset",
      "Membuat konsep, wireframe, dan high-fidelity design",
      "Melakukan user testing dan iterasi berdasarkan feedback",
      "Berkoordinasi dengan tim product dan engineering",
    ],
    requirements: [
      "3+ tahun pengalaman di product design",
      "Kemampuan storytelling dan presentasi yang kuat",
      "Familiar dengan tools analitik produk",
      "Portofolio yang menunjukkan dampak bisnis",
    ],
    matchReasons: ["Figma", "Design Thinking", "Prototyping"],
    missingSkills: ["Data-driven Design", "A/B Testing"],
  },
  {
    id: "backend-developer-fintek-karya",
    title: "Backend Developer",
    company: "Fintek Karya",
    initials: "FK",
    color: "bg-sky-600",
    location: "Jakarta",
    workMode: "Hybrid",
    salary: "Rp 9.000.000 - 14.000.000",
    match: 78,
    skills: ["Node.js", "PostgreSQL", "Redis", "Docker"],
    posted: "4 hari lalu",
    about:
      "Fintek Karya membangun layanan keuangan digital yang aman, cepat, dan inklusif untuk masyarakat Indonesia.",
    description: [
      "Kami mencari Backend Developer untuk membangun API yang skalabel dan andal di belakang produk fintech kami.",
      "Kamu akan bekerja dengan sistem yang berurusan dengan transaksi bernilai tinggi, sehingga ketelitian dan keamanan adalah prioritas.",
    ],
    responsibilities: [
      "Merancang dan membangun REST API menggunakan Node.js",
      "Mengoptimalkan query database dan performa sistem",
      "Menjaga keamanan dan keandalan layanan",
      "Menulis dokumentasi teknis yang jelas",
    ],
    requirements: [
      "Pengalaman 2+ tahun di backend development",
      "Mahir Node.js dan PostgreSQL",
      "Paham konsep sistem terdistribusi dan caching",
      "Familiar dengan containerization (Docker)",
    ],
    matchReasons: ["Sertifikat Belajar Dasar Backend", "Git"],
    missingSkills: ["Node.js", "PostgreSQL", "Docker"],
  },
  {
    id: "android-developer-gohive",
    title: "Mobile Developer (Android)",
    company: "GoHive",
    initials: "GH",
    color: "bg-amber-500",
    location: "Yogyakarta",
    workMode: "Onsite",
    salary: "Rp 7.500.000 - 11.000.000",
    match: 74,
    skills: ["Kotlin", "Android SDK", "REST API", "Firebase"],
    posted: "5 hari lalu",
    about:
      "GoHive adalah perusahaan rintisan yang membangun aplikasi produktivitas untuk pekerja lepas dan tim jarak jauh.",
    description: [
      "Kami mengundang Android Developer untuk membangun dan memelihara aplikasi mobile yang dipakai ribuan pengguna setiap hari.",
      "Kamu akan bekerja dalam tim kecil yang gesit dan suka bereksperimen dengan teknologi baru.",
    ],
    responsibilities: [
      "Membangun fitur baru pada aplikasi Android menggunakan Kotlin",
      "Memastikan stabilitas aplikasi dan performa yang mulus",
      "Berintegrasi dengan REST API",
      "Menjaga kualitas kode melalui code review",
    ],
    requirements: [
      "Pengalaman 1+ tahun di Android development",
      "Menguasai Kotlin dan Android SDK",
      "Paham arsitektur MVVM",
      "Terbiasa bekerja dengan Git",
    ],
    matchReasons: ["Java (Dasar)", "Kotlin (Dasar)"],
    missingSkills: ["Kotlin", "Android SDK", "Firebase"],
  },
  {
    id: "fullstack-developer-edukita",
    title: "Fullstack Developer",
    company: "Edukita",
    initials: "ED",
    color: "bg-rose-500",
    location: "Jakarta",
    workMode: "Remote",
    salary: "Rp 10.000.000 - 15.000.000",
    match: 81,
    skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    posted: "2 hari lalu",
    about:
      "Edukita adalah platform pembelajaran online yang menghubungkan murid dengan tutor terbaik di Indonesia.",
    description: [
      "Edukita mencari Fullstack Developer yang nyaman bekerja di seluruh lapisan produk, dari database hingga antarmuka pengguna.",
      "Kami adalah tim remote pertama yang bekerja secara asynchronous dengan standar kualitas tinggi.",
    ],
    responsibilities: [
      "Membangun fitur end-to-end menggunakan React dan Node.js",
      "Merancang skema database dan API",
      "Menulis unit dan integration test",
      "Berpartisipasi dalam perencanaan teknis dan code review",
    ],
    requirements: [
      "Pengalaman 3+ tahun sebagai fullstack developer",
      "Mahir React, Node.js, dan TypeScript",
      "Paham database NoSQL (MongoDB)",
      "Kemampuan komunikasi tertulis yang baik",
    ],
    matchReasons: ["React", "JavaScript", "Git"],
    missingSkills: ["Node.js", "MongoDB", "TypeScript"],
  },
];

export interface DemoTraining {
  id: string;
  title: string;
  category: string;
  difficulty: "Pemula" | "Menengah" | "Lanjutan";
  duration: string;
  progress: number;
  status: "berjalan" | "selesai" | "tersimpan";
  totalLessons: number;
  doneLessons: number;
}

export const demoTrainings: DemoTraining[] = [
  {
    id: "javascript-dasar",
    title: "JavaScript Dasar",
    category: "Pemrograman",
    difficulty: "Pemula",
    duration: "3 jam 20 menit",
    progress: 60,
    status: "berjalan",
    totalLessons: 25,
    doneLessons: 15,
  },
  {
    id: "react-pemula",
    title: "React untuk Pemula",
    category: "Frontend",
    difficulty: "Menengah",
    duration: "5 jam",
    progress: 25,
    status: "berjalan",
    totalLessons: 30,
    doneLessons: 8,
  },
  {
    id: "uiux-design",
    title: "UI/UX Design",
    category: "Design",
    difficulty: "Menengah",
    duration: "4 jam 15 menit",
    progress: 40,
    status: "berjalan",
    totalLessons: 22,
    doneLessons: 9,
  },
  {
    id: "interview-preparation",
    title: "Interview Preparation",
    category: "Karier",
    difficulty: "Pemula",
    duration: "2 jam",
    progress: 25,
    status: "berjalan",
    totalLessons: 12,
    doneLessons: 3,
  },
  {
    id: "git-github",
    title: "Git & GitHub Dasar",
    category: "Pemrograman",
    difficulty: "Pemula",
    duration: "3 jam",
    progress: 100,
    status: "selesai",
    totalLessons: 20,
    doneLessons: 20,
  },
  {
    id: "html-css",
    title: "HTML & CSS Modern",
    category: "Frontend",
    difficulty: "Pemula",
    duration: "4 jam",
    progress: 100,
    status: "selesai",
    totalLessons: 24,
    doneLessons: 24,
  },
  {
    id: "typescript-dasar",
    title: "TypeScript Dasar",
    category: "Frontend",
    difficulty: "Menengah",
    duration: "4 jam 30 menit",
    progress: 0,
    status: "tersimpan",
    totalLessons: 26,
    doneLessons: 0,
  },
  {
    id: "testing-jest",
    title: "Testing dengan Jest",
    category: "Frontend",
    difficulty: "Lanjutan",
    duration: "5 jam 30 menit",
    progress: 0,
    status: "tersimpan",
    totalLessons: 28,
    doneLessons: 0,
  },
];

export interface DemoAssessment {
  id: string;
  title: string;
  category: string;
  level: string;
  score?: number;
  maxScore: number;
  status: "selesai" | "belum";
  duration: string;
  questions: number;
  categories?: { name: string; score: number }[];
  strengths?: string[];
  gaps?: string[];
}

export const demoAssessments: DemoAssessment[] = [
  {
    id: "frontend-developer",
    title: "Frontend Developer Assessment",
    category: "Frontend",
    level: "Advanced",
    score: 86,
    maxScore: 100,
    status: "selesai",
    duration: "45 menit",
    questions: 40,
    categories: [
      { name: "React", score: 90 },
      { name: "JavaScript", score: 85 },
      { name: "HTML & CSS", score: 88 },
      { name: "Problem Solving", score: 80 },
      { name: "Best Practices", score: 85 },
    ],
    strengths: ["React", "JavaScript"],
    gaps: ["Testing", "TypeScript", "State Management"],
  },
  {
    id: "communication",
    title: "Communication Assessment",
    category: "Soft Skill",
    level: "Intermediate",
    score: 78,
    maxScore: 100,
    status: "selesai",
    duration: "30 menit",
    questions: 25,
  },
  {
    id: "problem-solving",
    title: "Problem Solving Assessment",
    category: "Logika",
    maxScore: 100,
    status: "belum",
    duration: "40 menit",
    questions: 18,
    level: "-",
  },
  {
    id: "logical-reasoning",
    title: "Logical Reasoning Assessment",
    category: "Logika",
    maxScore: 100,
    status: "belum",
    duration: "35 menit",
    questions: 20,
    level: "-",
  },
];

export const careerReadiness = {
  score: 82,
  message: "Kamu sudah cukup siap untuk mulai melamar pekerjaan.",
  breakdown: [
    { label: "CV", value: 90 },
    { label: "Portfolio", value: 85 },
    { label: "Skills", value: 82 },
    { label: "Assessment", value: 76 },
    { label: "Interview", value: 70 },
  ],
};

export const dashboardStats = [
  { key: "terkirim", label: "Lamaran Terkirim", value: "12", hint: "Total lamaran kamu", icon: "send", href: "/app/applications" },
  { key: "diproses", label: "Diproses", value: "5", hint: "Sedang direview HRD", icon: "clock", href: "/app/applications" },
  { key: "interview", label: "Interview", value: "2", hint: "Jadwal interview aktif", icon: "video", href: "/app/applications" },
  { key: "penawaran", label: "Penawaran", value: "0", hint: "Offers diterima", icon: "award", href: "/app/applications" },
];

export const demoActivities = [
  {
    id: "a1",
    text: "Lamaran kamu di PT Digital Nusantara sedang diproses",
    time: "2 jam lalu",
    tone: "info",
  },
  {
    id: "a2",
    text: "Assessment Frontend Developer telah selesai",
    time: "1 hari lalu",
    tone: "success",
  },
  {
    id: "a3",
    text: "Kamu diundang interview oleh Creative Studio",
    time: "2 hari lalu",
    tone: "cyan",
  },
  {
    id: "a4",
    text: "Progress latihan JavaScript Dasar naik ke 60%",
    time: "3 hari lalu",
    tone: "info",
  },
];

export const nextBestAction = {
  title: "Tingkatkan Interview Readiness",
  description:
    "Score kamu masih 70%. Lakukan AI Mock Interview untuk meningkatkan kesiapanmu.",
  cta: "Mulai Latihan",
  href: "/app/latihan",
  score: 70,
};

export const upcomingInterview = {
  date: "24 Mei",
  title: "Frontend Developer Interview",
  company: "PT Digital Nusantara",
  initials: "DN",
  time: "10:00 WIB",
  mode: "Online",
};

export const portfolioPromptItems = [
  "Tambahkan project",
  "Tambahkan GitHub",
  "Tambahkan case study",
];

export const profileCompletion = {
  percent: 80,
  description:
    "Profil lengkap meningkatkan kesempatan profilmu ditemukan recruiter.",
};

export interface DemoApplication {
  id: string;
  company: string;
  initials: string;
  color: string;
  position: string;
  appliedAt: string;
  match: number;
  stage: number;
}

export const applicationStages = [
  "Applied",
  "AI Screening",
  "Assessment",
  "HR Review",
  "Interview",
  "Decision",
] as const;

export const demoApplications: DemoApplication[] = [
  {
    id: "ap1",
    company: "PT Digital Nusantara",
    initials: "DN",
    color: "bg-cyan-500",
    position: "Frontend Developer",
    appliedAt: "12 Mei",
    match: 92,
    stage: 2,
  },
  {
    id: "ap2",
    company: "Creative Studio",
    initials: "CS",
    color: "bg-violet-500",
    position: "UI/UX Designer",
    appliedAt: "14 Mei",
    match: 88,
    stage: 1,
  },
  {
    id: "ap3",
    company: "Tokoplas",
    initials: "TP",
    color: "bg-emerald-500",
    position: "Product Designer",
    appliedAt: "20 Mei",
    match: 85,
    stage: 0,
  },
  {
    id: "ap4",
    company: "Fintek Karya",
    initials: "FK",
    color: "bg-sky-600",
    position: "Backend Developer",
    appliedAt: "3 Mei",
    match: 79,
    stage: 4,
  },
];

export const skillProfile = {
  name: "Andi Pratama",
  title: "Frontend Developer",
  location: "Surabaya, Indonesia",
  readiness: 82,
  overview: [
    "Frontend developer berfokus pada membangun aplikasi web yang cepat, responsif, dan mudah digunakan. Berpengalaman bekerja dalam tim kecil menggunakan React dan JavaScript modern.",
    "Senang belajar hal baru, berbagi pengetahuan lewat komunitas, dan selalu mengutamakan kualitas serta pengalaman pengguna.",
  ],
  skills: [
    { name: "React", score: 82, level: "Advanced" },
    { name: "JavaScript", score: 90, level: "Advanced" },
    { name: "HTML", score: 95, level: "Expert" },
    { name: "CSS", score: 88, level: "Advanced" },
    { name: "Git", score: 80, level: "Advanced" },
    { name: "TypeScript", score: 55, level: "Intermediate" },
  ],
  proof: {
    projects: 3,
    assessments: 2,
    github: true,
    certificates: 1,
  },
  achievements: [
    { id: "ach1", text: "Menyelesaikan Frontend Developer Assessment dengan skor 86/100", tone: "cyan" },
    { id: "ach2", text: "Membangun 3 project terverifikasi di portofolio", tone: "info" },
    { id: "ach3", text: "Menyalin sertifikat HTML & CSS Modern", tone: "success" },
    { id: "ach4", text: "Mengikuti 6 sesi latihan karier", tone: "info" },
  ],
};

export const careerPlan = {
  goal: "Frontend Developer",
  match: 86,
  readiness: 82,
  roadmap: [
    { title: "Junior Frontend Developer", status: "done" },
    { title: "Frontend Developer", status: "current" },
    { title: "Senior Frontend Developer", status: "next" },
    { title: "Lead Developer", status: "later" },
  ],
  haveSkills: ["HTML", "CSS", "JavaScript", "Git"],
  recommendSkills: ["React", "TypeScript", "Testing"],
};

export interface DemoMessage {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface DemoConversation {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  time: string;
  unread: boolean;
  online: boolean;
  messages: DemoMessage[];
}

export const demoConversations: DemoConversation[] = [
  {
    id: "c1",
    name: "PT Digital Nusantara",
    initials: "DN",
    color: "bg-cyan-500",
    role: "Perusahaan",
    time: "10:24",
    unread: true,
    online: true,
    messages: [
      { id: "m1", from: "them", text: "Hai Andi, kami tertarik dengan portfolio kamu dan ingin mengundang kamu ke tahap interview.", time: "09.12" },
      { id: "m2", from: "me", text: "Halo, terima kasih atas undangannya! Saya sangat antusias.", time: "09.40" },
      { id: "m3", from: "them", text: "Senang mendengarnya. Bagaimana kalau hari Jumat pukul 10.00 WIB secara online?", time: "10.05" },
      { id: "m4", from: "them", text: "Jangan lupa siapkan portofolio kamu ya, Andi.", time: "10.24" },
    ],
  },
  {
    id: "c2",
    name: "Creative Studio",
    initials: "CS",
    color: "bg-violet-500",
    role: "Perusahaan",
    time: "Kemarin",
    unread: false,
    online: false,
    messages: [
      { id: "m1", from: "them", text: "Terima kasih sudah melamar posisi UI/UX Designer di Creative Studio.", time: "14.20" },
      { id: "m2", from: "them", text: "Kami sedang mereview lamaran kamu dan akan kembali dalam 1-2 hari kerja.", time: "14.21" },
    ],
  },
  {
    id: "c3",
    name: "JobSeek System",
    initials: "JS",
    color: "bg-slate-500",
    role: "Sistem",
    time: "Kemarin",
    unread: false,
    online: false,
    messages: [
      { id: "m1", from: "them", text: "Assessment Frontend Developer kamu telah dinilai! Lihat hasilnya di halaman Assessment.", time: "08.00" },
    ],
  },
  {
    id: "c4",
    name: "Tokoplas",
    initials: "TP",
    color: "bg-emerald-500",
    role: "Perusahaan",
    time: "Selasa",
    unread: false,
    online: true,
    messages: [
      { id: "m1", from: "them", text: "Halo Andi, kami melihat profil kamu dan tertarik untuk berdiskusi lebih lanjut.", time: "16.30" },
    ],
  },
];

export interface DemoNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  tone: "cyan" | "success" | "warning" | "info";
  read: boolean;
}

export const demoNotifications: DemoNotification[] = [
  {
    id: "n1",
    title: "Interview diundang",
    text: "Creative Studio mengundang kamu ke tahap interview untuk posisi UI/UX Designer.",
    time: "2 hari lalu",
    tone: "cyan",
    read: false,
  },
  {
    id: "n2",
    title: "Assessment selesai",
    text: "Hasil Frontend Developer Assessment kamu sudah siap dilihat.",
    time: "1 hari lalu",
    tone: "success",
    read: false,
  },
  {
    id: "n3",
    title: "Lamaran diproses",
    text: "Lamaran kamu di PT Digital Nusantara sedang diproses tim HRD.",
    time: "2 jam lalu",
    tone: "info",
    read: false,
  },
  {
    id: "n4",
    title: "Pengingat latihan",
    text: "Lanjutkan latihan React untuk Pemula supaya progress-mu terus berkembang.",
    time: "3 hari lalu",
    tone: "warning",
    read: true,
  },
  {
    id: "n5",
    title: "Skill profile dilihat",
    text: "Skill profile kamu dilihat oleh 3 recruiter minggu ini.",
    time: "4 hari lalu",
    tone: "info",
    read: true,
  },
];

export interface DemoPortfolio {
  id: string;
  title: string;
  tech: string[];
  description: string;
  featured: boolean;
  updated: string;
  gradient: string;
}

export const demoPortfolio: DemoPortfolio[] = [
  {
    id: "p1",
    title: "E-Commerce UI",
    tech: ["React", "Tailwind CSS"],
    description:
      "Antarmuka toko online dengan keranjang belanja, checkout, dan riwayat transaksi, dirancang fokus pada kecepatan dan konversi.",
    featured: true,
    updated: "2 minggu lalu",
    gradient: "from-cyan-500/90 via-cyan-600/80 to-sky-700/80",
  },
  {
    id: "p2",
    title: "Finance Dashboard",
    tech: ["React", "Chart.js"],
    description:
      "Dashboard keuangan personal dengan visualisasi pemasukan, pengeluaran, dan target tabungan bulanan.",
    featured: true,
    updated: "1 bulan lalu",
    gradient: "from-violet-500/90 via-violet-600/80 to-indigo-700/80",
  },
  {
    id: "p3",
    title: "Weather App",
    tech: ["JavaScript", "API"],
    description:
      "Aplikasi cuaca real-time dengan geolokasi, ramalan 7 hari, dan tampilan yang adaptif di semua perangkat.",
    featured: false,
    updated: "2 bulan lalu",
    gradient: "from-sky-500/90 via-cyan-600/80 to-blue-700/80",
  },
  {
    id: "p4",
    title: "Task Manager",
    tech: ["React", "Firebase"],
    description:
      "Aplikasi manajemen tugas kolaboratif dengan board, filter prioritas, dan sinkronisasi data real-time.",
    featured: false,
    updated: "3 bulan lalu",
    gradient: "from-emerald-500/90 via-teal-600/80 to-cyan-700/80",
  },
];

export interface DemoResume {
  id: string;
  title: string;
  role: string;
  updated: string;
  last: string;
  pages: number;
}

export const demoResumes: DemoResume[] = [
  { id: "cv1", title: "Frontend Developer CV", role: "Frontend Developer", updated: "2 hari lalu", last: "12 Mei 2026", pages: 2 },
  { id: "cv2", title: "UX/UI Designer CV", role: "UI/UX Designer", updated: "1 minggu lalu", last: "5 Mei 2026", pages: 1 },
];

export const resumeAnalysis = {
  score: 84,
  description:
    "CV kamu sudah cukup kuat, tetapi masih ada beberapa bagian yang dapat ditingkatkan.",
  strengths: ["Pengalaman relevan jelas", "Kata kunci skill terdeteksi"],
  suggestions: ["Tambahkan angka dan dampak", "Perjelas bagian pencapaian"],
};

export const demoCertificates = [
  { id: "cert1", title: "HTML & CSS Modern", issuer: "JobSeek Academy", date: "Maret 2026", color: "bg-cyan-500" },
  { id: "cert2", title: "Git & GitHub Dasar", issuer: "JobSeek Academy", date: "Januari 2026", color: "bg-violet-500" },
  { id: "cert3", title: "JavaScript Dasar", issuer: "JobSeek Academy", date: "November 2025", color: "bg-amber-500" },
];

export const continueLearning = demoTrainings.filter((t) => t.status === "berjalan");