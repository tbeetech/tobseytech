import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Briefcase, BookOpen, Users, Globe, Search,
  ExternalLink, Star, MapPin, Clock, TrendingUp,
  Brain, Target, Rocket, ArrowRight, Award,
  ChevronRight, Zap, Network, MessageSquare, GraduationCap,
  BarChart2, Compass, Radio, RefreshCw, Sparkles, Tag
} from "lucide-react";

// ─── Static curated data ────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "data-scientist", label: "Data Scientist / ML Engineer" },
  { value: "product-manager", label: "Product Manager" },
  { value: "devops-engineer", label: "DevOps / Cloud Engineer" },
  { value: "ux-designer", label: "UX / Product Designer" },
  { value: "cybersecurity", label: "Cybersecurity Analyst" },
  { value: "blockchain-dev", label: "Blockchain / Web3 Developer" },
  { value: "fullstack", label: "Full-Stack Developer" },
  { value: "ai-engineer", label: "AI / Prompt Engineer" },
  { value: "data-analyst", label: "Data Analyst / BI Specialist" },
  // Nigeria in-demand roles
  { value: "backend-engineer", label: "Backend Engineer" },
  { value: "mobile-engineer", label: "Mobile Engineer (iOS/Android)" },
  { value: "systems-architect", label: "Systems Architect" },
  { value: "tech-lead", label: "Tech Lead / Staff Engineer" },
  { value: "engineering-manager", label: "Engineering Manager" },
  { value: "founder-ceo", label: "Startup Founder / CEO" },
  { value: "qa-engineer", label: "QA Engineer / SDET" },
  { value: "database-admin", label: "Database Administrator" },
  { value: "technical-writer", label: "Technical Writer" },
  { value: "scrum-master", label: "Scrum Master / Agile Coach" },
];

const COURSES_BY_ROLE: Record<string, { title: string; platform: string; url: string; level: string; free: boolean; description: string }[]> = {
  "software-engineer": [
    { title: "The Odin Project", platform: "The Odin Project", url: "https://www.theodinproject.com", level: "Beginner–Intermediate", free: true, description: "Full-stack web dev curriculum used by thousands." },
    { title: "CS50: Introduction to Computer Science", platform: "edX / Harvard", url: "https://cs50.harvard.edu/x", level: "Beginner", free: true, description: "The legendary Harvard intro to CS — still the best foundation." },
    { title: "Full-Stack Open", platform: "University of Helsinki", url: "https://fullstackopen.com", level: "Intermediate", free: true, description: "Deep-dive React, Node, GraphQL, TypeScript, testing." },
    { title: "Clean Code (Course)", platform: "Udemy", url: "https://www.udemy.com/course/writing-clean-code", level: "Intermediate", free: false, description: "Write maintainable, production-ready code." },
    { title: "System Design Interview", platform: "YouTube / Alex Xu", url: "https://www.youtube.com/@ByteByteGo", level: "Advanced", free: true, description: "Scale systems, pass FAANG interviews." },
  ],
  "data-scientist": [
    { title: "fast.ai — Practical Deep Learning", platform: "fast.ai", url: "https://course.fast.ai", level: "Intermediate", free: true, description: "Top-down, practical AI/ML. Used by Kaggle grandmasters." },
    { title: "Machine Learning Specialization", platform: "Coursera / DeepLearning.AI", url: "https://www.coursera.org/specializations/machine-learning-introduction", level: "Beginner–Intermediate", free: false, description: "Andrew Ng's revamped ML course — essential." },
    { title: "Kaggle Learn", platform: "Kaggle", url: "https://www.kaggle.com/learn", level: "Beginner", free: true, description: "Bite-sized ML tracks with real notebooks." },
    { title: "SQL for Data Analysis", platform: "Mode Analytics", url: "https://mode.com/sql-tutorial", level: "Beginner", free: true, description: "SQL is your data superpower." },
    { title: "Statistics for ML", platform: "StatQuest / YouTube", url: "https://www.youtube.com/@statquest", level: "Beginner–Intermediate", free: true, description: "Josh Starmer makes stats actually make sense." },
  ],
  "product-manager": [
    { title: "Product School — Free Resources", platform: "Product School", url: "https://productschool.com/resources", level: "All levels", free: true, description: "Frameworks, templates, and case studies used by top PMs." },
    { title: "Reforge — Product Strategy", platform: "Reforge", url: "https://www.reforge.com/programs/product-strategy", level: "Advanced", free: false, description: "The MBA for product people. Expensive but worth it." },
    { title: "Pragmatic Institute", platform: "Pragmatic Institute", url: "https://www.pragmaticinstitute.com", level: "Intermediate", free: false, description: "Industry-standard PM certification." },
    { title: "Lenny's Newsletter", platform: "Substack", url: "https://www.lennysnewsletter.com", level: "All levels", free: false, description: "The most-read PM newsletter on the internet." },
    { title: "Shape Up (by Basecamp)", platform: "Basecamp / Basecamp", url: "https://basecamp.com/shapeup", level: "Intermediate", free: true, description: "A radical rethinking of how teams ship product." },
  ],
  "devops-engineer": [
    { title: "KodeKloud — DevOps Bootcamp", platform: "KodeKloud", url: "https://kodekloud.com", level: "Beginner–Advanced", free: false, description: "Hands-on labs for Kubernetes, Docker, Terraform, CI/CD." },
    { title: "Linux Foundation Courses", platform: "edX", url: "https://www.edx.org/school/linuxfoundationx", level: "All levels", free: true, description: "Official Linux & CNCF certified paths." },
    { title: "AWS Cloud Practitioner Prep", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=3hLmDS179YE", level: "Beginner", free: true, description: "13-hour prep for AWS CCP — most popular cloud cert entry point." },
    { title: "DevOps Roadmap", platform: "roadmap.sh", url: "https://roadmap.sh/devops", level: "All levels", free: true, description: "The definitive community-curated DevOps learning path." },
    { title: "Terraform in Production", platform: "HashiCorp", url: "https://developer.hashicorp.com/terraform/tutorials", level: "Intermediate", free: true, description: "Official Terraform tutorials from HashiCorp." },
  ],
  "ux-designer": [
    { title: "Google UX Design Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design", level: "Beginner", free: false, description: "6-course career certificate from Google. Highly regarded." },
    { title: "Nielsen Norman Group — UX Resources", platform: "NN/g", url: "https://www.nngroup.com/articles", level: "All levels", free: true, description: "The gold standard of UX research and best practices." },
    { title: "Figma Design Course", platform: "Figma", url: "https://www.figma.com/resources/learn-design", level: "Beginner", free: true, description: "Learn the most used design tool from Figma itself." },
    { title: "Laws of UX", platform: "lawsofux.com", url: "https://lawsofux.com", level: "Beginner", free: true, description: "The cheat-sheet every UX designer must know." },
    { title: "The Design of Everyday Things", platform: "Book / Amazon", url: "https://www.amazon.com/dp/0465050654", level: "Beginner", free: false, description: "Required reading. Don Norman wrote the bible of UX." },
  ],
  "cybersecurity": [
    { title: "TryHackMe", platform: "TryHackMe", url: "https://tryhackme.com", level: "Beginner–Advanced", free: true, description: "Gamified cyber labs. Best starting point in the industry." },
    { title: "Hack The Box", platform: "Hack The Box", url: "https://www.hackthebox.com", level: "Intermediate–Advanced", free: true, description: "Real-world offensive security challenges." },
    { title: "CompTIA Security+ Study Guide", platform: "Professor Messer", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course", level: "Intermediate", free: true, description: "Free Security+ prep by the community's favourite instructor." },
    { title: "SANS Cyber Aces", platform: "SANS", url: "https://www.sans.org/cyberaces", level: "Beginner", free: true, description: "Free fundamentals from the most respected cyber org." },
    { title: "Cybersecurity Career Path", platform: "roadmap.sh", url: "https://roadmap.sh/cyber-security", level: "All levels", free: true, description: "Community roadmap for getting into cyber." },
  ],
  "blockchain-dev": [
    { title: "CryptoZombies", platform: "CryptoZombies", url: "https://cryptozombies.io", level: "Beginner", free: true, description: "Learn Solidity by building a zombie game. Addictive." },
    { title: "Alchemy University", platform: "Alchemy", url: "https://university.alchemy.com", level: "Beginner–Intermediate", free: true, description: "Best free Web3 developer course — backed by Alchemy." },
    { title: "Ethereum.org Developer Docs", platform: "Ethereum Foundation", url: "https://ethereum.org/en/developers", level: "Intermediate", free: true, description: "Official docs and tutorials from the Ethereum team." },
    { title: "Web3.js / Ethers.js", platform: "LearnWeb3", url: "https://learnweb3.io", level: "Intermediate", free: true, description: "Structured Web3 track from wallet to dApp." },
    { title: "Solidity by Example", platform: "solidity-by-example.org", url: "https://solidity-by-example.org", level: "Intermediate", free: true, description: "Real Solidity code patterns with explanations." },
  ],
  "fullstack": [
    { title: "Full-Stack Open", platform: "University of Helsinki", url: "https://fullstackopen.com", level: "Intermediate", free: true, description: "React, Node, TypeScript, GraphQL, Docker. The real deal." },
    { title: "The Odin Project", platform: "The Odin Project", url: "https://www.theodinproject.com", level: "Beginner–Intermediate", free: true, description: "Complete beginner-to-deployed fullstack path." },
    { title: "T3 Stack Tutorial", platform: "Theo / YouTube", url: "https://www.youtube.com/@t3dotgg", level: "Intermediate", free: true, description: "Modern TypeScript stack: Next.js, tRPC, Prisma, Tailwind." },
    { title: "Next.js Docs & App Router", platform: "Vercel", url: "https://nextjs.org/docs", level: "Intermediate", free: true, description: "Next.js is where most fullstack jobs live right now." },
    { title: "databases.dev", platform: "databases.dev", url: "https://databases.dev", level: "Beginner", free: true, description: "Visual intro to SQL databases for web devs." },
  ],
  "ai-engineer": [
    { title: "Prompt Engineering Guide", platform: "DAIR.AI", url: "https://www.promptingguide.ai", level: "Beginner–Intermediate", free: true, description: "The comprehensive open-source guide to prompt engineering." },
    { title: "LangChain Crash Course", platform: "YouTube / James Briggs", url: "https://www.youtube.com/@jamesbriggs", level: "Intermediate", free: true, description: "Build LLM apps with LangChain, RAG, agents." },
    { title: "DeepLearning.AI Short Courses", platform: "DeepLearning.AI", url: "https://www.deeplearning.ai/short-courses", level: "Beginner–Intermediate", free: true, description: "Free 1-hour courses from industry leaders (Andrew Ng)." },
    { title: "Hugging Face NLP Course", platform: "Hugging Face", url: "https://huggingface.co/learn/nlp-course", level: "Intermediate", free: true, description: "The de-facto course for transformers and NLP." },
    { title: "OpenAI Cookbook", platform: "GitHub / OpenAI", url: "https://cookbook.openai.com", level: "Intermediate–Advanced", free: true, description: "Real production patterns for OpenAI APIs." },
  ],
  "data-analyst": [
    { title: "Google Data Analytics Certificate", platform: "Coursera", url: "https://www.coursera.org/professional-certificates/google-data-analytics", level: "Beginner", free: false, description: "Most popular entry-level DA cert — 750k+ enrolled." },
    { title: "Mode SQL Tutorial", platform: "Mode Analytics", url: "https://mode.com/sql-tutorial", level: "Beginner", free: true, description: "SQL is 80% of your day as an analyst." },
    { title: "Tableau Public Training", platform: "Tableau", url: "https://www.tableau.com/learn/training", level: "Beginner", free: true, description: "Official free Tableau training videos." },
    { title: "Power BI Course", platform: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", level: "Beginner", free: true, description: "Free PL-300 prep from Microsoft itself." },
    { title: "Python for Data Analysis", platform: "Wes McKinney / O'Reilly", url: "https://wesmckinney.com/book", level: "Intermediate", free: true, description: "The pandas book — free online from the creator of pandas." },
  ],
};

const EXPERTS_BY_ROLE: Record<string, { name: string; handle: string; platform: string; url: string; niche: string; why: string }[]> = {
  "software-engineer": [
    { name: "Fireship", handle: "@fireship_dev", platform: "YouTube/Twitter", url: "https://fireship.io", niche: "Modern web dev, short videos", why: "Makes complex tech digestible in 100 seconds." },
    { name: "t3dotgg (Theo)", handle: "@t3dotgg", platform: "YouTube/Twitter", url: "https://www.youtube.com/@t3dotgg", niche: "TypeScript, React, full-stack opinionated takes", why: "Cuts through the noise on what's actually worth learning." },
    { name: "ThePrimeagen", handle: "@ThePrimeagen", platform: "Twitch/YouTube", url: "https://www.youtube.com/@ThePrimeagen", niche: "Low-level performance, Rust, Neovim, interviews", why: "No-fluff engineering. Actual systems understanding." },
    { name: "TechLead", handle: "@techlead", platform: "YouTube", url: "https://www.youtube.com/@TechLead", niche: "FAANG career advice, senior SWE perspective", why: "Controversial but honest about the realities of big tech." },
    { name: "Neetcode", handle: "@neetcode", platform: "YouTube", url: "https://www.youtube.com/@NeetCode", niche: "LeetCode patterns, SWE interview prep", why: "Best structured LeetCode system for interviews." },
  ],
  "data-scientist": [
    { name: "Andrej Karpathy", handle: "@karpathy", platform: "Twitter/YouTube", url: "https://karpathy.ai", niche: "Deep learning foundations, LLMs, AI education", why: "Ex-Tesla/OpenAI. Teaches AI at the first-principles level." },
    { name: "StatQuest (Josh Starmer)", handle: "@joshuastarmer", platform: "YouTube", url: "https://www.youtube.com/@statquest", niche: "ML algorithms, statistics, bioinformatics", why: "Makes even SVMs and neural nets understandable." },
    { name: "Krish Naik", handle: "@krishnaik06", platform: "YouTube", url: "https://www.youtube.com/@krishnaik06", niche: "Full DS pipeline, MLOps, interview prep", why: "Practical end-to-end ML and DS career guidance." },
    { name: "Cassie Kozyrkov", handle: "@quaesita", platform: "Medium/LinkedIn", url: "https://kozyrkov.medium.com", niche: "Decision intelligence, AI strategy", why: "Former Chief Decision Scientist @ Google. Think bigger." },
    { name: "Jeremy Howard", handle: "@jeremyphoward", platform: "Twitter/fast.ai", url: "https://twitter.com/jeremyphoward", niche: "Practical deep learning, fast.ai", why: "Built fast.ai. Believes you don't need a PhD to do AI." },
  ],
  "product-manager": [
    { name: "Lenny Rachitsky", handle: "@lennysan", platform: "Substack/Podcast", url: "https://www.lennysnewsletter.com", niche: "PLG, retention, hiring, PM frameworks", why: "Surveyed 1000s of PMs. Evidence-based PM thinking." },
    { name: "Shreyas Doshi", handle: "@shreyas", platform: "Twitter", url: "https://twitter.com/shreyas", niche: "PM leadership, founder mindset, career strategy", why: "Ex-Stripe/Twitter. Most thoughtful PM threads on Twitter." },
    { name: "Gibson Biddle", handle: "@gibsonbiddle", platform: "Medium/LinkedIn", url: "https://gibsonbiddle.medium.com", niche: "Product strategy, experiments, Netflix era lessons", why: "Former VP Product @Netflix. Teaches product strategy." },
    { name: "Marty Cagan", handle: "@cagan", platform: "LinkedIn/SVPG", url: "https://www.svpg.com/articles", niche: "Empowered teams, product thinking", why: "Literally wrote the book on product management." },
    { name: "Julie Zhuo", handle: "@joulee", platform: "Twitter/Substack", url: "https://joulee.medium.com", niche: "PM/design leadership, early career advice", why: "Ex-Facebook VP Design. The Making of a Manager is essential." },
  ],
  "devops-engineer": [
    { name: "TechWorld with Nana", handle: "@TechWorldwithNana", platform: "YouTube", url: "https://www.youtube.com/@TechWorldwithNana", niche: "Kubernetes, Docker, CI/CD, DevOps full stack", why: "Best structured DevOps learning channel on YouTube." },
    { name: "Kelsey Hightower", handle: "@kelseyhightower", platform: "Twitter", url: "https://twitter.com/kelseyhightower", niche: "Kubernetes, cloud-native, platform engineering", why: "The most respected DevOps voice in the industry." },
    { name: "DevOps Toolkit", handle: "@vfarcic", platform: "YouTube", url: "https://www.youtube.com/@DevOpsToolkit", niche: "GitOps, Kubernetes, cloud platforms", why: "Opinionated, production-grade content." },
    { name: "Jeff Geerling", handle: "@geerlingguy", platform: "YouTube/GitHub", url: "https://www.jeffgeerling.com", niche: "Ansible, homelab, Raspberry Pi, automation", why: "Practical automation at every scale." },
    { name: "Adrian Cantrill", handle: "@AdrianCantrill", platform: "Twitter/Udemy", url: "https://learn.cantrill.io", niche: "AWS deep dives, cloud architecture", why: "Best AWS SA course on the market. Worth every penny." },
  ],
  "ux-designer": [
    { name: "Nielsen Norman Group", handle: "@nngroup", platform: "YouTube/Website", url: "https://www.nngroup.com", niche: "UX research, usability, heuristics", why: "The scientific foundation of everything UX." },
    { name: "DesignCourse (Gary Simon)", handle: "@designcoursecom", platform: "YouTube", url: "https://www.youtube.com/@DesignCourse", niche: "UI/UX, CSS, Figma", why: "Practical design tutorials with real critique." },
    { name: "AJ&Smart", handle: "@AJSmartDesign", platform: "YouTube", url: "https://www.youtube.com/@AJSmart", niche: "Design Sprints, UX strategy, workshops", why: "Invented the Google Design Sprint process." },
    { name: "Femke Design", handle: "@femkesvs", platform: "YouTube", url: "https://www.youtube.com/@femkesvs", niche: "Product design career, big tech design", why: "Real talk on growing as a product designer at scale." },
    { name: "Pablo Stanley", handle: "@pablostanley", platform: "Twitter/YouTube", url: "https://twitter.com/pablostanley", niche: "Illustration, design systems, Humaaans", why: "Makes design culture funny and accessible." },
  ],
  "cybersecurity": [
    { name: "John Hammond", handle: "@_JohnHammond", platform: "YouTube/Twitter", url: "https://www.youtube.com/@_JohnHammond", niche: "CTFs, malware analysis, practical hacking", why: "Best practical cybersecurity educator on YouTube." },
    { name: "NetworkChuck", handle: "@NetworkChuck", platform: "YouTube", url: "https://www.youtube.com/@NetworkChuck", niche: "Networking, ethical hacking, certs", why: "Makes networking and cyber fun and high energy." },
    { name: "The Cyber Mentor", handle: "@thecybermentor", platform: "YouTube", url: "https://www.youtube.com/@TCMSecurityAcademy", niche: "Practical ethical hacking, PNPT cert", why: "Teaches real-world pentesting. Cheap certs, high quality." },
    { name: "LiveOverflow", handle: "@LiveOverflow", platform: "YouTube", url: "https://www.youtube.com/@LiveOverflow", niche: "Binary exploitation, CTFs, deep hacks", why: "Goes deep. Teaches you to actually think like an attacker." },
    { name: "Bruce Schneier", handle: "@schneierblog", platform: "Blog/Twitter", url: "https://www.schneier.com", niche: "Crypto, policy, security philosophy", why: "The most important security thinker of the last 30 years." },
  ],
  "blockchain-dev": [
    { name: "Patrick Collins", handle: "@PatrickAlphaC", platform: "YouTube", url: "https://www.youtube.com/@PatrickAlphaC", niche: "Solidity, DeFi, smart contracts, Foundry", why: "Made the most watched free Solidity course in existence." },
    { name: "Austin Griffith", handle: "@austingriffith", platform: "Twitter", url: "https://twitter.com/austingriffith", niche: "Ethereum dev, scaffold-eth, BuidlGuidl", why: "Building the most accessible Ethereum dev tools." },
    { name: "Vitalik Buterin", handle: "@VitalikButerin", platform: "Twitter/Blog", url: "https://vitalik.eth.limo", niche: "Ethereum protocol, cryptoeconomics, philosophy", why: "Read his blog. Understanding the why changes everything." },
    { name: "JuanRo3", handle: "jspauld", platform: "Alchemy", url: "https://university.alchemy.com", niche: "Web3 dev education", why: "Alchemy University curriculum leader. Free and excellent." },
    { name: "Nader Dabit", handle: "@dabit3", platform: "Twitter/YouTube", url: "https://twitter.com/dabit3", niche: "Full-stack Web3, The Graph, DeFi apps", why: "Bridges Web2 devs into Web3 ecosystem practically." },
  ],
  "fullstack": [
    { name: "Traversy Media", handle: "@traversymedia", platform: "YouTube", url: "https://www.youtube.com/@TraversyMedia", niche: "Full-stack tutorials, projects, crash courses", why: "Most trusted fullstack channel for tutorials with projects." },
    { name: "Fireship", handle: "@fireship_dev", platform: "YouTube/Twitter", url: "https://fireship.io", niche: "Quick-fire coverage of modern web stack", why: "100-second videos that actually stick." },
    { name: "Kevin Powell", handle: "@KevinPowell", platform: "YouTube", url: "https://www.youtube.com/@KevinPowell", niche: "CSS mastery, layouts, responsive design", why: "The best CSS teacher alive. Full stop." },
    { name: "t3dotgg (Theo)", handle: "@t3dotgg", platform: "YouTube/Twitter", url: "https://www.youtube.com/@t3dotgg", niche: "TypeScript fullstack opinions, Next.js, tRPC", why: "Builds in public. Helps you avoid major mistakes." },
    { name: "Web Dev Simplified", handle: "@WebDevSimplified", platform: "YouTube", url: "https://www.youtube.com/@WebDevSimplified", niche: "JS/React/CSS projects, simplified explanations", why: "Every concept explained with a buildable project." },
  ],
  "ai-engineer": [
    { name: "Andrej Karpathy", handle: "@karpathy", platform: "Twitter/YouTube", url: "https://karpathy.ai", niche: "Neural networks, LLMs, first-principles AI", why: "nanoGPT, makemore — teaches you to build from scratch." },
    { name: "Swyx (shawn wang)", handle: "@swyx", platform: "Twitter/Blog", url: "https://www.swyx.io", niche: "AI engineering career, LLM apps, AI UX", why: "Popularized 'AI Engineer' as a role. Must-follow." },
    { name: "Simon Willison", handle: "@simonw", platform: "Twitter/Blog", url: "https://simonwillison.net", niche: "LLM tools, datasette, practical AI tooling", why: "Obsessively documents real AI engineering patterns." },
    { name: "AI Explained", handle: "@AI_Explained_", platform: "YouTube", url: "https://www.youtube.com/@aiexplained-official", niche: "Frontier AI research explained clearly", why: "Breaks down new papers without the hype." },
    { name: "Harrison Chase", handle: "@hwchase17", platform: "Twitter", url: "https://twitter.com/hwchase17", niche: "LangChain, agents, RAG", why: "Creator of LangChain. Where AI agents are heading." },
  ],
  "data-analyst": [
    { name: "Alex The Analyst", handle: "@AlexTheAnalyst", platform: "YouTube", url: "https://www.youtube.com/@AlexTheAnalyst", niche: "SQL, Python, Tableau, portfolio projects", why: "Best 'how to break into DA' content. Practical and honest." },
    { name: "Luke Barousse", handle: "@LukeBarousse", platform: "YouTube", url: "https://www.youtube.com/@LukeBarousse", niche: "Data jobs market, SQL, Python for data", why: "Analyzes actual job posting data to tell you what matters." },
    { name: "Codebasics", handle: "@codebasics", platform: "YouTube", url: "https://www.youtube.com/@codebasics", niche: "Python, Power BI, analytics projects", why: "Project-based learning for real DA portfolio pieces." },
    { name: "Data School (Kevin Markham)", handle: "@justmarkham", platform: "YouTube/Podcast", url: "https://www.dataschool.io", niche: "pandas, scikit-learn, practical ML", why: "Makes pandas finally click. Always practical." },
    { name: "Tina Huang", handle: "@TinaHuang1", platform: "YouTube", url: "https://www.youtube.com/@TinaHuang1", niche: "DS/DA career advice, Meta DS experience", why: "Real talk from inside big tech on the data career." },
  ],
};

const JOB_SITES = [
  { name: "Remotive", url: "https://remotive.com", category: "Remote Tech", description: "Curated remote jobs — no noise, just real tech roles.", badge: "Remote-only", color: "text-neon-cyan" },
  { name: "We Work Remotely", url: "https://weworkremotely.com", category: "Remote Tech", description: "Largest remote work community. High-quality postings from established companies.", badge: "Remote-only", color: "text-neon-cyan" },
  { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs", category: "General / Networking", description: "Volume + recruiter access. Apply AND get inbound. Profile matters here.", badge: "All types", color: "text-galactic-orange" },
  { name: "Levels.fyi Jobs", url: "https://www.levels.fyi/jobs", category: "Big Tech / Comp", description: "High-compensation tech roles with verified salary data.", badge: "Senior / FAANG", color: "text-neon-yellow" },
  { name: "Y Combinator Jobs", url: "https://www.workatastartup.com", category: "Startups", description: "Work at the most funded and vetted startups on Earth.", badge: "Startups", color: "text-galactic-gold" },
  { name: "AngelList / Wellfound", url: "https://wellfound.com/jobs", category: "Startups", description: "Equity-forward startup jobs. Great for early-stage roles.", badge: "Equity / Startups", color: "text-galactic-gold" },
  { name: "Toptal", url: "https://www.toptal.com", category: "Freelance / Elite", description: "Top 3% acceptance. Hardest to get in, highest freelance rates.", badge: "Elite Freelance", color: "text-neon-purple" },
  { name: "Upwork", url: "https://www.upwork.com", category: "Freelance", description: "Volume freelance marketplace. Great for portfolio-building early on.", badge: "Freelance", color: "text-neon-purple" },
  { name: "HackerNews — Who's Hiring", url: "https://news.ycombinator.com/jobs", category: "Tech / Direct Hire", description: "Monthly 'Who is hiring?' threads. Founders post directly — no recruiters.", badge: "Direct / No recruiter", color: "text-neon-cyan" },
  { name: "Glassdoor", url: "https://www.glassdoor.com/Job", category: "Research + Apply", description: "Apply + research salary, culture, and interview questions before you click send.", badge: "Research + Apply", color: "text-galactic-orange" },
  { name: "GitHub Jobs / Explore", url: "https://github.com/explore", category: "Open Source → Hired", description: "Contribute to open source repos of companies you want to work for. Best signal.", badge: "Open Source", color: "text-neon-cyan" },
  { name: "Dice", url: "https://www.dice.com", category: "IT / Contracts", description: "Contract and permanent tech roles in the US. Strong for IT/DevOps.", badge: "IT / Contract", color: "text-galactic-orange" },
];

const CHEAT_CODES: { icon: string; title: string; insight: string; action: string }[] = [
  { icon: "🎯", title: "The 1-Job-Board Secret", insight: "Most job seekers apply to 10 sites and get ghosted on all. The real play: pick 1–2 boards, optimize your profile deeply on each, and activate recruiter inbound.", action: "Go all-in on LinkedIn + one niche board for your role." },
  { icon: "🔑", title: "ATS is the real gatekeeper", insight: "75% of resumes are rejected before a human sees them. The system is an Applicant Tracking System. Beat it by mirroring the job description's exact keywords.", action: "Paste the JD into jobscan.co and compare your resume score." },
  { icon: "🧠", title: "Cold outreach > applications", insight: "Response rate on job applications: ~2%. Response rate on a personalised LinkedIn DM to the hiring manager: ~20–40%. The math is clear.", action: "Send 5 genuine DMs/week to hiring managers at target companies." },
  { icon: "💼", title: "Your portfolio IS your resume", insight: "For engineers, designers, and data folks — GitHub/portfolio > resume. Recruiters at top companies actively search GitHub and Dribbble.", action: "Pin your 3 best projects on GitHub. Make README look like a product page." },
  { icon: "📊", title: "Know your number before the call", insight: "Negotiating salary without knowing the market is the #1 way candidates leave 10–30% on the table.", action: "Check levels.fyi, Glassdoor, and LinkedIn Salary before every interview." },
  { icon: "🤝", title: "Referrals fill 70% of senior roles", insight: "Most senior roles are filled before they're posted. The only way in is a referral or networking. LinkedIn + HN + Discord communities are your pipeline.", action: "Warm up 2 contacts at target companies this week. Ask for a coffee chat, not a job." },
  { icon: "🚀", title: "Ship publicly, get hired quietly", insight: "Build side projects that solve real problems and write about them publicly. Recruiters find you. This is how top engineers never have to apply.", action: "Write a blog post about a problem you solved. Share on HN, Dev.to, LinkedIn." },
  { icon: "⚡", title: "Interview is a two-way evaluation", insight: "Candidates who ask sharp questions about architecture, team processes, and challenges signal senior thinking — and get better offers.", action: "Prepare 5 smart questions per company. It is not a quiz, it is a conversation." },
];

const CAREER_ROADMAP: { phase: string; title: string; actions: string[]; textColor: string; borderColor: string }[] = [
  { phase: "PHASE 1", title: "Clarity (Week 1–2)", actions: ["Define your target role and dream companies", "Benchmark your skills against job descriptions", "Identify 3–5 skill gaps to close"], textColor: "text-galactic-orange", borderColor: "border-galactic-orange" },
  { phase: "PHASE 2", title: "Build & Document (Week 3–8)", actions: ["Complete 1–2 courses from the curated list above", "Ship a portfolio project solving a real problem", "Write a case study or blog post about what you built", "Set up a polished GitHub and LinkedIn"], textColor: "text-neon-cyan", borderColor: "border-neon-cyan" },
  { phase: "PHASE 3", title: "Network & Apply (Week 6–10)", actions: ["Connect with 10 people in your target role", "Apply to 3–5 carefully selected roles per week", "Attend 1 online meetup or conference per month", "Engage with industry experts on Twitter/LinkedIn daily"], textColor: "text-neon-yellow", borderColor: "border-neon-yellow" },
  { phase: "PHASE 4", title: "Interview & Negotiate (Ongoing)", actions: ["Practice LeetCode / system design 3x per week (engineers)", "Record and review your answers. Brutal self-assessment.", "Negotiate every offer — even the 'final' one", "Always have a BATNA (Best Alternative To Negotiated Agreement)"], textColor: "text-neon-purple", borderColor: "border-neon-purple" },
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  publication_date: string;
  job_type: string;
  tags: string[];
  description: string;
}

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  cover_image: string | null;
  user: { name: string; username: string; profile_image: string };
  tags: string[];
  reading_time_minutes: number;
  positive_reactions_count: number;
  published_at: string;
}

interface HNHit {
  objectID: string;
  title: string;
  url: string;
  author: string;
  points: number;
  num_comments: number;
  created_at: string;
}

interface NgMatchJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  publication_date: string;
  job_type: string;
  tags: string[];
  description: string;
  _score: number;
  _ngFriendly: boolean;
}

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: "ng-match", label: "🇳🇬 NG Match", icon: Sparkles },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "jobs", label: "Live Jobs", icon: Briefcase },
  { id: "experts", label: "Experts", icon: Users },
  { id: "articles", label: "Articles", icon: Radio },
  { id: "job-sites", label: "Job Sites", icon: Globe },
  { id: "cheat-codes", label: "Cheat Codes", icon: Zap },
  { id: "roadmap", label: "Your Roadmap", icon: Compass },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const REMOTIVE_CATEGORIES: Record<string, string> = {
  "software-engineer": "software-dev",
  "data-scientist": "data",
  "devops-engineer": "devops-sysadmin",
  "ux-designer": "design",
  "cybersecurity": "software-dev",
  "blockchain-dev": "software-dev",
  "fullstack": "software-dev",
  "ai-engineer": "software-dev",
  "data-analyst": "data",
  "product-manager": "product",
  "backend-engineer": "software-dev",
  "mobile-engineer": "software-dev",
  "systems-architect": "software-dev",
  "tech-lead": "software-dev",
  "engineering-manager": "management-finance",
  "founder-ceo": "management-finance",
  "qa-engineer": "qa",
  "database-admin": "devops-sysadmin",
  "technical-writer": "writing",
  "scrum-master": "management-finance",
};

const DEV_TO_TAGS: Record<string, string> = {
  "software-engineer": "career",
  "data-scientist": "datascience",
  "devops-engineer": "devops",
  "ux-designer": "ux",
  "cybersecurity": "security",
  "blockchain-dev": "blockchain",
  "fullstack": "webdev",
  "ai-engineer": "ai",
  "data-analyst": "dataanalysis",
  "product-manager": "productivity",
  "backend-engineer": "backend",
  "mobile-engineer": "mobile",
  "systems-architect": "architecture",
  "tech-lead": "leadership",
  "engineering-manager": "management",
  "founder-ceo": "entrepreneurship",
  "qa-engineer": "testing",
  "database-admin": "database",
  "technical-writer": "documentation",
  "scrum-master": "agile",
};

// ─── Page component ──────────────────────────────────────────────────────────

export default function CareerHubPage() {
  const [selectedRole, setSelectedRole] = useState("software-engineer");
  const [activeTab, setActiveTab] = useState("ng-match");
  const [jobSearch, setJobSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [hnSearch, setHnSearch] = useState("");
  const [submittedJobSearch, setSubmittedJobSearch] = useState("");
  const [submittedArticleSearch, setSubmittedArticleSearch] = useState("");
  const [submittedHnSearch, setSubmittedHnSearch] = useState("");

  // NG Match state
  const [ngDescription, setNgDescription] = useState("");
  const [ngRole, setNgRole] = useState("software-engineer");
  const [ngSubmitted, setNgSubmitted] = useState(false);

  const remotiveCategory = REMOTIVE_CATEGORIES[selectedRole] ?? "software-dev";
  const devToTag = DEV_TO_TAGS[selectedRole] ?? "career";

  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs, isError: jobsError } = useQuery<{ jobs: RemotiveJob[]; message?: string }>({
    queryKey: ["/api/career/jobs", remotiveCategory, submittedJobSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ category: remotiveCategory });
      if (submittedJobSearch) params.set("search", submittedJobSearch);
      const res = await fetch(`/api/career/jobs?${params}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // NG Match query — only fires when ngSubmitted is true
  const {
    data: ngMatchData,
    isFetching: ngFetching,
    refetch: runNgMatch,
    isError: ngError,
  } = useQuery<{ jobs: NgMatchJob[]; keywords: string[]; totalScanned: number; message?: string }>({
    queryKey: ["/api/career/ng-match", ngRole, ngDescription],
    queryFn: async () => {
      const params = new URLSearchParams({ role: ngRole, description: ngDescription });
      const res = await fetch(`/api/career/ng-match?${params}`);
      return res.json();
    },
    enabled: ngSubmitted,
    staleTime: 3 * 60 * 1000,
  });

  const handleNgMatch = () => {
    if (ngSubmitted) {
      runNgMatch();
    } else {
      setNgSubmitted(true);
    }
  };

  const { data: articlesData, isLoading: articlesLoading, refetch: refetchArticles } = useQuery<{ articles: DevToArticle[]; message?: string }>({
    queryKey: ["/api/career/articles", devToTag, submittedArticleSearch],
    queryFn: async () => {
      const tag = submittedArticleSearch || devToTag;
      const res = await fetch(`/api/career/articles?tag=${encodeURIComponent(tag)}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: hnData, isLoading: hnLoading, refetch: refetchHn } = useQuery<{ hits: HNHit[] }>({
    queryKey: ["/api/career/discussions", selectedRole, submittedHnSearch],
    queryFn: async () => {
      const query = submittedHnSearch || `${selectedRole.replace(/-/g, " ")} career tips`;
      const res = await fetch(`/api/career/discussions?query=${encodeURIComponent(query)}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const courses = COURSES_BY_ROLE[selectedRole] ?? COURSES_BY_ROLE["software-engineer"];
  const experts = EXPERTS_BY_ROLE[selectedRole] ?? EXPERTS_BY_ROLE["software-engineer"];
  const currentRoleLabel = ROLE_OPTIONS.find(r => r.value === selectedRole)?.label ?? "Tech Professional";

  const validHnHits = useMemo(
    () => (hnData?.hits ?? []).filter(h => h.url),
    [hnData?.hits]
  );

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-galactic-orange/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-6">
              <Target className="w-4 h-4" /> Career Intelligence Hub
            </div>
            <h1 className="font-orbitron font-bold text-4xl md:text-6xl gradient-text mb-4 leading-tight">
              Your Career<br />Cheat Code
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
              The one place where <span className="text-galactic-orange font-semibold">academia meets remote tech realities</span>.
              Real job listings, curated courses, verified experts, insider career strategy — all personalised to your target role.
            </p>

            {/* Role selector */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
              <div className="relative flex-1 w-full">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-galactic-orange" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-galactic-orange/30 rounded-xl font-orbitron text-sm text-white focus:outline-none focus:border-galactic-orange transition-colors appearance-none cursor-pointer"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value} className="bg-gray-900">{r.label}</option>
                  ))}
                </select>
              </div>
              <span className="text-gray-500 text-sm font-orbitron hidden sm:block">→</span>
              <span className="px-4 py-2 bg-galactic-orange/10 border border-galactic-orange/30 rounded-xl text-galactic-orange text-sm font-orbitron whitespace-nowrap">
                {currentRoleLabel}
              </span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-2">
            {[
              { label: "Live Jobs", value: jobsData?.jobs?.length ?? "—", icon: Briefcase },
              { label: "Courses", value: courses.length, icon: BookOpen },
              { label: "Experts", value: experts.length, icon: Users },
              { label: "Job Sites", value: JOB_SITES.length, icon: Globe },
            ].map(stat => (
              <div key={stat.label} className="glass-effect rounded-xl p-3 border border-galactic-orange/10 text-center">
                <stat.icon className="w-4 h-4 text-galactic-orange mx-auto mb-1" />
                <div className="font-orbitron font-bold text-galactic-orange text-lg">{stat.value}</div>
                <div className="text-gray-400 text-xs font-orbitron">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab nav */}
      <div className="sticky top-16 z-30 bg-space-black/90 backdrop-blur-xl border-b border-galactic-orange/10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-orbitron text-xs whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-galactic-orange text-black font-bold"
                    : "text-gray-400 hover:text-galactic-orange hover:bg-galactic-orange/10"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <main className="container mx-auto px-6 py-10">

        {/* ── 🇳🇬 NG Match tab ─────────────────────────────────────────────── */}
        {activeTab === "ng-match" && (
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🇳🇬</span>
                <h2 className="font-orbitron font-bold text-2xl text-galactic-orange">Nigeria Job Match</h2>
              </div>
              <p className="text-gray-400 text-sm max-w-2xl">
                Paste your job description or list your skills below. We'll scan live remote jobs and score each one
                for Nigeria-friendliness — surfacing roles at companies that hire globally and across Africa.
              </p>
            </div>

            {/* Input form */}
            <div className="glass-effect rounded-2xl p-6 border border-galactic-orange/25 mb-8">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-orbitron text-galactic-orange mb-2 block">Your Role</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-galactic-orange" />
                    <select
                      value={ngRole}
                      onChange={e => { setNgRole(e.target.value); setNgSubmitted(false); }}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-galactic-orange/30 rounded-xl font-orbitron text-sm text-white focus:outline-none focus:border-galactic-orange transition-colors appearance-none cursor-pointer"
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r.value} value={r.value} className="bg-gray-900">{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-end">
                  <div className="w-full glass-effect rounded-xl border border-galactic-orange/15 p-3">
                    <p className="text-xs text-gray-500 font-orbitron mb-1">How it works</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      We extract your key skills, query live remote job APIs, then score each role by keyword match,
                      worldwide/Africa location acceptance, and known Nigeria-hiring companies.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-orbitron text-galactic-orange mb-2 block">
                  Job Description / Your Skills{" "}
                  <span className="text-gray-600 font-normal">(paste a JD or describe what you do)</span>
                </label>
                <textarea
                  value={ngDescription}
                  onChange={e => { setNgDescription(e.target.value); setNgSubmitted(false); }}
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleNgMatch(); }}
                  placeholder="e.g. Senior backend engineer with 4 years Node.js, PostgreSQL, Redis, REST APIs, AWS, Docker. Built fintech APIs handling 100k txns/day. Looking for remote roles in product companies..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-galactic-orange/20 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-galactic-orange transition-colors resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleNgMatch}
                  disabled={ngFetching}
                  className="bg-galactic-orange hover:bg-galactic-orange/80 text-black font-orbitron font-bold text-sm px-6"
                >
                  {ngFetching ? (
                    <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />Matching…</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Find My Match</>
                  )}
                </Button>
                {ngMatchData && (
                  <span className="text-xs text-gray-500 font-orbitron">
                    Scanned {ngMatchData.totalScanned} jobs · {ngMatchData.jobs.length} matches returned
                  </span>
                )}
              </div>
            </div>

            {/* Keywords extracted */}
            {ngMatchData?.keywords && ngMatchData.keywords.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <Tag className="w-3.5 h-3.5 text-galactic-orange flex-shrink-0" />
                <span className="text-xs text-gray-500 font-orbitron">Extracted skills:</span>
                {ngMatchData.keywords.map(kw => (
                  <span key={kw} className="px-2 py-0.5 bg-galactic-orange/10 text-galactic-orange border border-galactic-orange/20 rounded text-xs font-orbitron">
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Error state */}
            {ngError && (
              <div className="text-center py-10 glass-effect rounded-2xl border border-red-500/20 mb-6">
                <p className="text-red-400 font-orbitron text-sm">{ngMatchData?.message ?? "Could not fetch matched jobs. Please try again."}</p>
                <Button onClick={() => runNgMatch()} className="mt-4 text-xs font-orbitron" variant="outline">Retry</Button>
              </div>
            )}

            {/* Results */}
            {ngSubmitted && !ngFetching && (ngMatchData?.jobs ?? []).length > 0 && (
              <div>
                <h3 className="font-orbitron font-bold text-galactic-orange text-sm mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Best-Matched Jobs for Nigerian Engineers
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(ngMatchData?.jobs ?? []).map(job => (
                    <a
                      key={job.id}
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-effect rounded-xl p-5 border border-galactic-orange/15 hover:border-galactic-orange/45 transition-all group flex flex-col"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {job.company_logo ? (
                          <img src={job.company_logo} alt={job.company_name} className="w-10 h-10 rounded-lg object-contain bg-white/10 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-galactic-orange/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-galactic-orange" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-galactic-orange transition-colors line-clamp-1">{job.title}</h3>
                          <p className="text-gray-400 text-xs">{job.company_name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {job._ngFriendly && (
                            <span className="text-xs px-2 py-0.5 bg-green-500/15 text-green-400 border border-green-500/25 rounded-full font-orbitron whitespace-nowrap">
                              🇳🇬 NG-Friendly
                            </span>
                          )}
                          <span className="text-xs text-gray-600 font-orbitron">score {job._score}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.candidate_required_location || "Worldwide"}</span>
                        {job.job_type && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.job_type}</span>
                        )}
                        {job.salary && (
                          <span className="text-galactic-green font-semibold">{job.salary}</span>
                        )}
                      </div>
                      {job.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {job.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-galactic-orange/10 text-galactic-orange rounded text-xs">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className="text-gray-600 text-xs">{timeAgo(job.publication_date)}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-galactic-orange" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {ngSubmitted && !ngFetching && !ngError && (ngMatchData?.jobs ?? []).length === 0 && (
              <div className="text-center py-12 glass-effect rounded-2xl border border-galactic-orange/10">
                <Briefcase className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-orbitron text-sm">No matched jobs found right now.</p>
                <p className="text-gray-600 text-xs mt-1">Try adding more skills or changing your role above.</p>
              </div>
            )}

            {/* Initial prompt */}
            {!ngSubmitted && (
              <div className="text-center py-14 glass-effect rounded-2xl border border-galactic-orange/10">
                <span className="text-5xl mb-4 block">🇳🇬</span>
                <p className="text-gray-300 font-orbitron text-sm mb-1">Ready to match Nigerian engineers with global roles</p>
                <p className="text-gray-600 text-xs">Describe your skills above and hit <span className="text-galactic-orange">Find My Match</span></p>
              </div>
            )}

            {/* LinkedIn Quick-search hints */}
            <div className="mt-10 glass-effect rounded-2xl p-6 border border-neon-cyan/15">
              <h3 className="font-orbitron font-bold text-neon-cyan text-sm mb-4 flex items-center gap-2">
                <Network className="w-4 h-4" /> LinkedIn Fast-Track for Nigerian Engineers
              </h3>
              <p className="text-gray-400 text-xs mb-4">
                Use these pre-built LinkedIn job search URLs — filtered for companies with a history of hiring Nigerian/Africa-based talent remotely.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "Remote SWE — Nigeria open", url: "https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=Nigeria&f_WT=2", desc: "Remote software engineer roles open to Nigeria" },
                  { label: "Remote Backend — Africa", url: "https://www.linkedin.com/jobs/search/?keywords=backend%20engineer&location=Africa&f_WT=2", desc: "Backend roles open to Africa-based engineers" },
                  { label: "Andela Network Jobs", url: "https://www.linkedin.com/company/andela/jobs/", desc: "Roles via Andela — Nigeria's largest talent network" },
                  { label: "Remote Tech Lead — Worldwide", url: "https://www.linkedin.com/jobs/search/?keywords=tech%20lead&f_WT=2&f_TPR=r604800", desc: "Tech lead roles worldwide, posted last 7 days" },
                  { label: "Systems Architect — Remote", url: "https://www.linkedin.com/jobs/search/?keywords=systems%20architect&f_WT=2", desc: "Remote systems architect openings" },
                  { label: "Startup Founder roles — Africa", url: "https://www.linkedin.com/jobs/search/?keywords=CTO%20OR%20co-founder&location=Africa&f_WT=2", desc: "CTO / co-founder roles at Africa-focused startups" },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl border border-neon-cyan/10 hover:border-neon-cyan/35 bg-white/2 transition-all group"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-xs font-orbitron font-bold text-neon-cyan group-hover:text-white transition-colors">{link.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Courses tab ─────────────────────────────────────────────────── */}
        {activeTab === "courses" && (
          <div>
            <div className="mb-8">
              <h2 className="font-orbitron font-bold text-2xl text-galactic-orange mb-2">
                Top Courses for {currentRoleLabel}
              </h2>
              <p className="text-gray-400 text-sm">Curated by practitioners, not algorithms. Every course here has been vetted by the community.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course, i) => (
                <a
                  key={i}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-effect rounded-2xl p-5 border border-galactic-orange/20 hover:border-galactic-orange/50 transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-galactic-orange flex-shrink-0" />
                      <span className="text-xs text-galactic-orange font-orbitron font-bold">{course.platform}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-orbitron ${course.free ? "bg-galactic-green/20 text-galactic-green border border-galactic-green/30" : "bg-galactic-orange/20 text-galactic-orange border border-galactic-orange/30"}`}>
                      {course.free ? "FREE" : "PAID"}
                    </span>
                  </div>
                  <h3 className="font-orbitron font-bold text-white text-sm mb-2 group-hover:text-galactic-orange transition-colors">{course.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed flex-1 mb-3">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-orbitron">{course.level}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-galactic-orange transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Jobs tab ─────────────────────────────────────────────────────── */}
        {activeTab === "jobs" && (
          <div>
            <div className="mb-6">
              <h2 className="font-orbitron font-bold text-2xl text-neon-cyan mb-2">Live Remote Jobs</h2>
              <p className="text-gray-400 text-sm">Fetched in real time from <a href="https://remotive.com" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">Remotive.com</a> — updated every few minutes.</p>
            </div>

            {/* Search */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && setSubmittedJobSearch(jobSearch)}
                  placeholder="Search jobs (e.g. React, Python)…"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-neon-cyan/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors"
                />
              </div>
              <Button
                onClick={() => setSubmittedJobSearch(jobSearch)}
                className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/30 font-orbitron text-xs"
              >
                Search
              </Button>
              <Button
                variant="ghost"
                onClick={() => refetchJobs()}
                className="text-gray-400 hover:text-neon-cyan border border-gray-800"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {jobsLoading && (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-orbitron text-sm">Fetching live jobs…</p>
              </div>
            )}
            {jobsError && (
              <div className="text-center py-12 glass-effect rounded-2xl border border-red-500/20">
                <p className="text-red-400 font-orbitron text-sm">{jobsData?.message ?? "Could not fetch jobs right now."}</p>
                <Button onClick={() => refetchJobs()} className="mt-4 text-xs font-orbitron" variant="outline">Retry</Button>
              </div>
            )}
            {!jobsLoading && (
              <div className="grid sm:grid-cols-2 gap-4">
                {(jobsData?.jobs ?? []).map((job) => (
                  <a
                    key={job.id}
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-effect rounded-xl p-5 border border-neon-cyan/15 hover:border-neon-cyan/40 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company_name} className="w-10 h-10 rounded-lg object-contain bg-white/10 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-neon-cyan" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-neon-cyan transition-colors truncate">{job.title}</h3>
                        <p className="text-gray-400 text-xs">{job.company_name}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-neon-cyan flex-shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {job.candidate_required_location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.candidate_required_location}</span>
                      )}
                      {job.job_type && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.job_type}</span>
                      )}
                      {job.salary && (
                        <span className="text-galactic-green font-semibold">{job.salary}</span>
                      )}
                    </div>
                    {job.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-neon-cyan/10 text-neon-cyan rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-600 text-xs mt-2">{timeAgo(job.publication_date)}</p>
                  </a>
                ))}
                {!jobsLoading && (jobsData?.jobs ?? []).length === 0 && (
                  <div className="col-span-2 text-center py-12 glass-effect rounded-xl border border-neon-cyan/10">
                    <Briefcase className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 font-orbitron text-sm">No jobs found. Try a different search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Experts tab ──────────────────────────────────────────────────── */}
        {activeTab === "experts" && (
          <div>
            <div className="mb-8">
              <h2 className="font-orbitron font-bold text-2xl text-neon-yellow mb-2">
                Industry Experts & Mentors
              </h2>
              <p className="text-gray-400 text-sm">
                The people who've done it and document the path. Follow them. Study their work. DM them thoughtfully.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {experts.map((expert, i) => (
                <a
                  key={i}
                  href={expert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-effect rounded-2xl p-5 border border-neon-yellow/15 hover:border-neon-yellow/40 transition-all group flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-neon-yellow" />
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-neon-yellow transition-colors">{expert.name}</h3>
                      <p className="text-xs text-gray-500">{expert.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20 rounded-full font-orbitron">{expert.platform}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 font-medium">{expert.niche}</p>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">{expert.why}</p>
                  <div className="flex items-center justify-end mt-3">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-neon-yellow" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Articles tab ─────────────────────────────────────────────────── */}
        {activeTab === "articles" && (
          <div>
            <div className="mb-6">
              <h2 className="font-orbitron font-bold text-2xl text-galactic-orange mb-2">Articles & Resources</h2>
              <p className="text-gray-400 text-sm">
                Live articles from <a href="https://dev.to" target="_blank" rel="noopener noreferrer" className="text-galactic-orange hover:underline">Dev.to</a> and discussions from Hacker News — curated to your role in real time.
              </p>
            </div>

            {/* Search + HN search */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-orbitron text-galactic-orange mb-2 block">Dev.to Tag Search</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={articleSearch}
                      onChange={e => setArticleSearch(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && setSubmittedArticleSearch(articleSearch)}
                      placeholder={`e.g. ${devToTag}`}
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-galactic-orange/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-galactic-orange"
                    />
                  </div>
                  <Button onClick={() => setSubmittedArticleSearch(articleSearch)} className="bg-galactic-orange/20 hover:bg-galactic-orange/30 text-galactic-orange border border-galactic-orange/30 text-xs font-orbitron">Go</Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-orbitron text-neon-cyan mb-2 block">Hacker News Search</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={hnSearch}
                      onChange={e => setHnSearch(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && setSubmittedHnSearch(hnSearch)}
                      placeholder="e.g. remote work salary negotiate"
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-neon-cyan/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
                    />
                  </div>
                  <Button onClick={() => setSubmittedHnSearch(hnSearch)} className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/30 text-xs font-orbitron">Go</Button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Dev.to articles */}
              <div>
                <h3 className="font-orbitron font-bold text-galactic-orange text-sm mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Dev.to Articles
                  {articlesLoading && <div className="w-3.5 h-3.5 border border-galactic-orange border-t-transparent rounded-full animate-spin" />}
                  <Button variant="ghost" size="sm" onClick={() => refetchArticles()} className="ml-auto text-gray-500 hover:text-galactic-orange p-1">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </h3>
                <div className="space-y-3">
                  {(articlesData?.articles ?? []).map(article => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block glass-effect rounded-xl p-4 border border-galactic-orange/10 hover:border-galactic-orange/30 transition-all group"
                    >
                      <h4 className="text-sm font-semibold text-white group-hover:text-galactic-orange transition-colors mb-1 line-clamp-2">{article.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2">{article.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" />{article.positive_reactions_count}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.reading_time_minutes}m read</span>
                        <span className="text-galactic-orange/60">@{article.user?.username}</span>
                      </div>
                    </a>
                  ))}
                  {!articlesLoading && (articlesData?.articles ?? []).length === 0 && (
                    <div className="text-center py-8 glass-effect rounded-xl border border-galactic-orange/10">
                      <p className="text-gray-500 text-sm">No articles found. Try a different tag.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* HN discussions */}
              <div>
                <h3 className="font-orbitron font-bold text-neon-cyan text-sm mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Hacker News Discussions
                  {hnLoading && <div className="w-3.5 h-3.5 border border-neon-cyan border-t-transparent rounded-full animate-spin" />}
                  <Button variant="ghost" size="sm" onClick={() => refetchHn()} className="ml-auto text-gray-500 hover:text-neon-cyan p-1">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </h3>
                <div className="space-y-3">
                  {validHnHits.map(hit => (
                    <a
                      key={hit.objectID}
                      href={hit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block glass-effect rounded-xl p-4 border border-neon-cyan/10 hover:border-neon-cyan/30 transition-all group"
                    >
                      <h4 className="text-sm font-semibold text-white group-hover:text-neon-cyan transition-colors mb-1 line-clamp-2">{hit.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{hit.points} pts</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{hit.num_comments} comments</span>
                        <span className="text-gray-600">{timeAgo(hit.created_at)}</span>
                      </div>
                    </a>
                  ))}
                  {!hnLoading && validHnHits.length === 0 && (
                    <div className="text-center py-8 glass-effect rounded-xl border border-neon-cyan/10">
                      <p className="text-gray-500 text-sm">No discussions found. Try a different search.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Job Sites tab ────────────────────────────────────────────────── */}
        {activeTab === "job-sites" && (
          <div>
            <div className="mb-8">
              <h2 className="font-orbitron font-bold text-2xl text-neon-purple mb-2">Job Site Recommender</h2>
              <p className="text-gray-400 text-sm">Not all job boards are equal. Here's where to spend your time — and why.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {JOB_SITES.map((site, i) => (
                <a
                  key={i}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-effect rounded-xl p-5 border border-neon-purple/15 hover:border-neon-purple/40 transition-all group flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-orbitron font-bold text-sm group-hover:opacity-80 transition-opacity ${site.color}`}>{site.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 border border-gray-700 rounded-full font-orbitron">{site.badge}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed flex-1 mb-3">{site.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-orbitron">{site.category}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Cheat Codes tab ──────────────────────────────────────────────── */}
        {activeTab === "cheat-codes" && (
          <div>
            <div className="mb-8">
              <h2 className="font-orbitron font-bold text-2xl text-neon-yellow mb-2">Career Cheat Codes</h2>
              <p className="text-gray-400 text-sm">The hard truths and insider plays most job seekers never learn. Your unfair advantage starts here.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {CHEAT_CODES.map((code, i) => (
                <div
                  key={i}
                  className="glass-effect rounded-2xl p-6 border border-neon-yellow/15 hover:border-neon-yellow/35 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">{code.icon}</span>
                    <div>
                      <h3 className="font-orbitron font-bold text-neon-yellow text-sm mb-2">{code.title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">{code.insight}</p>
                      <div className="flex items-start gap-2 bg-neon-yellow/5 border border-neon-yellow/20 rounded-lg p-3">
                        <ChevronRight className="w-4 h-4 text-neon-yellow flex-shrink-0 mt-0.5" />
                        <p className="text-neon-yellow text-xs font-medium">{code.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Roadmap tab ──────────────────────────────────────────────────── */}
        {activeTab === "roadmap" && (
          <div>
            <div className="mb-8">
              <h2 className="font-orbitron font-bold text-2xl text-galactic-orange mb-2">Your Career Roadmap</h2>
              <p className="text-gray-400 text-sm">
                A systematic 10-week game plan to go from where you are to where you want to be.
                Not theory — execution steps.
              </p>
            </div>

            {/* Roadmap phases */}
            <div className="space-y-5 mb-12">
              {CAREER_ROADMAP.map((phase, i) => (
                <div key={i} className={`glass-effect rounded-2xl p-6 border ${phase.borderColor}/20 hover:${phase.borderColor}/35 transition-all`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`font-orbitron font-bold text-xs px-3 py-1 rounded-full border ${phase.textColor} ${phase.borderColor}`}>{phase.phase}</span>
                    <h3 className={`font-orbitron font-bold text-lg ${phase.textColor}`}>{phase.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {phase.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-gray-300">
                        <div className={`w-5 h-5 rounded-full border ${phase.borderColor}/40 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <span className={`text-xs font-orbitron font-bold ${phase.textColor}`}>{j + 1}</span>
                        </div>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mindset section */}
            <div className="glass-effect rounded-2xl p-8 border border-galactic-orange/20">
              <h3 className="font-orbitron font-bold text-xl text-galactic-orange mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5" /> The Right Line of Thought
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { from: "Job searching is a numbers game", to: "Job searching is a targeting game. 5 perfect applications beat 100 spray-and-pray ones.", icon: Target },
                  { from: "I need more certifications to be ready", to: "You are ready enough. Ship something, document it, and prove it publicly. Certs help but shipped work is proof.", icon: Rocket },
                  { from: "I need to know more before applying", to: "Apply to roles you're 60-70% qualified for. You learn the rest on the job. 100% qualification = you're late.", icon: TrendingUp },
                  { from: "Recruiters will find me when I'm ready", to: "Recruiters find people who are visible. Publish work, engage publicly, build a signal trail that outlasts any application.", icon: Network },
                  { from: "I failed the interview, time to quit", to: "One rejection is data, not identity. Most senior engineers fail interviews at top companies. Debrief, iterate, reapply.", icon: Award },
                  { from: "The job market is impossible right now", to: "The market is tough for the average candidate. Be above average by shipping, writing, and networking. Average is optional.", icon: BarChart2 },
                ].map((shift, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-start gap-2 text-xs text-red-400/70 line-through">
                      <shift.icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400/50" />
                      {shift.from}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-galactic-orange font-medium">
                      <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {shift.to}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <p className="text-gray-400 text-sm mb-4 font-orbitron">Ready to take the first step?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={() => setActiveTab("courses")} className="bg-galactic-orange hover:bg-galactic-orange/80 text-black font-orbitron font-bold">
                  <BookOpen className="w-4 h-4 mr-2" /> Browse Courses
                </Button>
                <Button onClick={() => setActiveTab("jobs")} variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 font-orbitron">
                  <Briefcase className="w-4 h-4 mr-2" /> View Live Jobs
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
