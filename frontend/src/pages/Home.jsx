import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as questionService from '../services/questionService';
import * as resourceService from '../services/resourceService';
import { 
  ArrowRight, BookOpen, CheckCircle, Flame, Target, 
  Cpu, Briefcase, FileText, Database, Server, Network, Layers,
  AlertTriangle, X, ChevronDown, Terminal, Award,
  Calculator, Brain, MessageSquare, BarChart2
} from 'lucide-react';
import SEO from '../components/SEO';

// ── Count-up animation hook ──────────────────────────────────────────────────
const useCountUp = (target, duration = 1800) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    // Ease-out cubic: starts fast, slows near the end
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(easeOut(progress) * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startTimeRef.current = null;
    };
  }, [target, duration]);

  return count;
};

const faqs = [
  {
    category: 'Getting Started',
    color: 'text-accentBlue',
    items: [
      {
        q: 'Do I need to create an account to use NQTCoder?',
        a: 'Yes. You need a free account to access the Practice Arena, submit code, and track your progress. You can register using your email and password, or sign in instantly with Google One-Tap — no manual form filling needed.'
      },
      {
        q: 'Can I sign in with Google?',
        a: 'Absolutely. Click the "Continue with Google" button on the login or register page. If it is your first visit, a new account is automatically created using your Google display name and email — no password required.'
      },
      {
        q: 'How do I start practicing coding questions?',
        a: 'After logging in, click "Practice" in the navbar or "Start Practicing" on the Home page. You will land on the Practice Dashboard where you can filter questions by company (TCS, Infosys, Wipro etc.) or by topic (Arrays, Strings, Greedy etc.) and click any question to open the Problem Arena.'
      },
      {
        q: 'What companies and topics are covered?',
        a: 'NQTCoder covers 15+ companies including TCS, Infosys, Wipro, Cognizant, Accenture, and Capgemini. Topics include Arrays, Strings, Sorting, Searching, Greedy, Dynamic Programming, Graphs, and Mathematics — all aligned to the latest 2026-27 placement exam syllabi.'
      }
    ]
  },
  {
    category: 'Code Execution',
    color: 'text-accentBlue',
    items: [
      {
        q: 'Which programming languages are supported?',
        a: 'The platform supports C++ (GCC), Java 11, and Python 3. You can switch languages from the dropdown inside the Problem Arena. The editor remembers your last-used language across sessions.'
      },
      {
        q: 'Why does my code show a "System Error" or compiler not found warning?',
        a: 'NQTCoder runs code locally on the server using native compilers. If the server does not have the required compiler installed, you will see a [System Error] banner. The banner includes download links for GCC (via MSYS2 MinGW for C++), Adoptium JDK 11 (for Java), and Python 3. Contact the platform admin if the server-side compilers are missing.'
      },
      {
        q: 'My code is correct but the verdict shows Wrong Answer — why?',
        a: 'Make sure your program reads input from standard input (stdin) and prints output to standard output (stdout). Do not use function-only solutions — write a complete program with main() that manually parses stdin. Also ensure there are no extra spaces or newlines in your output, since the judge performs exact string matching after trimming.'
      },
      {
        q: 'Can I test my code on custom input before submitting?',
        a: 'Yes. Inside the Problem Arena, switch to the "Custom Input" tab in the console area. Paste your own stdin values and click Run to see the output. This does not consume a submission or affect your score.'
      }
    ]
  },
  {
    category: 'Mock Tests',
    color: 'text-accentBlue',
    items: [
      {
        q: 'How do Mock Tests work?',
        a: 'Mock Tests simulate a real company placement exam. Each test is timed (typically 90 minutes), has a fixed set of coding questions, and runs in a sealed proctored environment. Once started, you cannot pause the timer. Your final score and a detailed report are saved to your profile.'
      },
      {
        q: 'What happens if I switch browser tabs during a Mock Test?',
        a: 'The platform has an anti-cheat proctor system. Every time you leave the exam tab, a warning popup appears and a violation is logged. After 3 tab-switch violations, the test is automatically submitted with 0 marks on any unsolved questions — just like a real proctored exam.'
      },
      {
        q: 'Where can I see my past mock test results?',
        a: 'Go to your Profile page and click the "Mock Test History" tab. Every completed test shows the date, total score (out of 200), and the number of proctor violations. You can also click "Report Details" on any test to see a breakdown of each question result.'
      }
    ]
  },
  {
    category: 'Profile & Activity',
    color: 'text-accentBlue',
    items: [
      {
        q: 'What does the Activity Calendar on my profile show?',
        a: 'The calendar is a 53-week GitHub-style heatmap showing all days you submitted code or completed a mock test. Darker squares mean more activity on that day. Hover any square to see the exact date and activity count. It helps you visualize your consistency and study streaks.'
      },
      {
        q: 'How is my rank (Novice, Specialist, Expert, Grandmaster) calculated?',
        a: 'Your rank is based on the number of questions you have solved: 0–5 solved = Novice, 6–15 = Specialist, 16–30 = Expert, 31+ = Grandmaster. Ranks update instantly every time you get an Accepted verdict.'
      }
    ]
  },
  {
    category: 'Platform & Resources',
    color: 'text-accentBlue',
    items: [
      {
        q: 'Are the study resources (SQL Notes, DBMS, OS etc.) free?',
        a: 'Yes, all subject-wise revision notes listed on the Home page are completely free. Click "Open" on any resource to access the linked Google Drive folder. If a resource shows a "compilation error" modal, it means the Drive link is still being reviewed — check back soon or use the Practice Arena in the meantime.'
      },
      {
        q: 'I found a bug or want to give feedback — how do I report it?',
        a: 'Visit the Feedback & Contact page (link in the navbar). You can submit a bug report or general feedback with your name, email, and a message. All submissions are reviewed by the admin team and addressed promptly.'
      }
    ]
  }
];

const FaqList = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const toggle = (key) => setOpenIdx(prev => prev === key ? null : key);

  return (
    <div className="space-y-8">
      {faqs.map((group, gi) => (
        <div key={gi}>
          <div className={`text-[10px] font-black uppercase tracking-widest mb-3 ${group.color}`}>{group.category}</div>
          <div className="space-y-2">
            {group.items.map((item, ii) => {
              const key = `${gi}-${ii}`;
              const isOpen = openIdx === key;
              return (
                <div
                  key={key}
                  className={`bg-darkCard border rounded-xl overflow-hidden transition-all duration-200 ${
                    isOpen ? 'border-accentBlue/40 shadow-lg shadow-accentBlue/5' : 'border-darkBorder hover:border-slate-600'
                  }`}
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 cursor-pointer"
                  >
                    <span className={`text-sm font-bold leading-snug transition-colors ${
                      isOpen ? 'text-white' : 'text-slate-300'
                    }`}>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accentBlue' : ''
                    }`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-darkBorder/40 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const TUTORIAL_DATA = {
  python: {
    steps: [
      {
        title: '1. Boilerplate & Setup',
        desc: 'Import the standard `sys` library at the top to access optimized standard input/output streams.',
        highlightLines: [1, 2]
      },
      {
        title: '2. Read Input (stdin)',
        desc: 'Use `sys.stdin.read().split()` to parse the entire input. Since NQTCoder runs your code once per testcase, you do NOT need a loop to handle multiple separate testcase runs.',
        highlightLines: [4, 5, 6]
      },
      {
        title: '3. Main Logic',
        desc: 'Extract N and other input variables from the list of strings, convert their types (e.g. to int), and write your algorithm logic here.',
        highlightLines: [8, 9, 10, 11]
      },
      {
        title: '4. Print Output (stdout)',
        desc: 'Print the final result to standard output. Avoid printing extra user prompt statements (like "Enter N:").',
        highlightLines: [13]
      }
    ],
    code: [
      { text: '# Import standard libraries', type: 'comment' },
      { text: 'import sys', type: 'setup' },
      { text: '', type: 'empty' },
      { text: 'def main():', type: 'setup' },
      { text: '    # 1. Read all whitespace-separated tokens from stdin', type: 'comment' },
      { text: '    input_data = sys.stdin.read().split()', type: 'input' },
      { text: '    if not input_data: return', type: 'input' },
      { text: '    ', type: 'empty' },
      { text: '    # 2. Parse values (e.g. read array size N and array elements)', type: 'comment' },
      { text: '    N = int(input_data[0])', type: 'logic' },
      { text: '    arr = [int(x) for x in input_data[1:N+1]]', type: 'logic' },
      { text: '    result = sum(arr)  # Your custom algorithm logic', type: 'logic' },
      { text: '    ', type: 'empty' },
      { text: '    # 3. Print the output directly', type: 'comment' },
      { text: '    print(result)', type: 'output' },
      { text: '', type: 'empty' },
      { text: "if __name__ == '__main__':", type: 'setup' },
      { text: '    main()', type: 'setup' }
    ]
  },
  cpp: {
    steps: [
      {
        title: '1. Boilerplate & Setup',
        desc: 'Include standard C++ library headers and declare standard namespace at the top of your program.',
        highlightLines: [1, 2, 3, 4, 6]
      },
      {
        title: '2. Read Input (stdin)',
        desc: 'Use standard stream `std::cin` to read variables. Since NQTCoder runs your code once per testcase, you do NOT need a `while(t--)` loop to read multiple test cases.',
        highlightLines: [11, 12, 13, 14, 15]
      },
      {
        title: '3. Main Logic',
        desc: 'Implement your problem-solving logic. You can use standard containers like std::vector and algorithms.',
        highlightLines: [16, 17, 18]
      },
      {
        title: '4. Print Output (stdout)',
        desc: 'Print the final result to `std::cout` followed by a newline. Do not print any conversational text.',
        highlightLines: [20]
      }
    ],
    code: [
      { text: '#include <iostream>', type: 'setup' },
      { text: '#include <vector>', type: 'setup' },
      { text: '#include <algorithm>', type: 'setup' },
      { text: 'using namespace std;', type: 'setup' },
      { text: '', type: 'empty' },
      { text: 'int main() {', type: 'setup' },
      { text: '    // Fast I/O setup', type: 'setup' },
      { text: '    ios_base::sync_with_stdio(false);', type: 'setup' },
      { text: '    cin.tie(NULL);', type: 'setup' },
      { text: '    ', type: 'empty' },
      { text: '    // 1. Read input parameters from stdin', type: 'comment' },
      { text: '    int N;', type: 'input' },
      { text: '    cin >> N;', type: 'input' },
      { text: '    vector<int> arr(N);', type: 'input' },
      { text: '    for (int i = 0; i < N; i++) { cin >> arr[i]; }', type: 'input' },
      { text: '    ', type: 'empty' },
      { text: '    // 2. Compute logic', type: 'comment' },
      { text: '    int sum = 0;', type: 'logic' },
      { text: '    for (int x : arr) { sum += x; }', type: 'logic' },
      { text: '    ', type: 'empty' },
      { text: '    // 3. Write result to stdout', type: 'comment' },
      { text: '    cout << sum << "\\n";', type: 'output' },
      { text: '    return 0;', type: 'setup' },
      { text: '}', type: 'setup' }
    ]
  },
  java: {
    steps: [
      {
        title: '1. Boilerplate & Setup',
        desc: 'Import `java.util.Scanner` and define your main entry class exactly as `Main`. The compiler expects `public class Main` with a capital M.',
        highlightLines: [1, 3, 4, 18]
      },
      {
        title: '2. Read Input (stdin)',
        desc: 'Instantiate `Scanner` with `System.in`. Since NQTCoder executes your code once per testcase, you do NOT need a multi-testcase loop like `while(sc.hasNext())`.',
        highlightLines: [5, 6, 7, 8, 9, 10, 11]
      },
      {
        title: '3. Main Logic',
        desc: 'Perform the core computations. Parse string tokens or numbers inside your Main class, then write your custom logic.',
        highlightLines: [12, 13, 14]
      },
      {
        title: '4. Print Output (stdout)',
        desc: 'Use `System.out.println()` to output final values. Print exactly what the test case output format specifies.',
        highlightLines: [16]
      }
    ],
    code: [
      { text: 'import java.util.Scanner;', type: 'setup' },
      { text: '', type: 'empty' },
      { text: 'public class Main {', type: 'setup' },
      { text: '    public static void main(String[] args) {', type: 'setup' },
      { text: '        Scanner sc = new Scanner(System.in);', type: 'input' },
      { text: '        ', type: 'empty' },
      { text: '        // 1. Read input data from standard input stream', type: 'comment' },
      { text: '        int N = sc.nextInt();', type: 'input' },
      { text: '        int[] arr = new int[N];', type: 'input' },
      { text: '        for (int i = 0; i < N; i++) {', type: 'input' },
      { text: '            arr[i] = sc.nextInt();', type: 'input' },
      { text: '        }', type: 'input' },
      { text: '        ', type: 'empty' },
      { text: '        // 2. Custom logical computations', type: 'comment' },
      { text: '        int sum = 0;', type: 'logic' },
      { text: '        for (int x : arr) { sum += x; }', type: 'logic' },
      { text: '        ', type: 'empty' },
      { text: '        // 3. Output standard output', type: 'comment' },
      { text: '        System.out.println(sum);', type: 'output' },
      { text: '    }', type: 'setup' },
      { text: '}', type: 'setup' }
    ]
  }
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalCoding, setTotalCoding] = useState(0);
  const [totalQuant, setTotalQuant] = useState(0);
  const [totalLogical, setTotalLogical] = useState(0);
  const [totalVerbal, setTotalVerbal] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalTopics, setTotalTopics] = useState(0);
  const [selectedResource, setSelectedResource] = useState(null);
  const [modalLogs, setModalLogs] = useState([]);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [resources, setResources] = useState([]);
  const [companyCounts, setCompanyCounts] = useState({});
  const [tutorialLang, setTutorialLang] = useState('python');
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    if (!selectedResource) return;
    setCompilationProgress(0);
    setModalLogs([
      `[sys] Initializing compiler for ${selectedResource.name}...`,
      `[sys] Locating placement notes database...`
    ]);

    const logsList = [
      `[sys] Fetching modules: ${selectedResource.name} Revision Pack`,
      `[check] Checking local asset cache... [MISS]`,
      `[build] Pulling dynamic revision templates... [OK]`,
      `[compile] Linking syllabus topics to TCS NQT 2026-27 guidelines...`,
      `[warn] File under final placement auditor review...`,
      `[status] COMPILATION_FAILED (Reason: RESOURCE_PENDING_AUDIT)`
    ];

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      const progressValue = Math.min(100, Math.round((step / logsList.length) * 100));
      setCompilationProgress(progressValue);
      
      if (step <= logsList.length) {
        setModalLogs(prev => [...prev, logsList[step - 1]]);
      }
      
      if (step >= logsList.length) {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [selectedResource]);

  const handleOpenResource = (e, resource) => {
    e.preventDefault();
    setSelectedResource(resource);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { totalCodingQuestions, totalQuantQuestions, totalLogicalQuestions, totalVerbalQuestions, companyCounts, totalCompanies, totalTopics } = await questionService.getQuestionsCount();
        setTotalCoding(totalCodingQuestions || 0);
        setTotalQuant(totalQuantQuestions || 0);
        setTotalLogical(totalLogicalQuestions || 0);
        setTotalVerbal(totalVerbalQuestions || 0);
        setCompanyCounts(companyCounts || {});
        setTotalCompanies(totalCompanies || 15);
        setTotalTopics(totalTopics || 12);
      } catch (err) {
        console.error('Could not fetch questions count for homepage:', err);
        setTotalCoding(290); // Fallback
        setTotalQuant(65);
        setTotalLogical(10);
        setTotalVerbal(6);
        setTotalCompanies(15);
        setTotalTopics(12);
      }
    };
    fetchStats();

    // Fetch resources from API
    resourceService.getCategories().then(data => {
      if (data && data.length > 0) {
        setResources(data.map(r => ({
          name: r.title,
          iconType: r.icon || 'Database',
          link: r.driveFolderLink || '#',
          _id: r._id
        })));
      }
    }).catch(() => {
      // Fallback to defaults if API fails
      setResources([
        { name: 'SQL Notes', iconType: 'Database', link: '#' },
        { name: 'DBMS Notes', iconType: 'Database', link: '#' },
        { name: 'Operating Systems Notes', iconType: 'Server', link: '#' },
        { name: 'Computer Networks Notes', iconType: 'Network', link: '#' },
        { name: 'OOP Notes', iconType: 'Layers', link: '#' }
      ]);
    });
  }, []);

  const animatedCoding  = useCountUp(totalCoding, 1600);
  const animatedQuant   = useCountUp(totalQuant, 1400);
  const animatedLogical = useCountUp(totalLogical, 1200);
  const animatedVerbal  = useCountUp(totalVerbal, 1000);

  const stats = [
    { label: 'Coding PYQs', animated: animatedCoding, suffix: '+' },
    { label: 'Quant Questions', animated: animatedQuant, suffix: '+' },
    { label: 'Logical Reasoning', animated: animatedLogical, suffix: '+' }
  ];

  const companies = [
    { name: 'TCS', query: 'TCS' },
    { name: 'Infosys', query: 'Infosys' },
    { name: 'Wipro', query: 'Wipro' },
    { name: 'Cognizant', query: 'Cognizant' },
    { name: 'Accenture', query: 'Accenture' },
    { name: 'Capgemini', query: 'Capgemini' }
  ].map(c => {
    const count = companyCounts[c.query.toUpperCase()] || 0;
    const countStr = count < 5 ? '5+' : `${count}+`;
    return {
      ...c,
      count: `${countStr} Questions`
    };
  });

  const topics = [
    'Arrays', 'Strings', 'Sorting', 'Searching', 
    'Greedy', 'Dynamic Programming', 'Pattern', 'Math'
  ];

  const whyFeatures = [
    {
      title: 'Real Placement PYQs',
      description: 'Practice exact coding questions previously asked in corporate recruitment tests.',
      icon: Cpu
    },
    {
      title: 'Company-wise Preparation',
      description: 'Tailor your practice towards specific corporate standards like TCS, Infosys, and Wipro.',
      icon: Briefcase
    },
    {
      title: 'Topic-wise Learning',
      description: 'Strengthen weak coding domains by practicing sorted challenges itemized by data structures.',
      icon: Layers
    },
    {
      title: 'Free Resources',
      description: 'Access complete DBMS, SQL, Operating Systems, OOP, and Computer Networks revision notes.',
      icon: FileText
    }
  ];

  const iconMap = { Database, Server, Network, Layers, FileText, BookOpen };

  // Smooth scroll handler
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const solvedCount = user?.solvedQuestions?.length || 0;
  const userCompletionPercent = totalCoding > 0 ? Math.min(100, Math.round((solvedCount / totalCoding) * 100)) : 0;

  return (
    <div className="bg-darkBg text-slate-100 min-h-screen selection:bg-accentBlue/30 selection:text-slate-100">
      {/* ── SEO ──────────────────────────────────────────────────────────── */}
      <SEO
        title="Placement Coding Practice — NQT, TCS, Infosys, Wipro"
        description="Practice 200+ real placement coding questions from TCS NQT, Infosys, Wipro, Cognizant & more. Take proctored mock tests, track your rank on the leaderboard. Free for all students."
        path="/"
        keywords="NQT coder, placement coding practice, TCS NQT questions, Infosys coding interview, Wipro coding test, mock test, leaderboard, C++ Java Python, programming placement"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': faqs.flatMap(group =>
              group.items.map(item => ({
                '@type': 'Question',
                'name': item.q,
                'acceptedAnswer': { '@type': 'Answer', 'text': item.a }
              }))
            )
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.nqtcoder.dev/' }
            ]
          }
        ]}
      />

      {/* 1. Hero Section */}
      <section className="relative pt-14 pb-10 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 bg-accentBlue/10 text-accentBlue px-3.5 py-1 rounded-full text-xs font-semibold border border-accentBlue/20 mb-5 animate-fade-in select-none">
          <span>Targeting Placements 2026-27</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl text-white">
          Practice Real Placement <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradientFrom via-gradientVia to-accentBlue">Coding Questions</span>
        </h1>

        <p className="text-slate-400 mt-3 text-sm sm:text-base md:text-lg max-w-3xl font-medium leading-relaxed">
          Prepare for top recruitment drives. Solve interactive <strong className="text-white">Coding Problems</strong> with our proctored compiler workspace, or master <strong className="text-white">Aptitude & Logical MCQs</strong> tailored to TCS, Infosys, and Accenture syllabus.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
          <Link
            to="/practice"
            className="bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg transition-all shadow-md shadow-accentBtn/15 text-center flex items-center justify-center space-x-2"
          >
            <span>Practice Coding</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/aptitude"
            className="bg-transparent border border-darkBorder hover:border-accentBlue text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg transition-all text-center flex items-center justify-center space-x-2"
          >
            <span>Practice Aptitude</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-darkBorder/60 border border-darkBorder rounded-xl overflow-hidden mt-10 w-full max-w-4xl shadow-2xl">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-darkCard py-6 px-6 text-center">
              <div className="text-3xl font-extrabold text-white tabular-nums">
                {s.animated}{s.suffix}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>


      {/* 2. User Progress Section (Only if Logged In) */}
      {user && (
        <section className="border-t border-darkBorder py-16 px-6 max-w-6xl mx-auto">
          <div className="mb-10 text-left">
            <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Your Coding Preparation Metrics
            </h2>
            <h3 className="text-2xl font-extrabold text-white">Track Your Coding Progress</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Solved Count */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-xl flex items-center justify-between shadow-lg">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coding Problems Solved</span>
                <div className="text-3xl font-extrabold text-white">{solvedCount} / {totalCoding}</div>
              </div>
              <div className="bg-accentBlue/10 p-3 rounded-lg border border-accentBlue/20 text-accentBlue">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Current Streak */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-xl flex items-center justify-between shadow-lg">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Streak</span>
                <div className="text-3xl font-extrabold text-white">{user.currentStreak || 0} Days</div>
              </div>
              <div className="bg-accentBlue/10 p-3 rounded-lg border border-accentBlue/20 text-accentBlue">
                <Flame className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Max Streak */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-xl flex items-center justify-between shadow-lg">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Max Streak</span>
                <div className="text-3xl font-extrabold text-white">{user.maxStreak || 0} Days</div>
              </div>
              <div className="bg-accentBlue/10 p-3 rounded-lg border border-accentBlue/20 text-accentBlue">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Completion Percent */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-xl space-y-4 shadow-lg flex flex-col justify-center">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completion Percentage</span>
                <span className="text-xs font-black text-accentBlue">{userCompletionPercent}%</span>
              </div>
              <div className="w-full bg-darkBg h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-accentBlue h-full rounded-full transition-all duration-500" 
                  style={{ width: `${userCompletionPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Company Section */}
      <section id="companies" className="border-t border-darkBorder py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1.5">Focus Your Target</h2>
          <h3 className="text-3xl font-extrabold text-white">Company-wise Preparation</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c, idx) => (
            <div key={idx} className="bg-darkCard border border-darkBorder p-6 rounded-xl flex flex-col justify-between hover:border-accentBlue transition-all group shadow-md">
              <div>
                <h4 className="text-lg font-extrabold text-white group-hover:text-accentBlue transition-colors">{c.name}</h4>
                <p className="text-slate-400 text-xs font-semibold mt-1">{c.count}</p>
              </div>
              <div className="mt-6">
                <Link
                  to={`/practice?company=${c.query}`}
                  className="w-full inline-block bg-darkBg hover:bg-accentBtn text-slate-200 hover:text-white text-center font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg border border-darkBorder transition-all"
                >
                  Practice {c.name} PYQs
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3.2 High Five Roadmaps Section */}
      <section className="border-t border-darkBorder py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1.5">Sequential Sprints</h2>
            <h3 className="text-3xl font-extrabold text-white">High Five Roadmaps</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              Ace your programming preparation in focused, bite-sized modules. Solve exactly <strong className="text-accentBlue">5 unsolved questions</strong> sequentially (sorted from Easy to Hard) to conquer any target path!
            </p>
          </div>
          <Link
            to="/tracks"
            className="inline-flex items-center text-accentBlue hover:text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            Explore Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: All Roadmaps */}
          <div className="bg-darkCard border border-darkBorder p-6 rounded-xl flex flex-col justify-between hover:border-accentBlue transition-all group shadow-md relative overflow-hidden">
            <div className="space-y-4">
              <div className="text-accentBlue bg-accentBlue/10 w-10 h-10 rounded-lg flex items-center justify-center border border-accentBlue/10">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white group-hover:text-accentBlue transition-colors">All Practice Paths</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Browse the complete catalog of all auto-generated corporate roadmaps and subject-wise coding paths.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-[9px] bg-accentBlue/10 text-accentBlue px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-accentBlue/20">
                    🎯 27+ Active Paths
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/tracks"
                className="w-full inline-block bg-darkBg hover:bg-accentBtn text-slate-200 hover:text-white text-center font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg border border-darkBorder transition-all"
              >
                View All Roadmaps
              </Link>
            </div>
          </div>

          {/* Card 2: Company Roadmaps */}
          <div className="bg-darkCard border border-darkBorder p-6 rounded-xl flex flex-col justify-between hover:border-accentBlue transition-all group shadow-md relative overflow-hidden">
            <div className="space-y-4">
              <div className="text-accentBlue bg-accentBlue/10 w-10 h-10 rounded-lg flex items-center justify-center border border-accentBlue/10">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white group-hover:text-accentBlue transition-colors">Company Roadmaps</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Target specific placements (TCS, etc.) with custom batches of unsolved company-wise coding exam questions.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-[9px] bg-accentBlue/10 text-accentBlue px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-accentBlue/20">
                    🏢 Company Pyqs
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/tracks?filter=company"
                className="w-full inline-block bg-darkBg hover:bg-accentBtn text-slate-200 hover:text-white text-center font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg border border-darkBorder transition-all"
              >
                Explore Company Paths
              </Link>
            </div>
          </div>

          {/* Card 3: Topic Roadmaps */}
          <div className="bg-darkCard border border-darkBorder p-6 rounded-xl flex flex-col justify-between hover:border-accentBlue transition-all group shadow-md relative overflow-hidden">
            <div className="space-y-4">
              <div className="text-accentBlue bg-accentBlue/10 w-10 h-10 rounded-lg flex items-center justify-center border border-accentBlue/10">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white group-hover:text-accentBlue transition-colors">Topic Practice Paths</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Build fundamental data structure and algorithm strength topic-by-topic (Arrays, DP, Strings).
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-[9px] bg-accentBlue/10 text-accentBlue px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-accentBlue/20">
                    🏷️ Topic Focus
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/tracks?filter=topic"
                className="w-full inline-block bg-darkBg hover:bg-accentBtn text-slate-200 hover:text-white text-center font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg border border-darkBorder transition-all"
              >
                Explore Topic Paths
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Aptitude & Cognitive Sections */}
      <section className="border-t border-darkBorder py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1.5">Cognitive Skills</h2>
          <h3 className="text-3xl font-extrabold text-white">Aptitude & Reasoning Arena</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Quantitative Aptitude */}
          <div className="bg-darkCard border border-darkBorder p-6 rounded-xl flex flex-col justify-between hover:border-accentBlue transition-all group shadow-md">
            <div className="space-y-4">
              <div className="text-accentBlue bg-accentBlue/10 w-10 h-10 rounded-lg flex items-center justify-center border border-accentBlue/10">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white group-hover:text-accentBlue transition-colors">Quantitative Aptitude</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Arithmetic, Percentage, HCF/LCM, Profit & Loss, Speed & Distance, and Alligation.
                </p>
                <span className="inline-block mt-3 text-[10px] bg-accentBlue/10 text-accentBlue px-2.5 py-0.5 rounded-full font-bold border border-accentBlue/20">
                  {totalQuant}+ Solved Questions
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/aptitude?section=quant"
                className="w-full inline-block bg-darkBg hover:bg-accentBtn text-slate-200 hover:text-white text-center font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg border border-darkBorder transition-all"
              >
                Practice Quant
              </Link>
            </div>
          </div>

          {/* Card 2: Logical Reasoning */}
          <div className="bg-darkCard border border-darkBorder p-6 rounded-xl flex flex-col justify-between hover:border-accentBlue transition-all group shadow-md">
            <div className="space-y-4">
              <div className="text-accentBlue bg-accentBlue/10 w-10 h-10 rounded-lg flex items-center justify-center border border-accentBlue/10">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white group-hover:text-accentBlue transition-colors">Logical Reasoning</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Coding-Decoding, Blood Relations, Circular & Hexagonal Arrangements, and Syllogisms.
                </p>
                <span className="inline-block mt-3 text-[10px] bg-accentBlue/10 text-accentBlue px-2.5 py-0.5 rounded-full font-bold border border-accentBlue/20">
                  {totalLogical}+ Solved Questions
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/aptitude?section=logical"
                className="w-full inline-block bg-darkBg hover:bg-accentBtn text-slate-200 hover:text-white text-center font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg border border-darkBorder transition-all"
              >
                Practice Logical
              </Link>
            </div>
          </div>

          {/* Card 3: Verbal Ability */}
          <div className="bg-darkCard border border-darkBorder p-6 rounded-xl flex flex-col justify-between hover:border-accentBlue transition-all group shadow-md">
            <div className="space-y-4">
              <div className="text-accentBlue bg-accentBlue/10 w-10 h-10 rounded-lg flex items-center justify-center border border-accentBlue/10">
                <MessageSquare className="w-5 h-5 text-accentBlue" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white group-hover:text-accentBlue transition-colors">Verbal Ability</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Sentence Completion, Passage Recall, and AI-evaluated Email Writing scenarios.
                </p>
                <span className="inline-block mt-3 text-[10px] bg-accentBlue/10 text-accentBlue px-2.5 py-0.5 rounded-full font-bold border border-accentBlue/20">
                  {totalVerbal}+ Solved Questions
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/aptitude?section=verbal"
                className="w-full inline-block bg-darkBg hover:bg-accentBtn text-slate-200 hover:text-white text-center font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg border border-darkBorder transition-all"
              >
                Practice Verbal
              </Link>
            </div>
          </div>

          {/* Card 4: Data Interpretation */}
          <div className="bg-darkCard border border-darkBorder/45 p-6 rounded-xl flex flex-col justify-between opacity-80 shadow-md">
            <div className="space-y-4">
              <div className="text-slate-500 bg-slate-800/50 w-10 h-10 rounded-lg flex items-center justify-center border border-slate-700/50">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-300">Data Interpretation</h4>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                  Data sufficiency, charts, graphs, tables, and analytical reasoning puzzles.
                </p>
                <span className="inline-block mt-3 text-[10px] bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-full font-bold border border-slate-700/50">
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="mt-6">
              <button
                disabled
                className="w-full cursor-not-allowed bg-transparent text-slate-500 text-center font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-lg border border-darkBorder/40"
              >
                Unavailable
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Popular Topics Section */}
      <section className="border-t border-darkBorder py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1.5">Syllabus Domains</h2>
          <h3 className="text-3xl font-extrabold text-white">Popular Coding Topics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topics.map((t, idx) => (
            <Link
              key={idx}
              to={`/practice?topic=${t}`}
              className="bg-darkCard border border-darkBorder hover:border-accentBlue p-5 rounded-lg text-center font-bold text-xs sm:text-sm text-slate-300 hover:text-white transition-all shadow-sm select-none"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Why NQTCoder */}
      <section className="border-t border-darkBorder py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1.5">Why Choose Us</h2>
          <h3 className="text-3xl font-extrabold text-white">Designed For Placement Aspirants</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyFeatures.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="bg-darkCard border border-darkBorder p-6 rounded-xl shadow-sm space-y-4">
                <div className="text-accentBlue bg-accentBlue/10 w-10 h-10 rounded-lg flex items-center justify-center border border-accentBlue/10">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">{f.title}</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5.5 Interactive Code Structure Tutorial */}
      <section id="tutorial" className="border-t border-darkBorder py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1.5 flex items-center gap-1.5 justify-center sm:justify-start">
            <Terminal className="w-4 h-4" /> Learn Platform Mechanics
          </h2>
          <h3 className="text-3xl font-extrabold text-white">How to Write Your Code</h3>
          <p className="text-slate-400 text-sm mt-3 max-w-3xl leading-relaxed">
            NQTCoder executes your program <strong className="text-white">exactly once per test case</strong>. The test case inputs are fed directly into standard input (<code className="text-sky-400 font-mono">stdin</code>) and output is parsed from standard output (<code className="text-amber-400 font-mono">stdout</code>). 
            <br />
            <span className="inline-block mt-2 text-accentBlue font-bold bg-accentBlue/5 px-2.5 py-1 rounded border border-accentBlue/10 text-xs">
              💡 Pro Tip:
            </span> You do <strong className="text-slate-200">NOT need a multi-testcase loop</strong> (like <code className="text-amber-400 font-mono">while(t--)</code> or <code className="text-amber-400 font-mono">while(sc.hasNext())</code>) since the platform executes the code afresh for each separate testcase.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Guide Steps */}
          <div className="lg:col-span-4 space-y-4">
            {/* Language Selector Tabs */}
            <div className="bg-darkCard border border-darkBorder p-1.5 rounded-xl flex gap-1.5 select-none">
              {['python', 'cpp', 'java'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setTutorialLang(lang);
                    setTutorialStep(0);
                  }}
                  className={`flex-grow py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    tutorialLang === lang
                      ? 'bg-accentBtn text-white border-accentBtn/35 shadow-md shadow-accentBtn/10'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {lang === 'python' ? '🐍 Python' : lang === 'cpp' ? '⚙️ C++' : '☕ Java'}
                </button>
              ))}
            </div>

            {/* Guide Steps Cards */}
            <div className="space-y-2.5">
              {TUTORIAL_DATA[tutorialLang].steps.map((step, idx) => {
                const isActive = tutorialStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setTutorialStep(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-accentBlue/10 border-accentBlue/30 shadow-md shadow-accentBlue/5'
                        : 'bg-darkCard/40 border-darkBorder hover:border-slate-700'
                    }`}
                  >
                    <h4 className={`text-xs font-black uppercase tracking-wider transition-colors ${
                      isActive ? 'text-accentBlue' : 'text-slate-300'
                    }`}>
                      {step.title}
                    </h4>
                    {isActive && (
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed font-medium">
                        {step.desc}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Styled Terminal / PowerShell Container with 3D Tilt Effect */}
          <div className="lg:col-span-8 flex flex-col items-stretch" style={{ perspective: '1200px' }}>
            <div 
              className="bg-gradient-to-b from-[#090f1a] to-[#04070f] border border-darkBorder/80 hover:border-accentBlue/30 rounded-2xl shadow-2xl shadow-accentBlue/5 overflow-hidden flex flex-col h-[480px] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] hover:scale-[1.01]"
              style={{
                transform: 'rotateY(-4deg) rotateX(2deg) rotateZ(0.5deg)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) rotateZ(0deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotateY(-4deg) rotateX(2deg) rotateZ(0.5deg)';
              }}
            >
              {/* Terminal Window Header */}
              <div className="bg-[#0b1320] border-b border-darkBorder/80 px-4 py-3.5 flex items-center justify-between select-none">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/85 border border-rose-600/35"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/85 border border-amber-600/35"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/85 border border-emerald-600/35"></div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider ml-2">
                    code_structure_guide.{tutorialLang === 'python' ? 'py' : tutorialLang === 'cpp' ? 'cpp' : 'java'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-darkBg text-slate-400 border border-darkBorder select-none">
                    PS Core
                  </span>
                </div>
              </div>

              {/* Code Output Window */}
              <div className="flex-grow p-4 font-mono text-[11px] leading-6 overflow-y-auto scrollbar-thin text-left bg-black/40">
                {TUTORIAL_DATA[tutorialLang].code.map((line, idx) => {
                  const lineNo = idx + 1;
                  const isHighlighted = TUTORIAL_DATA[tutorialLang].steps[tutorialStep].highlightLines.includes(lineNo);
                  
                  // Color codes
                  let colorClass = 'text-slate-400';
                  if (line.type === 'comment') colorClass = 'text-slate-600 italic';
                  else if (line.type === 'setup') colorClass = 'text-indigo-400';
                  else if (line.type === 'input') colorClass = 'text-sky-400 font-semibold';
                  else if (line.type === 'logic') colorClass = 'text-emerald-400 font-semibold';
                  else if (line.type === 'output') colorClass = 'text-amber-400 font-bold';

                  return (
                    <div
                      key={idx}
                      className={`flex items-start px-3 transition-all duration-300 ${
                        isHighlighted 
                          ? 'bg-accentBlue/8 border-l-2 border-accentBlue text-white opacity-100'
                          : 'opacity-30 hover:opacity-55'
                      }`}
                    >
                      <span className="w-7 select-none text-slate-600 text-right pr-3 font-semibold border-r border-darkBorder/20 mr-3">
                        {lineNo}
                      </span>
                      <pre className={`whitespace-pre ${colorClass} font-semibold font-mono`}>
                        {line.text}
                      </pre>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend Footer */}
              <div className="bg-[#0a111c] border-t border-darkBorder/40 px-4 py-3 flex flex-wrap gap-x-4 gap-y-1 select-none">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" /> Boilerplate
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  <div className="w-2 h-2 rounded-full bg-sky-500" /> Read Stdin
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Write Logic
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  <div className="w-2 h-2 rounded-full bg-amber-500" /> Stdout Result
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Learning Resources Section */}
      <section id="resources" className="border-t border-darkBorder py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1.5">Free Study Materials</h2>
          <h3 className="text-3xl font-extrabold text-white">Subject-wise Revision Notes</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r, idx) => {
            const Icon = iconMap[r.iconType] || FileText;
            const hasLink = r.link && r.link !== '#';
            return (
              <div key={r._id || idx} className="bg-darkCard border border-darkBorder p-6 rounded-xl flex items-center justify-between shadow-sm group">
                <div className="flex items-center space-x-3.5">
                  <div className="text-accentBlue bg-accentBlue/10 p-2.5 rounded-lg border border-accentBlue/10 group-hover:bg-accentBtn group-hover:text-white transition-all">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">{r.name}</span>
                </div>
                {hasLink ? (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-darkBg hover:bg-accentBtn border border-darkBorder hover:border-accentBtn text-slate-300 hover:text-white text-[10px] uppercase font-bold tracking-wider px-3.5 py-2 rounded-lg transition-all flex items-center space-x-1"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={(e) => handleOpenResource(e, r)}
                    className="bg-darkBg hover:bg-accentBtn border border-darkBorder hover:border-accentBtn text-slate-300 hover:text-white text-[10px] uppercase font-bold tracking-wider px-3.5 py-2 rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="border-t border-darkBorder py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1.5">Got Questions?</h2>
          <h3 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">Everything you need to know about using NQTCoder — from registration to code execution.</p>
        </div>

        <FaqList />
      </section>

      {/* 8. Call To Action */}

      <section className="border-t border-darkBorder py-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Start Solving Real Company Questions
        </h2>
        <p className="text-slate-400 mt-4 text-xs sm:text-sm max-w-md font-medium leading-relaxed">
          Level up your syntax, coding speed, and logic under simulated test timers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
          <Link
            to="/practice"
            className="bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg transition-all shadow-md shadow-accentBtn/10"
          >
            Practice Now
          </Link>
          <button
            onClick={() => handleScrollTo('resources')}
            className="bg-transparent border border-darkBorder hover:border-slate-600 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg transition-all"
          >
            View Resources
          </button>
        </div>
      </section>



      {/* Resource Compiling Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-[#070b12]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-darkCard border border-darkBorder rounded-2xl w-full max-w-lg p-6 flex flex-col shadow-2xl glass-panel relative overflow-hidden text-left">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-darkBorder mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="bg-rose-500/10 text-rose-400 p-2 rounded-lg border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Resource Status: 404
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Target: {selectedResource.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-slate-400 hover:text-white p-1.5 hover:bg-darkBg/60 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Interactive Terminal Simulator */}
            <div className="bg-[#070b12] rounded-xl border border-darkBorder/60 p-4 font-mono text-[11px] text-slate-300 space-y-2 h-44 overflow-y-auto mb-4 scrollbar-thin">
              {modalLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log.startsWith('[sys]') && <span className="text-indigo-400">{log}</span>}
                  {log.startsWith('[check]') && <span className="text-blue-400">{log}</span>}
                  {log.startsWith('[build]') && <span className="text-emerald-400">{log}</span>}
                  {log.startsWith('[compile]') && <span className="text-yellow-400">{log}</span>}
                  {log.startsWith('[warn]') && <span className="text-orange-400 font-semibold">{log}</span>}
                  {log.startsWith('[status]') && <span className="text-rose-400 font-bold">{log}</span>}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 mb-4 select-none">
              <div className="flex justify-between text-[9px] uppercase font-bold tracking-wider">
                <span className="text-slate-400">Compiling Cheatsheet Assets</span>
                <span className={`${compilationProgress === 100 ? 'text-rose-400' : 'text-accentBlue'}`}>
                  {compilationProgress}%
                </span>
              </div>
              <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${compilationProgress === 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-accentBlue to-indigo-400'}`} 
                  style={{ width: `${compilationProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Explanatory notes */}
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4.5 mb-6 text-xs text-slate-400 leading-relaxed">
              <span className="font-bold text-white block mb-1">Why am I seeing this?</span>
              The placement cheatsheet for <strong className="text-white">{selectedResource.name}</strong> is currently undergoing a final content verification pass to align with 2026-27 TCS/Infosys syllabus shifts. Direct access is temporarily restricted to prevent deprecated patterns.
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSelectedResource(null);
                  navigate('/practice');
                }}
                className="w-full bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md shadow-accentBtn/10 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Navigate to Practice Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedResource(null)}
                className="w-full bg-transparent border border-darkBorder hover:border-slate-500/30 hover:bg-darkBg/60 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
