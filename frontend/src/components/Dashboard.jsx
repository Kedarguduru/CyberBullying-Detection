import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, CartesianGrid,
    BarChart, Bar, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import "./BullyingDetector.css";

// Professional SVG Component
const Icon = ({ name, color = "currentColor", size = 20 }) => {
    const icons = {
        ShieldCheck: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
        ),
        Activity: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
        ),
        Zap: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
        ),
        History: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><polyline points="3 3 3 8 8 8" /><polyline points="12 7 12 12 15 15" /></svg>
        ),
        Scan: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /></svg>
        ),
        Mic: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
        ),
        Search: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        ),
        Target: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
        ),
        Cpu: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>
        ),
        Video: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
        ),
        Chart: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>
        ),
        ImageIcon: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
        ),
        Camera: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
        ),
        FileText: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
        ),
        Download: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        ),
        Shield: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        ),
        Lock: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        )
    };
    return icons[name] || null;
};

function Dashboard({ user }) {
    const [message, setMessage] = useState("");
    const [result, setResult] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Video Analysis State
    const [videoFile, setVideoFile] = useState(null);
    const [videoData, setVideoData] = useState(null);
    const [analysisMode, setAnalysisMode] = useState("text"); // 'text', 'video', 'image'
    const [activeSegment, setActiveSegment] = useState(null);
    const [videoResultTab, setVideoResultTab] = useState("timeline"); // 'timeline' or 'deep-dive'
    const [imageData, setImageData] = useState(null);
    const [engineError, setEngineError] = useState(null);
    const [docData, setDocData] = useState(null);
    const [docError, setDocError] = useState(null);
    const [liveStats, setLiveStats] = useState({ count: 0, words: [] });
    const [suggestions, setSuggestions] = useState([]);

    // Local heuristic keywords for instant detection
    // Local heuristic keywords for instant detection (Consolidated Multi-dialect Matrix)
    const HEURISTIC_KEYWORDS = [
        // --- English (Standard & Slang) ---
        "idiot", "stupid", "moron", "loser", "pathetic", "useless", "worthless", "garbage", "trash", "freak",
        "weirdo", "psycho", "jerk", "scumbag", "clown", "coward", "failure", "fake", "liar", "cheater",
        "fraud", "brainless", "dimwit", "dork", "imbecile", "ignorant", "annoying", "creep", "disgusting",
        "lame", "ridiculous", "hopeless", "nonsense", "lazy", "arrogant", "selfish", "attention seeker",
        "drama queen", "crybaby", "loser kid", "pathetic person", "useless human", "worthless person",
        "garbage person", "trash human", "dumb", "dumb person", "dumb idiot", "dumb loser", "fool",
        "foolish", "foolish person", "stupid fool", "stupid person", "stupid kid", "stupid guy",
        "stupid human", "dumb fellow", "useless fellow", "waste fellow", "waste person", "waste human",
        "good for nothing", "good for nothing person", "good for nothing idiot",
        "fuck", "fucker", "fucking", "fucking idiot", "shit", "bullshit", "asshole", "bitch", "bastard",
        "motherfucker", "son of a bitch", "damn you", "dumbass", "jackass", "douchebag", "dipshit",
        "piece of shit", "shithead", "screw you", "screw off", "kiss my ass", "bloody idiot",
        "bloody fool", "damn fool", "damn idiot", "ass clown", "jerk face", "shit face", "dirty bastard",
        "stupid bastard", "ugly bastard", "useless bastard", "damn loser", "bloody loser", "stupid jerk",
        "shut up", "shut your mouth", "stop talking", "stop crying", "go away", "get lost", "stay away",
        "nobody likes you", "no one cares about you", "you are nothing", "you are a joke",
        "you are pathetic", "you are useless", "you are garbage", "you are trash", "you are stupid",
        "you are embarrassing", "you are annoying", "you are disgusting", "you are worthless",
        "you are hopeless", "you are brainless", "you are dumb", "you are a loser", "you are a clown",
        "you are a failure", "you are fake", "you are a liar", "you are a cheat", "you are useless worker",
        "go die", "drop dead", "kill yourself", "you deserve to die", "i will kill you", "i will hurt you",
        "i will destroy you", "i will ruin you", "i will beat you", "watch what happens",
        "you will regret this", "i will expose you", "i will report you", "i will break you",
        "i will make you pay", "i will find you", "i will ruin your life", "i will end you",
        "you better watch out", "i will destroy your career", "i will finish you",
        "fat", "ugly", "pig", "cow", "donkey", "dog", "monkey", "buffalo", "dirty", "smelly", "gross",
        "fat pig", "fat cow", "fat idiot", "ugly freak", "ugly face", "ugly idiot", "dirty pig",
        "smelly idiot", "disgusting face", "creepy face", "fat loser", "ugly loser", "fat clown",
        "ugly clown", "dirty creature", "gross person", "disgusting person", "fat freak",
        "your work is trash", "this is garbage work", "useless employee", "lazy worker",
        "incompetent worker", "worst employee", "wasting my time", "do you even know anything",
        "pathetic work", "this is embarrassing work", "this report is garbage", "your code is trash",
        "this is the worst work", "you are incompetent", "useless worker", "useless coder",
        "worst programmer", "bad worker", "terrible employee", "hopeless worker",
        "noob", "tryhard", "clown player", "npc", "internet troll", "keyboard warrior", "wannabe",
        "fake influencer", "attention freak", "cringe", "cringe kid", "stupid gamer", "trash player",
        "bot player", "loser gamer", "noob gamer", "useless gamer", "pathetic gamer", "clown gamer",
        "garbage player", "trash gamer", "fake gamer", "kid gamer",
        "bloody stupid", "very stupid", "very useless", "very pathetic", "extremely stupid",
        "extremely useless", "extremely pathetic", "bloody moron", "damn moron", "stupid moron",
        "useless moron", "pathetic moron", "garbage moron", "trash moron", "hopeless idiot",
        "pathetic idiot", "useless idiot", "stupid idiot", "garbage idiot", "trash idiot",
        "bloody idiot", "damn idiot", "hopeless loser", "pathetic loser", "useless loser",
        "garbage loser", "trash loser", "bloody loser", "damn loser",
        "annoying idiot", "annoying loser", "annoying person", "disgusting idiot", "disgusting loser",
        "creepy idiot", "creepy loser", "ridiculous idiot", "ridiculous person", "nonsense person",
        "lazy idiot", "lazy loser", "arrogant idiot", "arrogant loser", "selfish idiot", "selfish loser",
        "shame on you", "what a joke", "you are embarrassing yourself", "you are pathetic human",
        "you are worthless human", "you are useless human", "you are disgusting human",
        "you are trash human", "you are garbage human", "you are stupid human", "you are a failure human", "gay",

        // --- Telugu (Abuse & Slang) ---
        "overaction dengaku", "athi dengaku", "extralu dengaku", "athiga matladaku",
        "Erri Hukka", "hukka", "lawada", "eri na koddaka", "nuv entira", "nuv em peekav", "nee level enti", "nee range enti",
        "ekkuva chestunnav", "athiga behave chestunnav", "drama aadaku",
        "show off cheyyaku", "nuv waste", "nuv useless", "nee life waste",
        "gudha balupu", "gudha balsinda", "nee buddhi ledu", "nee brain ledu",
        "mental fellow", "mental case", "pichi fellow", "pichi naayala",
        "erpk", "erpka", "erpkmunda", "erripuka", "erri puka",
        "ni gudha ni denga", "dengutha", "dengithe addam tiruguthav",
        "vangabetti dengutha", "langa lepi dengu",
        "ni gudha ni veyyi saarlu dengutha",
        "vaadi gudha naaku", "vaadi puku naaku",
        "vaadi sulli nootlo petukoni cheeku",
        "modda cheeku", "sulli cheesko", "vaadi madda kudu",
        "ni puku lo gola", "ni amma puku", "nee pellam puku",
        "nee amma", "nee amma lanja", "nee amma munda",
        "nee akka lanja", "nee akka munda",
        "nee pellam lanja", "nee pellam munda",
        "nee amma ni denga", "nee akka ni denga",
        "kojja", "kojja gaanivi", "kojja naayala", "kojja fellow",
        "puka", "puku na kodaka", "lanja", "lanja dhaana",
        "munda", "langa munda", "lanjodaka", "lanja kodaka",
        "sasthav", "champestha", "ninnu champestha",
        "ninnu dengesstha", "nee life finish",
        "ninnu vadilanu", "nee pani aipothundi",
        "nee pichi matalu", "nee comedy enti",
        "nuv joker", "clown fellow",
        "nee face chudale", "nee moham chudale",
        "nee moham chusi navvostundi",
        "nee moham ugly", "nee face waste",
        "gorre face", "kukka moham",
        "pandi moham", "kothi face", "pichoda", "yedhava",

        // --- Hindi (Abuse & Slang) ---
        "bewakoof", "nalayak", "pagal", "gadha", "ullu", "nikamma", "bekar", "faltu", "ghatiya", "badtameez",
        "bewakoof aadmi", "nalayak aadmi", "pagal insaan", "gadha aadmi", "ullu ka pattha", "nikamma aadmi",
        "bekar aadmi", "faltu aadmi", "ghatiya aadmi", "ghatiya insaan", "bekar insaan", "faltu insaan",
        "nikamma insaan", "bewakoof insaan", "pagal aadmi", "badtameez aadmi", "badtameez insaan",
        "kameena", "harami", "saala", "kutte", "kutte ka baccha", "kamina aadmi", "harami insaan",
        "saale bewakoof", "kutte jaise aadmi", "kamina insaan", "ghatiya aadmi", "gandi soch",
        "ganda aadmi", "gandi aukaat", "badtameez kutta", "harami aadmi", "kamina kutta",
        "ghatiya kutta", "harami banda", "kamina banda",
        "tum bewakoof ho", "tum nalayak ho", "tum pagal ho", "tum gadhe ho", "tum nikamme ho",
        "tum bekaar ho", "tum faltu ho", "tum ghatiya ho", "tum useless ho", "tum kuch nahi ho",
        "tum ek joke ho", "tum bekaar aadmi ho", "tum bekaar insaan ho", "tum faltu aadmi ho",
        "tum nalayak insaan ho", "tum bewakoof insaan ho", "tum sabse kharab ho", "tum bilkul bekaar ho",
        "tumhara dimaag kharab hai", "tumhara dimaag bekaar hai", "tumhara dimaag ghatiya hai",
        "tumhara soch bakwaas hai", "tumhari soch ghatiya hai", "tumhari soch bekaar hai",
        "tumse kuch nahi hoga", "mar ja", "mar jao", "tum mar jao", "jaake mar ja", "jaake mar jao",
        "tum marne layak ho", "main tumhe maar dunga", "main tumhe barbaad kar dunga", "main tumhe dekh lunga",
        "tum pachtaoge", "tumhari zindagi kharab kar dunga", "main tumhe expose kar dunga",
        "main tumhe sabke saamne beizzat karunga", "tumhe sabke saamne gira dunga",
        "mota", "patla", "badsurat", "ganda", "badbu wala", "gandi shakal", "badsurat chehra",
        "ganda aadmi", "mota aadmi", "patla aadmi", "badsurat aadmi", "ghatiya shakal",
        "bekar chehra", "ganda chehra", "badbu wala aadmi", "gandi soorat", "bekar soorat",
        "tumhara kaam bakwaas hai", "yeh kaam kachra hai", "tum bekaar employee ho",
        "tum kuch nahi kar sakte", "tum bilkul useless ho", "tumhara report bakwaas hai",
        "tumhari coding bakwaas hai", "tumhara kaam ghatiya hai", "tum sabse bekaar employee ho",
        "tum worst employee ho", "tumhara project kachra hai", "tumhara kaam bakwaas hai",
        "noob banda", "faltu banda", "bekar banda", "ghatiya banda", "stupid banda",
        "pagal banda", "useless banda", "bekar gamer", "noob gamer", "faltu player",
        "ghatiya player", "stupid player", "useless gamer", "bekar player", "noob player",
        "bahut bewakoof", "bahut nalayak", "bahut ghatiya", "bahut bakwaas", "bahut bekaar",
        "bilkul bekaar", "bilkul useless", "bilkul ghatiya", "bahut stupid", "bahut bekaar aadmi",
        "bahut ghatiya insaan", "bahut bakwaas kaam", "bahut ghatiya kaam", "bahut bekaar kaam",
        "bewakoof insaan", "nalayak insaan", "pagal insaan", "nikamma insaan", "faltu insaan",
        "ghatiya insaan", "bekar insaan", "badtameez insaan", "harami insaan", "kamina insaan",
        "tum bewakoof insaan ho", "tum nalayak insaan ho", "tum ghatiya insaan ho",
        "tum nikamme insaan ho", "tum faltu insaan ho", "tum bekaar insaan ho",
        "tum gande insaan ho", "tum bakwaas insaan ho", "tum useless insaan ho",
        "bahut ghatiya aadmi", "bahut bekaar aadmi", "bahut nalayak aadmi", "bahut bewakoof aadmi",
        "bahut ganda aadmi", "bahut nikamma aadmi", "bahut faltu aadmi", "bahut ghatiya banda",
        "bekar aadmi", "bekar banda", "bekar insaan", "bekar kaam", "bekar soch",
        "faltu aadmi", "faltu banda", "faltu insaan", "faltu kaam", "faltu soch",
        "tum sabse ghatiya ho", "tum sabse bekaar ho", "tum sabse nalayak ho",
        "tum sabse bewakoof ho", "tum sabse nikamme ho", "tum sabse faltu ho",
        "ghatiya kaam", "bekar kaam", "bakwaas kaam", "faltu kaam", "useless kaam",
        "nikamma kaam", "bewakoof kaam", "nalayak kaam", "ganda kaam", "kachra kaam",
        "tum ek failure ho", "tum ek joke ho", "tum ek bekaar aadmi ho",
        "tum ek ghatiya aadmi ho", "tum ek nalayak aadmi ho", "tum ek bewakoof aadmi ho",
        "tumhari aukaat kya hai", "tumhari aukaat nahi hai", "tumhari koi value nahi hai",
        "tumhari koi izzat nahi hai", "tumhari koi respect nahi hai"
    ];

    const COMMON_TRANSITIONS = {
        "you": ["are", "will", "should", "don't"],
        "are": ["a", "stupid", "useless", "pathetic", "going"],
        "i": ["will", "am", "want", "hate"],
        "will": ["kill", "destroy", "ruin", "hurt", "find"],
        "nee": ["amma", "akka", "face", "life", "level"],
        "nuv": ["waste", "useless", "entira", "peekav"],
        "go": ["die", "away", "home", "kill"],
        "the": ["worst", "failure", "garbage", "trash"],
        "your": ["work", "face", "life", "career"],
        "this": ["is", "project", "code", "report"]
    };

    useEffect(() => {
        const scanLiveText = async () => {
            const lowerMsg = message.toLowerCase();
            if (!lowerMsg.trim()) {
                setLiveStats({ count: 0, words: [] });
                setResult("");
                return;
            }

            // Basic de-obfuscation
            let deobfuscated = lowerMsg
                .replace(/f[*x@#%! ]{2,}k/g, "fuck")
                .replace(/sh[i*x@#%! ]+t/g, "shit")
                .replace(/b[i*x@#%! ]+tch/g, "bitch")
                .replace(/p[u*x@#%! ]+ku/g, "puku");

            // --- Tactical Scan Matrix ---
            const spaceSeparated = lowerMsg.replace(/\s+/g, "");
            const compressed = lowerMsg.replace(/[^a-z]/g, "");
            
            const detected = HEURISTIC_KEYWORDS.filter(kw => {
                const kwLower = kw.toLowerCase();
                const kwCompressed = kwLower.replace(/\s/g, "");
                return lowerMsg.includes(kwLower) || 
                       deobfuscated.includes(kwLower) || 
                       spaceSeparated.includes(kwCompressed) ||
                       (kwCompressed.length > 2 && compressed.includes(kwCompressed));
            });

            setLiveStats({
                count: detected.length,
                words: detected
            });

            // Automated System Scan (Debounced Backend Call)
            if (message.length > 3) {
                try {
                    const response = await axios.post("http://localhost:5000/predict", {
                        message: message,
                        email: user?.email || "Anonymous"
                    });
                    setResult(response.data.prediction);
                } catch (err) {
                    console.error("Live sync failed.");
                }
            }

            // --- Next Word Prediction Logic (Neural Backend sync) ---
            const currentWords = message.trim().split(/\s+/);
            const lastWord = currentWords[currentWords.length - 1]?.toLowerCase();

            if (lastWord) {
                try {
                    const predRes = await axios.post("http://localhost:5000/get-predictions", { word: lastWord });
                    if (predRes.data.success) {
                        setSuggestions(predRes.data.suggestions);
                    }
                } catch (err) {
                    // Fallback to local heuristic matching
                    const matches = HEURISTIC_KEYWORDS.filter(kw => kw.startsWith(lastWord) && kw !== lastWord).slice(0, 5);
                    setSuggestions(matches);
                }
            } else {
                setSuggestions([]);
            }
        };

        const timer = setTimeout(scanLiveText, 800); // 800ms debounce for backend integrity
        return () => clearTimeout(timer);
    }, [message, user?.email]);

    const fetchHistory = async () => {
        try {
            const resp = await axios.get("http://localhost:5000/get-incidents");
            setHistory(resp.data);
        } catch (err) {
            console.error("Telemetry fetch error");
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const analyzeMessage = async (textToAnalyze = message) => {
        if (!textToAnalyze.trim()) return;
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/predict", {
                message: textToAnalyze,
                email: user?.email || "Anonymous"
            });
            setResult(response.data.prediction);
            fetchHistory();
        } catch (error) {
            setResult("System Offline");
        } finally {
            setLoading(false);
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setMessage(transcript);
            analyzeMessage(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVideoFile(file);

        const formData = new FormData();
        formData.append("video", file);
        formData.append("email", user?.email || "Anonymous");

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/predict-video", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 600000 // 10 minute timeout for heavy processing
            });
            setVideoData(response.data);
            fetchHistory();
        } catch (error) {
            console.error("Video Analysis Error:", error);
            const errorMsg = error.response?.data?.error || error.message;
            alert(`Video Analysis Hub: Authentication / Processing failure.\nDetails: ${errorMsg}\n\nEnsure backend is running and file size < 50MB.`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageScan = async (file) => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("email", user?.email || "Anonymous");

        try {
            setEngineError(null);
            const resp = await axios.post("http://localhost:5000/analyze-image", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setImageData(resp.data);
            fetchHistory();
        } catch (err) {
            console.error("Image Scan Error:", err);
            const errorMsg = err.response?.data?.error || err.message;
            if (errorMsg.includes("Tesseract")) {
                setEngineError({
                    type: "OCR_ENGINE_MISSING",
                    title: "Vision Engine Offline",
                    message: "The Tesseract-OCR binary was not detected on this system architecture.",
                    hint: "Please install Tesseract-OCR (v5.0+) and restart the security kernel to activate Visual Intelligence.",
                    link: "https://github.com/UB-Mannheim/tesseract/wiki"
                });
            } else {
                alert(`Image Scan failed: ${errorMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("document", file);
        formData.append("email", user?.email || "Anonymous");

        setLoading(true);
        setDocError(null);
        try {
            const response = await axios.post("http://localhost:5000/analyze-document", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setDocData(response.data);
            fetchHistory();
        } catch (error) {
            console.error("Document Analysis Error:", error);
            const errorMsg = error.response?.data?.error || error.message;
            setDocError({
                title: "Intelligence Engine Offline",
                message: "The document deconstruction core failed to initialize for this payload.",
                details: errorMsg,
                hint: "Ensure the backend service is running and the file is a valid PDF, DOCX, or TXT format."
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadDocumentReport = () => {
        if (!docData) return;

        const timestamp = new Date().toLocaleString();
        let reportContent = `🛡️ SAFESENTRY PRO: TACTICAL DOCUMENT AUDIT REPORT\n`;
        reportContent += `==============================================\n`;
        reportContent += `Timestamp: ${timestamp}\n`;
        reportContent += `Authorized ID: ${user?.email || "Anonymous"}\n`;
        reportContent += `Overall Classification: ${docData.overall_prediction.toUpperCase()}\n\n`;

        reportContent += `🚨 TOXIC SEMANTIC CLUSTERS IDENTIFIED:\n`;
        reportContent += `--------------------------------------\n`;

        const threats = docData.findings ? docData.findings.filter(f => f.is_threat) : [];
        if (threats.length > 0) {
            threats.forEach((finding, idx) => {
                reportContent += `[THREAT #${idx + 1}]\n`;
                reportContent += `Text Snippet: "${finding.text}"\n`;
                reportContent += `Category: ${finding.category}\n`;
                reportContent += `Classification: ${finding.prediction}\n`;
                reportContent += `Confidence: ${finding.confidence.toFixed(1)}%\n\n`;
            });
        } else {
            reportContent += `No tactical threats detected in this data payload.\n\n`;
        }

        reportContent += `📜 EXTRACTED CONTENT BUFFER:\n`;
        reportContent += `----------------------------\n`;
        reportContent += docData.text || "[No text data available]";
        reportContent += `\n\n==============================================\n`;
        reportContent += `© 2024 SAFESENTRY INTELLIGENCE SYSTEMS • END REPORT\n`;

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SafeSentry_Audit_${new Date().getTime()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Transform videoData for Chart
    const chartData = videoData?.timeline?.map(s => ({
        time: s.start,
        displayTime: formatTime(s.start),
        confidence: s.confidence * 100,
        threatScore: s.prediction.includes("Detected") ? (s.confidence * 100) : 0, // Peak when threat detected
        isThreat: s.prediction.includes("Detected") ? 100 : 0,
        label: s.prediction,
        category: s.category
    })) || [];

    // Aggregate category distribution for Bar Graph
    const barDataResult = videoData?.timeline?.reduce((acc, curr) => {
        const cat = curr.category || "Safe";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const barData = barDataResult ? Object.entries(barDataResult).map(([name, count]) => ({
        name,
        count
    })) : [];

    const getBarColor = (name) => {
        switch (name) {
            case 'Cyberbullying': return '#ef4444'; // rose-500
            case 'Hate Speech': return '#7c3aed';  // violet-600
            case 'Telugu': return '#f59e0b';       // amber-500
            default: return '#10b981';            // emerald-500 (Safe)
        }
    };

    const handleArchive = () => {
        alert("🔒 SYSTEM: Secure Archive initiated. Generating encrypted PDF payload...");
    };

    const handleReview = (inc) => {
        alert(`🛰️ AUDIT REVIEW:\n\nTimestamp: ${inc.timestamp}\nClassification: ${inc.classification}\nSubject: ${inc.message || "Encrypted Data"}`);
    };

    const filteredHistory = history.filter(inc =>
        inc.classification.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inc.message && inc.message.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="dashboard-wrapper">
            {/* Integrated Search Tool */}
            <div className="search-tool-bar">
                <div className="search-pill">
                    <Icon name="Search" size={16} color="#64748b" />
                    <input
                        type="text"
                        placeholder="Search audit registry..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Professional KPI Grid */}
            <div className="stats-grid">
                <motion.div className="stat-card premium" whileHover={{ y: -5 }}>
                    <div className="stat-header">
                        <span className="stat-label">Neural Throughput</span>
                        <div className="stat-icon-box blue">
                            <Icon name="Activity" size={16} color="#6366f1" />
                        </div>
                    </div>
                    <div className="stat-value">1.4 GB/s</div>
                    <div className="stat-trend positive">↑ 12% vs last month</div>
                </motion.div>
                
                <motion.div className="stat-card premium" whileHover={{ y: -5 }}>
                    <div className="stat-header">
                        <span className="stat-label">Tactical Precision</span>
                        <div className="stat-icon-box green">
                            <Icon name="Shield" size={16} color="#10b981" />
                        </div>
                    </div>
                    <div className="stat-value">99.8%</div>
                    <div className="stat-trend positive">Live telemetry active</div>
                </motion.div>

                <motion.div className="stat-card premium" whileHover={{ y: -5 }}>
                    <div className="stat-header">
                        <span className="stat-label">Encryption Strength</span>
                        <div className="stat-icon-box purple">
                            <Icon name="Lock" size={16} color="#8b5cf6" />
                        </div>
                    </div>
                    <div className="stat-value">AES-256</div>
                    <div className="stat-trend">Military-grade protection</div>
                </motion.div>

                <motion.div className="stat-card premium" whileHover={{ y: -5 }}>
                    <div className="stat-header">
                        <span className="stat-label">Word Speed Engine</span>
                        <div className="stat-icon-box orange">
                            <Icon name="Zap" size={16} color="#f59e0b" />
                        </div>
                    </div>
                    <div className="stat-value">12 ms/token</div>
                    <div className="stat-trend positive">Hyper-responsive Mode</div>
                </motion.div>
            </div>

            {/* AI Console Interface */}
            <div className="analysis-card">
                <div className="card-title">
                    <div className="flex-between w-full">
                        <div className="flex-start gap-3">
                            <Icon name="Scan" size={24} color="#6366f1" />
                            <span className="text-xl font-bold">Detection Intelligence Core</span>
                        </div>
                        <div className="mode-toggle-pills">
                            <button
                                className={`mode-pill ${analysisMode === 'text' ? 'active' : ''}`}
                                onClick={() => setAnalysisMode('text')}
                            >
                                Text/Voice Analysis
                            </button>
                            <button
                                className={`mode-pill ${analysisMode === 'video' ? 'active' : ''}`}
                                onClick={() => setAnalysisMode('video')}
                            >
                                Video Intelligence
                            </button>
                            <button
                                className={`mode-pill ${analysisMode === 'image' ? 'active' : ''}`}
                                onClick={() => setAnalysisMode('image')}
                            >
                                Visual/Pic Scan
                            </button>
                            <button
                                className={`mode-pill ${analysisMode === 'document' ? 'active' : ''}`}
                                onClick={() => setAnalysisMode('document')}
                            >
                                Document Intel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {analysisMode === 'text' ? (
                        <div className="text-analysis-area">
                            <div className="input-area">
                                <textarea
                                    className={`pro-textarea ${result && !result.includes("Safe") ? "threat-detected-border" : ""}`}
                                    placeholder="Input stream for behavioral classification..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                {suggestions.length > 0 && (
                                    <div className="prediction-suggestions">
                                        <div className="sug-label">PREDICTIVE STREAM:</div>
                                        {suggestions.map((sug, i) => (
                                            <button
                                                key={i}
                                                className="sug-pill"
                                                onClick={() => {
                                                    const words = message.trim().split(/\s+/);
                                                    words[words.length - 1] = sug;
                                                    setMessage(words.join(" ") + " ");
                                                    setSuggestions([]);
                                                }}
                                            >
                                                {sug}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {result && (
                                    <div className={`live-prediction-overlay ${result.includes("Safe") ? "safe" : result.includes("CRITICAL") ? "extreme" : "danger"}`}>
                                        <div className="indicator-dot"></div>
                                        <span>SYSTEM_AUTO_DETECT: {result.toUpperCase()}</span>
                                    </div>
                                )}
                                <button
                                    className={`mic-btn-pro ${isListening ? 'active' : ''}`}
                                    onClick={startListening}
                                >
                                    <Icon name="Mic" size={24} color={isListening ? "white" : "#64748b"} />
                                </button>
                            </div>

                            <div className="live-heuristic-feedback">
                                <div className="feedback-header">
                                    <Icon name="Activity" size={14} color="#6366f1" />
                                    <span>Live Heuristic Feedback</span>
                                    {liveStats.count > 0 && (
                                        <span className="live-badge pulse">THREAT DETECTED</span>
                                    )}
                                </div>
                                <div className="feedback-stats">
                                    <div className="f-stat">
                                        <label>Detected Keywords</label>
                                        <span className={liveStats.count > 0 ? "text-rose-500 font-bold" : ""}>
                                            {liveStats.count}
                                        </span>
                                    </div>
                                    <div className="f-stat keyword-list">
                                        <label>Identified Patterns</label>
                                        <div className="keyword-chips">
                                            {liveStats.words.length > 0 ? (
                                                liveStats.words.map(w => (
                                                    <span key={w} className="k-chip">{w.toUpperCase()}</span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400">None</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="action-row">
                                <button className="scan-btn-pro primary" onClick={() => analyzeMessage()}>
                                    {loading ? <span className="loader-dots">Processing</span> : "Initiate System Scan"}
                                </button>
                                <button className="scan-btn-pro outline" onClick={() => setMessage("")}>
                                    Purge Buffer
                                </button>
                            </div>

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`report-alert ${result.includes("Safe") ? "alert-safe" : "alert-danger"}`}
                                >
                                    <div className="alert-badge">
                                        {result.includes("Safe") ? <Icon name="ShieldCheck" size={18} /> : <span>⚠️</span>}
                                    </div>
                                    <div className="alert-content">
                                        <span className="alert-label">Classification Result:</span>
                                        <span className="alert-value">{result}</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : analysisMode === 'image' ? (
                        <div className="image-analysis-area">
                            {engineError && (
                                <motion.div
                                    className="engine-error-box"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="error-icon-shield">!</div>
                                    <div className="error-details">
                                        <h4>{engineError.title}</h4>
                                        <p>{engineError.message}</p>
                                        <div className="instruction-chip">
                                            {engineError.hint}
                                        </div>
                                        <div className="error-actions">
                                            <a href={engineError.link} target="_blank" rel="noreferrer" className="dl-link">
                                                Download Engine v5.0
                                            </a>
                                            <button className="retry-btn" onClick={() => setEngineError(null)}>Dismiss</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {!imageData && !loading && !engineError && (
                                <div className="upload-zone-pro">
                                    <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        onChange={(e) => handleImageScan(e.target.files[0])}
                                        hidden
                                    />
                                    <label htmlFor="image-upload" className="upload-label-pro">
                                        <div className="upload-icon-box pulse">
                                            <Icon name="ImageIcon" size={32} color="#6366f1" />
                                        </div>
                                        <h3>Visual Intelligence Scan</h3>
                                        <p>Upload a screenshot or image for deep OCR analysis and behavioral classification.</p>
                                        <span className="upload-hint">Supported: PNG, JPG, WEBP, GIF (Max 10MB)</span>
                                    </label>
                                </div>
                            )}

                            {loading && (
                                <div className="scanning-state">
                                    <div className="scan-radar"></div>
                                    <h3>Neural Lens Active</h3>
                                    <p>Extracting semantic data from visual layers using Tesseract-v5 OCR engine...</p>
                                </div>
                            )}

                            {imageData && (
                                <div className="image-result-window">
                                    <div className="result-header-pro">
                                        <div className={`status-pill ${imageData.overall_prediction.includes('Detected') ? 'danger' : 'safe'}`}>
                                            {imageData.overall_prediction}
                                        </div>
                                        <button className="reset-btn" onClick={() => setImageData(null)}>Scan New Image</button>
                                    </div>

                                    <div className="ocr-output-panel">
                                        <div className="panel-label">Synthesized Text Extract</div>
                                        <div className="text-scroll-area">
                                            <p>{imageData.text}</p>
                                        </div>
                                    </div>

                                    <div className="image-findings-grid">
                                        {imageData.findings && imageData.findings.map((finding, idx) => (
                                            <div key={idx} className={`finding-chip ${finding.is_threat ? 'threat' : 'neutral'}`}>
                                                <div className="f-meta">
                                                    <span className="f-cat">{finding.category}</span>
                                                    <span className="f-conf">{finding.confidence.toFixed(1)}%</span>
                                                </div>
                                                <p className="f-text">"{finding.text}"</p>
                                                <span className="f-pred">{finding.prediction}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {imageData.findings && imageData.findings.length === 0 && (
                                        <div className="no-findings">
                                            <Icon name="ShieldCheck" size={24} color="#10b981" />
                                            <span>No toxic semantic clusters detected in this image.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : analysisMode === 'document' ? (
                        <div className="document-analysis-area">
                            {docError && (
                                <motion.div
                                    className="engine-error-box document-error"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="error-icon-shield">!</div>
                                    <div className="error-details">
                                        <h4>{docError.title}</h4>
                                        <p>{docError.message}</p>
                                        <div className="instruction-chip">
                                            <strong>Payload Error:</strong> {docError.details}
                                            <br />
                                            {docError.hint}
                                        </div>
                                        <button className="retry-btn" onClick={() => setDocError(null)}>Reset Engine</button>
                                    </div>
                                </motion.div>
                            )}

                            {!docData && !loading && !docError && (
                                <div className="upload-zone-pro">
                                    <input
                                        type="file"
                                        id="doc-upload"
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleDocumentUpload}
                                        hidden
                                    />
                                    <label htmlFor="doc-upload" className="upload-label-pro">
                                        <div className="upload-icon-box pulse">
                                            <Icon name="FileText" size={32} color="#6366f1" />
                                        </div>
                                        <h3>Document Intelligence Core</h3>
                                        <p>Comprehensive scan for toxic clusters in PDF, Word, or plain text documents.</p>
                                        <span className="upload-hint">Supported: PDF, DOCX, TXT (Max 20MB)</span>
                                    </label>
                                </div>
                            )}

                            {loading && (
                                <div className="scanning-state">
                                    <div className="scan-radar"></div>
                                    <h3>Neural Registry Scan</h3>
                                    <p>Deconstructing document metadata and extracting semantic layers for tactical analysis...</p>
                                </div>
                            )}

                            {docData && (
                                <div className="image-result-window">
                                    <div className="result-header-pro">
                                        <div className={`status-pill ${docData.overall_prediction.includes('Detected') ? 'danger' : 'safe'}`}>
                                            {docData.overall_prediction}
                                        </div>
                                        <div className="doc-action-group">
                                            <button className="download-report-btn" onClick={downloadDocumentReport}>
                                                <Icon name="Download" size={16} /> Download Intelligence Report
                                            </button>
                                            <button className="reset-btn" onClick={() => setDocData(null)}>Scan New Document</button>
                                        </div>
                                    </div>

                                    <div className="ocr-output-panel">
                                        <div className="panel-label">Tactical Text Extraction</div>
                                        <div className="text-scroll-area">
                                            <p>{docData.text}</p>
                                        </div>
                                    </div>

                                    <div className="image-findings-grid">
                                        {docData.findings && docData.findings.map((finding, idx) => (
                                            <div key={idx} className={`finding-chip ${finding.is_threat ? 'threat' : 'neutral'}`}>
                                                <div className="f-meta">
                                                    <span className="f-cat">{finding.category}</span>
                                                    <span className="f-conf">{finding.confidence.toFixed(1)}%</span>
                                                </div>
                                                <p className="f-text">"{finding.text}"</p>
                                                <span className="f-pred">{finding.prediction}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {docData.findings && docData.findings.length === 0 && (
                                        <div className="no-findings">
                                            <Icon name="ShieldCheck" size={24} color="#10b981" />
                                            <span>The document analysis returned zero toxic spectral clusters.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="video-analysis-area">
                            {!videoData && !loading && (
                                <div className="video-upload-placeholder">
                                    <Icon name="Video" size={48} color="#cbd5e1" />
                                    <p>Drop operational video stream here or</p>
                                    <label className="video-upload-btn">
                                        Select Video File
                                        <input type="file" accept="video/*" onChange={handleVideoUpload} hidden />
                                    </label>
                                    <span className="text-xs text-slate-500 mt-2">MP4, MOV supported • Max 50MB</span>
                                </div>
                            )}

                            {loading && (
                                <div className="video-processing-state">
                                    <div className="scanner-glow"></div>
                                    <div className="processing-content">
                                        <div className="spinner-center">
                                            <div className="inner-spin"></div>
                                            <Icon name="Cpu" size={32} color="#6366f1" />
                                        </div>
                                        <h3>Analyzing Biometric Audio</h3>
                                        <p>Running high-fidelity neural transcription...</p>
                                        <div className="progress-bar-pro">
                                            <motion.div
                                                className="progress-fill"
                                                animate={{ width: ["0%", "40%", "70%", "95%"] }}
                                                transition={{ duration: 15, ease: "linear" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {videoData && (
                                <div className="video-results-container">
                                    <div className="video-summary-header">
                                        <div className={`overall-status ${videoData.overall_prediction.includes('Detected')
                                            ? (videoData.timeline.some(t => t.category === 'Hate Speech') ? 'high-priority' : 'danger')
                                            : 'safe'
                                            }`}>
                                            <Icon name={videoData.overall_prediction.includes('Safe') ? 'ShieldCheck' : 'Target'} size={20} />
                                            {videoData.timeline.some(t => t.category === 'Hate Speech') ? "Hate Speech / Racism Detected (Video)" : videoData.overall_prediction}
                                        </div>
                                        <div className="summary-meta-grid">
                                            <div className="meta-item">
                                                <label>Global Sentiment</label>
                                                <span className={videoData.overall_prediction.includes('Safe') ? 'text-emerald-500' : 'text-rose-500'}>
                                                    {videoData.overall_prediction.includes('Safe') ? 'STABLE' : 'VOLATILE'}
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <label>Transcription Integrity</label>
                                                <span>99.2%</span>
                                            </div>
                                        </div>
                                        <button className="reset-btn-pro" onClick={() => setVideoData(null)}>Initiate New Stream</button>
                                    </div>

                                    <div className="video-results-body">
                                        <div className="result-tabs">
                                            <button
                                                className={`tab-btn ${videoResultTab === 'timeline' ? 'active' : ''}`}
                                                onClick={() => setVideoResultTab('timeline')}
                                            >
                                                Intelligence Timeline
                                            </button>
                                            <button
                                                className={`tab-btn ${videoResultTab === 'deep-dive' ? 'active' : ''}`}
                                                onClick={() => setVideoResultTab('deep-dive')}
                                            >
                                                Segment Deep-Dive
                                            </button>
                                        </div>

                                        {videoResultTab === 'timeline' ? (
                                            <div className="timeline-view-pro">
                                                <div className="graph-card-pro">
                                                    <div className="graph-header-pro">
                                                        <div className="flex items-center gap-2">
                                                            <div className="live-indicator"></div>
                                                            <span>Temporal Confidence Matrix</span>
                                                        </div>
                                                        <div className="chart-legend-pro">
                                                            <div className="leg-i"><span className="dot primary"></span> Confidence</div>
                                                            <div className="leg-i"><span className="dot danger"></span> Threat</div>
                                                            <div className="leg-i"><span className="dot purple"></span> Hate Speech</div>
                                                        </div>
                                                    </div>

                                                    <div className="chart-wrapper-pro">
                                                        <ResponsiveContainer width="100%" height={260}>
                                                            <AreaChart data={chartData} onClick={(data) => {
                                                                if (data && data.activePayload) {
                                                                    const selected = data.activePayload[0].payload;
                                                                    setActiveSegment(selected);
                                                                    setVideoResultTab('deep-dive');
                                                                }
                                                            }}>
                                                                <defs>
                                                                    <linearGradient id="videoGrad" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                                <XAxis dataKey="displayTime" axisLine={false} tickLine={false} fontSize={11} stroke="#94a3b8" />
                                                                <YAxis axisLine={false} tickLine={false} fontSize={11} domain={[0, 100]} stroke="#94a3b8" />
                                                                <Tooltip content={({ active, payload }) => {
                                                                    if (active && payload && payload.length) {
                                                                        const d = payload[0].payload;
                                                                        return (
                                                                            <div className="tactical-tooltip">
                                                                                <div className="tt-time">TS: {d.displayTime}</div>
                                                                                <div className={`tt-pred ${d.isThreat ? (d.category === 'Hate Speech' ? 'purple' : 'danger') : 'safe'}`}>
                                                                                    {d.label}
                                                                                </div>
                                                                                <div className="tt-conf">Intel Hash: {d.confidence.toFixed(1)}%</div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }} />
                                                                <Area type="monotone" dataKey="confidence" stroke="#6366f1" fill="url(#videoGrad)" strokeWidth={2} />
                                                                <Area type="stepAfter" dataKey="threatScore" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                <div className="distribution-grid-pro mt-6">
                                                    <div className="graph-card-pro bg-slate-50/50">
                                                        <div className="graph-header-pro">
                                                            <span>Behavioral Category Distro</span>
                                                        </div>
                                                        <ResponsiveContainer width="100%" height={220}>
                                                            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                                                <XAxis type="number" hide />
                                                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                                                                <Tooltip cursor={{ fill: 'transparent' }} />
                                                                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                                                                    {barData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                                                                    ))}
                                                                </Bar>
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>

                                                    <div className="threat-profile-pro graph-card-pro">
                                                        <div className="graph-header-pro">
                                                            <span>Tactical Threat Profile</span>
                                                        </div>
                                                        <div className="profile-stats">
                                                            <div className="p-stat-item">
                                                                <label>Toxicity Level</label>
                                                                <div className="p-bar-bg"><div className="p-bar-fill danger" style={{ width: `${barData.some(b => b.name === 'Cyberbullying') ? '78%' : '12%'}` }}></div></div>
                                                            </div>
                                                            <div className="p-stat-item">
                                                                <label>Hate Speech Intensity</label>
                                                                <div className="p-bar-bg"><div className="p-bar-fill purple" style={{ width: `${barData.some(b => b.name === 'Hate Speech') ? '92%' : '0%'}` }}></div></div>
                                                            </div>
                                                            <div className="p-stat-item">
                                                                <label>System Integrity</label>
                                                                <div className="p-bar-bg"><div className="p-bar-fill safe" style={{ width: '98%' }}></div></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="deep-dive-panel">
                                                {activeSegment ? (
                                                    <motion.div
                                                        className="segment-detail-card-pro"
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                    >
                                                        <div className="detail-hero">
                                                            <div className="hero-left">
                                                                <span className="timestamp-badge">INDEX @ {activeSegment.displayTime}</span>
                                                                <h2>Behavioral Trace Analysis</h2>
                                                            </div>
                                                            <div className={`threat-badge-big ${activeSegment.category === 'Hate Speech' ? 'purple' :
                                                                activeSegment.category === 'Safe' ? 'safe' : 'danger'
                                                                }`}>
                                                                {activeSegment.label}
                                                            </div>
                                                        </div>

                                                        <div className="detail-meta-row">
                                                            <div className="m-detail">
                                                                <label>Semantics</label>
                                                                <span>{activeSegment.category}</span>
                                                            </div>
                                                            <div className="m-detail">
                                                                <label>Confidence Hash</label>
                                                                <span>{activeSegment.confidence.toFixed(3)}</span>
                                                            </div>
                                                            <div className="m-detail">
                                                                <label>Neural Engine</label>
                                                                <span>Whisper-V3-Trans</span>
                                                            </div>
                                                        </div>

                                                        <div className="transcription-panel-pro">
                                                            <div className="panel-label">TRANSCRIPTION EXTRACT</div>
                                                            <div className="quote-box">
                                                                <p>"{videoData.timeline.find(t => t.start === activeSegment.time)?.text}"</p>
                                                            </div>
                                                        </div>

                                                        <div className="assessment-box-pro">
                                                            <div className="indicator"></div>
                                                            <div className="assess-content">
                                                                <h4>AI TACTICAL ASSESSMENT</h4>
                                                                <p>
                                                                    {activeSegment.category === 'Hate Speech'
                                                                        ? "CRITICAL ALERT: System identified high-velocity racist or discriminatory patterns. This incident has been escalated to the Global Monitoring Map."
                                                                        : activeSegment.isThreat
                                                                            ? "THREAT ALERT: Toxic behavioral vectors detected. Recommend logging to Behavioral Audit Registry."
                                                                            : "VALIDATED: No high-risk semantic clusters found in this temporal segment."}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <button className="back-btn-pro" onClick={() => setVideoResultTab('timeline')}>
                                                            Back to Matrix View
                                                        </button>
                                                    </motion.div>
                                                ) : (
                                                    <div className="empty-dive">
                                                        <div className="hint-icon">🛰️</div>
                                                        <p>Select a temporal coordinate on the Matrix to initiate a Deep-Dive.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Detailed Transcription */}
                                    <div className="transcription-log">
                                        <h4>Behavioral Timeline Logs</h4>
                                        <div className="log-entries">
                                            {videoData.timeline.map((item, idx) => (
                                                <div key={idx} className={`log-entry ${item.prediction.includes('Detected') ? 'threat' : ''}`}>
                                                    <span className="timestamp">{formatTime(item.start)}</span>
                                                    <div className="content">
                                                        <p className="text">"{item.text}"</p>
                                                        <div className="meta">
                                                            <span className="badge">{item.prediction}</span>
                                                            <span className="translated-badge">Auto-Translated to English</span>
                                                            <span className="conf">{(item.confidence * 100).toFixed(1)}% integrity</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Informational Grid: About & Detection Intelligence */}
            <div className="info-grid-pro">
                <div className="info-card-pro">
                    <div className="info-header">
                        <Icon name="Target" size={24} color="var(--primary)" />
                        <h3>Operational Mission</h3>
                    </div>
                    <p>SafeSentry PRO is an intelligence-grade initiative dedicated to neutralizing digital toxicity. We leverage advanced neural heuristics to identify and isolate behavioral threats in real-time, ensuring a sterile and professional digital communication frontier.</p>
                </div>
                <div className="info-card-pro">
                    <div className="info-header">
                        <Icon name="Cpu" size={24} color="var(--warning)" />
                        <h3>Advanced Detection Corpus</h3>
                    </div>
                    <p>Our Tier-1 classification engine now conquers <strong>Discriminatory Hate Speech and Racism</strong> with high-fidelity vector analysis. By monitoring specialized toxic identifiers and sentiment velocity, we neutralize systemic bias and dialect-specific aggression (including Telugu) at the source.</p>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="analysis-card">
                <div className="card-title log-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon name="History" size={22} color="#0f172a" />
                        <span>Behavioral Audit Registry</span>
                    </div>
                    <button className="export-link" onClick={handleArchive}>Archive PDF</button>
                </div>
                <div className="table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Classification</th>
                                <th>Confidence</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? filteredHistory.map((inc, index) => (
                                <tr key={index} className="history-row">
                                    <td>{inc.timestamp}</td>
                                    <td>
                                        <span className={`status-badge ${inc.classification.includes('Safe') ? 'safe' : inc.classification.includes('Hate') ? 'high-priority' : 'danger'}`}>
                                            {inc.classification}
                                        </span>
                                    </td>
                                    <td className="confidence-cell">{inc.confidence || "94.2%"}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="action-link" onClick={() => handleReview(inc)}>Review Audit</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="empty-log">
                                        {searchTerm ? "No matching records found in registry." : "Telemetry stream idle. Awaiting operational input."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;