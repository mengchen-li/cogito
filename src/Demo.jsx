import { useState, useEffect, useRef } from "react";
import { Logo } from "./App";

// =============================================================================
// API (Anthropic Claude)
// =============================================================================
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

function getApiKey() { try { return localStorage.getItem("cogito_api_key") || ""; } catch { return ""; } }
function setApiKeyStore(k) { try { localStorage.setItem("cogito_api_key", k); } catch {} }

async function askAI(sys, msgs) {
  const key = getApiKey();
  if (!key) return "Please set your API key first (click the gear icon in the top right).";
  try {
    const r = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 800, system: sys, messages: msgs }),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      if (r.status === 401) return "Invalid API key. Please check your key in settings.";
      return `API error: ${err.error?.message || r.statusText}`;
    }
    const d = await r.json();
    return d.content?.[0]?.text || "Couldn't generate a response.";
  } catch (e) { return "AI unavailable: " + e.message; }
}

// =============================================================================
// DATA
// =============================================================================
const CURRIC = [
  { mod: "Module 1 \u00B7 Foundations", wk: "Weeks 1\u20133", ls: [
    { t: "Variables & Data Types", s: "done", d: "Numbers, strings, booleans \u2014 how Python stores information" },
    { t: "Operators & Expressions", s: "done", d: "Math, comparison, and logical operations" },
    { t: "Lists, Tuples & Strings", s: "done", d: "Ordered collections and text manipulation" },
  ]},
  { mod: "Module 2 \u00B7 Control Flow", wk: "Weeks 4\u20136", ls: [
    { t: "For Loops", s: "cur", d: "Iterating over collections with for...in" },
    { t: "While Loops & Loop Control", s: "lock", d: "Conditional repetition, break, continue" },
    { t: "Conditionals & Branching", s: "lock", d: "if / elif / else decision trees" },
  ]},
  { mod: "Module 3 \u00B7 Functions & Structure", wk: "Weeks 7\u20139", ls: [
    { t: "Defining Functions", s: "lock", d: "Packaging reusable logic with def" },
    { t: "Parameters, Returns & Scope", s: "lock", d: "Inputs, outputs, and variable visibility" },
    { t: "Error Handling & Debugging", s: "lock", d: "try / except, reading tracebacks, debugging" },
  ]},
  { mod: "Module 4 \u00B7 Data & Projects", wk: "Weeks 10\u201312", ls: [
    { t: "Dictionaries & Sets", s: "lock", d: "Key-value pairs and unique collections" },
    { t: "File I/O & Data Processing", s: "lock", d: "Reading, writing, and transforming real data" },
    { t: "Capstone Project", s: "lock", d: "Build a complete program combining all concepts" },
  ]},
];

const STEPS = ["orient","predict","investigate","represent","reflect","extend"];
const SM = {
  orient:     { l:"Orient",      c:"#ff6b9d", n:"01" },
  predict:    { l:"Predict",     c:"#00e87b", n:"02" },
  investigate:{ l:"Investigate", c:"#f5c842", n:"03" },
  represent:  { l:"Represent",   c:"#00c4f0", n:"04" },
  reflect:    { l:"Reflect",     c:"#a78bfa", n:"05" },
  extend:     { l:"Extend",      c:"#00d9ff", n:"06" },
};

const ORIENT_Q = [
  { key:"experience", q:"How much programming have you done before?", sub:"Be honest \u2014 this shapes how I explain things.", multi:false,
    opts:["Absolute beginner \u2014 never written code","Dabbled a bit \u2014 tried a tutorial or two","Know the basics \u2014 variables, loops, conditionals","Built small projects on my own","Comfortable with mid-sized projects","Professional developer / researcher"] },
  { key:"languages", q:"Which languages or tools have you used before?", sub:"Even a little exposure counts. Multi-select.", multi:true,
    opts:["Python","JavaScript / TypeScript","Java / Kotlin","C / C++ / Rust","R / MATLAB / Julia","SQL","HTML / CSS","Excel formulas / Google Sheets","None yet"] },
  { key:"purpose", q:"What are you hoping to use Python for?", sub:"This helps me pick examples that actually matter to you.", multi:false,
    opts:["Data analysis or research","Automating boring tasks","Building web apps or tools","Machine learning / AI","School or coursework","Career change into tech","Just curious, no specific goal"] },
  { key:"tone", q:"How would you like me to explain things?", sub:"Pick the vibe that makes you want to keep learning. I actually adjust my tone based on this.", multi:false,
    opts:["Concise and direct \u2014 just the essentials","Step-by-step with lots of worked examples","Socratic \u2014 ask me questions, let me figure it out","Warm and encouraging \u2014 celebrate small wins","Technical and precise \u2014 don't dumb it down","Metaphors and analogies \u2014 relate it to real life"] },
  { key:"approach", q:"When a new concept confuses you, what helps most?", sub:"Your brain's preferred on-ramp.", multi:false,
    opts:["Seeing a worked example first","Trying it myself and breaking it","Reading docs or a textbook explanation","Watching someone walk through it","Drawing it out on paper","Predicting first, then checking"] },
  { key:"stuck", q:"When you get stuck, what do you usually do first?", sub:"There's no wrong answer \u2014 this tells me when to jump in.", multi:false,
    opts:["Keep poking at it until it works","Search online / Stack Overflow","Ask an AI assistant","Talk it out with someone","Step away, come back later","Skip ahead and circle back"] },
];

const TONE_INSTRUCTIONS = {
  "Concise and direct \u2014 just the essentials": "Be concise and direct. Skip pleasantries. Give the essential answer in 2-3 tight sentences.",
  "Step-by-step with lots of worked examples": "Explain step-by-step with concrete worked examples. Show intermediate states. Number the steps.",
  "Socratic \u2014 ask me questions, let me figure it out": "Use a Socratic style. Instead of giving answers directly, ask one guiding question that helps the learner discover the answer themselves. Keep it short.",
  "Warm and encouraging \u2014 celebrate small wins": "Be warm and encouraging. Acknowledge effort, celebrate small wins, and keep the tone friendly.",
  "Technical and precise \u2014 don't dumb it down": "Use precise technical language. Don't over-simplify. Assume the learner can handle correct terminology.",
  "Metaphors and analogies \u2014 relate it to real life": "Lead with a vivid real-world metaphor or analogy before explaining the technical detail.",
};

function buildProfileContext(answers) {
  if (!answers || Object.keys(answers).length === 0) return "";
  const parts = [];
  const exp = answers.experience?.selected;
  if (exp) parts.push(`Experience level: ${exp}.`);
  const langs = answers.languages?.selected;
  if (Array.isArray(langs) && langs.length) parts.push(`Has used: ${langs.join(", ")}.`);
  const purpose = answers.purpose?.selected;
  if (purpose) parts.push(`Learning Python for: ${purpose}.`);
  const tone = answers.tone?.selected;
  const toneInstr = tone ? TONE_INSTRUCTIONS[tone] || "" : "";
  const approach = answers.approach?.selected;
  if (approach) parts.push(`Prefers: ${approach}.`);
  const customs = Object.entries(answers).map(([k, v]) => v?.custom ? `${k}: ${v.custom}` : null).filter(Boolean);
  if (customs.length) parts.push(`Self-described: ${customs.join("; ")}.`);
  const profile = parts.length ? `LEARNER PROFILE: ${parts.join(" ")}` : "";
  return [profile, toneInstr].filter(Boolean).join("\n\n");
}

const TRANSFER_PREDS = [{id:"a",t:"0 1 2 3 4"},{id:"b",t:"0 2 4 6 8"},{id:"c",t:"2 4 6 8 10"},{id:"d",t:"0 5 10 15 20"}];
const TRANSFER_OUT = ["0","2","4","6","8"];
const TRANSFER_FB = {
  a:{ok:false,ti:"Close \u2014 look at the expression inside print() again",bd:"You might have missed the i * 2 part. range(5) does produce 0 through 4, but print outputs i * 2, not i itself."},
  b:{ok:true,ti:"Exactly right.",bd:"range(5) generates 0 to 4, and each value gets multiplied by 2 \u2014 giving 0, 2, 4, 6, 8. You transferred the for-loop model to a new kind of iterable."},
  c:{ok:false,ti:"Almost \u2014 the starting point is off",bd:"range(5) starts from 0, not from 1. So the first output is 0 * 2 = 0, not 2. The rest of your pattern is correct."},
  d:{ok:false,ti:"This mixes up what range(5) means",bd:"range(5) means produce five numbers starting from 0 (so 0, 1, 2, 3, 4). It does not mean step by 5. To step by 5, you'd write range(0, n, 5)."},
};

const PREDS = [
  {id:"correct",t:"Prints each fruit on its own line:\napple\nbanana\ncherry"},
  {id:"list",t:'Prints the whole list:\n["apple","banana","cherry"]'},
  {id:"last",t:"Only prints the last item:\ncherry"},
  {id:"error",t:"Throws an error because\n\'fruit\' is not defined"},
];
const PFB = {
  correct:{ok:true,ti:"Nice \u2014 your prediction was correct.",bd:"Your intuition is solid. A for loop takes each element one at a time. Even correct predictions benefit from deeper exploration."},
  list:{ok:false,ti:"Not quite \u2014 but a great learning moment.",bd:"You expected print to output the entire list. That would happen with print(fruits). A for loop unpacks the list and processes items one by one."},
  last:{ok:false,ti:"Interesting prediction \u2014 let's unpack it.",bd:"You thought only the last item would print. Actually, in each iteration 'fruit' gets reassigned AND print() runs each time. The loop executes the indented block repeatedly."},
  error:{ok:false,ti:"Reasonable concern \u2014 but Python handles this.",bd:"'for fruit in fruits:' itself defines the variable. Each iteration, Python assigns the next element to 'fruit' automatically."},
};

const VARS = [
  {k:"orig",l:"Original",code:'fruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)',out:["apple","banana","cherry"]},
  {k:"idx",l:"With index",code:'fruits = ["apple", "banana", "cherry"]\nfor i, fruit in enumerate(fruits):\n    print(f"{i}: {fruit}")',out:["0: apple","1: banana","2: cherry"]},
  {k:"flt",l:"Skip cherry",code:'fruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    if fruit != "cherry":\n        print(fruit)',out:["apple","banana"]},
  {k:"rev",l:"Reverse",code:'fruits = ["apple", "banana", "cherry"]\nfor fruit in reversed(fruits):\n    print(fruit)',out:["cherry","banana","apple"]},
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================
function CodeEl({ code, accent = "#00e87b" }) {
  const kw = ["for","in","if","def","return","while","else","elif","not","and","or"];
  const bi = ["print","enumerate","reversed","range","len"];
  function hl(ln) {
    const ps = []; let b = "", iS = false, sc = "";
    for (let i = 0; i < ln.length; i++) {
      const c = ln[i];
      if (iS) { b += c; if (c === sc) { ps.push({ t: b, k: "s" }); b = ""; iS = false; } }
      else if (c === '"' || c === "'") { if (b) { ps.push({ t: b, k: "c" }); b = ""; } b = c; iS = true; sc = c; }
      else b += c;
    }
    if (b) ps.push({ t: b, k: iS ? "s" : "c" });
    return ps.map((p, pi) => {
      if (p.k === "s") return <span key={pi} style={{ color: "#c3e88d" }}>{p.t}</span>;
      return p.t.split(/\b/).map((tok, ti) => {
        if (kw.includes(tok)) return <span key={`${pi}-${ti}`} style={{ color: "#c792ea" }}>{tok}</span>;
        if (bi.includes(tok)) return <span key={`${pi}-${ti}`} style={{ color: "#82aaff" }}>{tok}</span>;
        return <span key={`${pi}-${ti}`}>{tok}</span>;
      });
    });
  }
  return (
    <div style={{ background: "#07070f", borderRadius: 12, overflow: "hidden", border: `1px solid ${accent}22`, boxShadow: `0 0 0 1px ${accent}10, 0 20px 50px rgba(0,0,0,.4)` }}>
      <div style={{ padding: "9px 16px", borderBottom: "1px solid #17172a", display: "flex", alignItems: "center", gap: 7, background: "#0a0a18" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block", opacity: .85 }} />)}
        <span style={{ fontSize: 11, color: "#6a6a88", marginLeft: 8, fontFamily: "var(--fm)", letterSpacing: ".02em" }}>lesson.py</span>
      </div>
      <pre style={{ padding: "18px 20px", margin: 0, fontFamily: "var(--fm)", fontSize: 13, lineHeight: 2, color: "#d4d4e8", overflowX: "auto" }}>
        {code.split("\n").map((l, i) => <div key={i}><span style={{ color: "#3a3a55", marginRight: 14, userSelect: "none", display: "inline-block", width: 18, textAlign: "right" }}>{i + 1}</span>{hl(l)}</div>)}
      </pre>
    </div>
  );
}

function OutEl({ lines, running, color = "#00e87b" }) {
  return (
    <div style={{ background: "#07070f", borderRadius: 11, padding: "14px 18px", border: `1px solid ${color}20`, minHeight: 48 }}>
      <div style={{ fontSize: 10, color: "#6a6a88", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--fm)" }}>output</div>
      <div style={{ fontFamily: "var(--fm)", fontSize: 13, lineHeight: 1.9 }}>
        {lines.map((l, i) => <div key={i} style={{ color, animation: "slideIn .25s ease-out" }}>{l}</div>)}
        {running && <span style={{ color, animation: "blink 1s step-end infinite" }}>{"\u2588"}</span>}
        {!running && lines.length === 0 && <span style={{ color: "#444466", fontStyle: "italic" }}>Waiting...</span>}
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, bg, color = "#050510", sx = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "11px 24px", borderRadius: 10, border: "none",
      background: disabled ? "#1a1a2a" : bg, color: disabled ? "#444466" : color,
      fontSize: 13.5, fontWeight: 700, cursor: disabled ? "default" : "pointer",
      transition: "all .25s ease", fontFamily: "var(--fb)", letterSpacing: "-.005em", ...sx
    }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,232,123,.25)"; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      {children}
    </button>
  );
}

function TraceTable({ step: aS }) {
  const rows = [
    { it:"Before loop",fruits:'["apple","banana","cherry"]',fruit:"\u2014",act:"\u2014",out:"" },
    { it:"Iteration 1",fruits:'["apple","banana","cherry"]',fruit:'"apple"',act:'print("apple")',out:"apple" },
    { it:"Iteration 2",fruits:'["apple","banana","cherry"]',fruit:'"banana"',act:'print("banana")',out:"apple\nbanana" },
    { it:"Iteration 3",fruits:'["apple","banana","cherry"]',fruit:'"cherry"',act:'print("cherry")',out:"apple\nbanana\ncherry" },
    { it:"After loop",fruits:'["apple","banana","cherry"]',fruit:'"cherry" (last)',act:"\u2014 (ended)",out:"apple\nbanana\ncherry" },
  ];
  const hd = ["Step","fruits","fruit","Action","Output"], ks = ["it","fruits","fruit","act","out"];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:"var(--fm)",fontSize:11.5 }}>
        <thead><tr>{hd.map((h,i)=><th key={i} style={{padding:"10px 12px",textAlign:"left",color:"#00c4f0",borderBottom:"1.5px solid rgba(0,196,240,.25)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row,ri)=>{const vis=ri<=aS+1,act=ri===aS+1&&aS<4;if(!vis)return null;return(
          <tr key={ri} style={{animation:"slideIn .3s ease-out",background:act?"rgba(0,196,240,.04)":"transparent"}}>
            {ks.map((k,ki)=><td key={ki} style={{padding:"10px 12px",borderBottom:"1px solid #141428",color:act?(ki===2?"#00c4f0":ki===3?"#82aaff":"#d4d4e8"):"#6a6a88",fontWeight:act?600:400,whiteSpace:k==="out"?"pre-wrap":"nowrap",verticalAlign:"top"}}>{row[k]}</td>)}
          </tr>);})}</tbody>
      </table>
    </div>
  );
}

function MindMap() {
  const w=600,h=400;
  const nodes=[
    {x:300,y:40,label:"for fruit in fruits:",col:"#00c4f0",w:200,h:34,fontSize:13,bold:true},
    {x:100,y:140,label:"The Collection",col:"#00e87b",w:140,h:30,fontSize:11,bold:true},
    {x:300,y:140,label:"The Loop Variable",col:"#a78bfa",w:160,h:30,fontSize:11,bold:true},
    {x:500,y:140,label:"The Loop Body",col:"#f5c842",w:140,h:30,fontSize:11,bold:true},
    {x:100,y:220,label:'fruits = ["apple",...]',col:"#00e87b",w:160,h:26,fontSize:10,bold:false},
    {x:300,y:220,label:"fruit changes each\niteration",col:"#a78bfa",w:160,h:38,fontSize:10,bold:false},
    {x:500,y:220,label:"print(fruit)\nruns every time",col:"#f5c842",w:140,h:38,fontSize:10,bold:false},
    {x:100,y:310,label:"Any iterable:\nlist, string, range...",col:"#00e87b80",w:150,h:38,fontSize:10,bold:false},
    {x:300,y:310,label:"Auto-assigned by\nPython each cycle",col:"#a78bfa80",w:160,h:38,fontSize:10,bold:false},
    {x:500,y:310,label:"Must be indented\n(4 spaces)",col:"#f5c84280",w:140,h:38,fontSize:10,bold:false},
  ];
  const edges=[{from:0,to:1,label:"iterates over"},{from:0,to:2,label:"assigns to"},{from:0,to:3,label:"executes"},{from:1,to:4,label:""},{from:2,to:5,label:""},{from:3,to:6,label:""},{from:4,to:7,label:""},{from:5,to:8,label:""},{from:6,to:9,label:""}];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:580,display:"block",margin:"0 auto"}}>
      <defs><marker id="ahMM" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#2a2a44"/></marker></defs>
      {edges.map((e,i)=>{const f=nodes[e.from],t=nodes[e.to];const fy=f.y+f.h/2,ty=t.y-t.h/2;const mx=(f.x+t.x)/2,my=(fy+ty)/2;return(
        <g key={i}>
          <line x1={f.x} y1={fy} x2={t.x} y2={ty} stroke="#1e1e40" strokeWidth={1.5} markerEnd="url(#ahMM)"/>
          {e.label&&<text x={mx+(f.x<t.x?8:f.x>t.x?-8:0)} y={my} textAnchor="middle" fill="#4a4a66" fontSize={9} fontFamily="var(--fb)" fontStyle="italic">{e.label}</text>}
        </g>);})}
      {nodes.map((n,i)=>{const lines=n.label.split("\n");return(
        <g key={i}>
          <rect x={n.x-n.w/2} y={n.y-n.h/2} width={n.w} height={n.h} rx={8} fill={`${n.col}12`} stroke={n.col} strokeWidth={i===0?2:1}/>
          {lines.map((line,li)=>(<text key={li} x={n.x} y={n.y+(li-(lines.length-1)/2)*13} textAnchor="middle" dominantBaseline="central" fill={n.col} fontSize={n.fontSize} fontWeight={n.bold?700:400} fontFamily={i===0||i>=4?"var(--fm)":"var(--fb)"}>{line}</text>))}
        </g>);})}
      <text x={20} y={h-10} fill="#2a2a44" fontSize={9} fontFamily="var(--fb)">Read top to bottom: syntax &rarr; concepts &rarr; details</text>
    </svg>
  );
}

function ConnectionMap() {
  const nodes=[{x:90,y:70,label:"Variables",col:"#00e87b"},{x:90,y:130,label:"Lists",col:"#00e87b"},{x:90,y:190,label:"Strings",col:"#00e87b"},{x:300,y:130,label:"For Loops",col:"#f5c842",big:true},{x:510,y:100,label:"While Loops",col:"#a78bfa"},{x:510,y:170,label:"Conditionals",col:"#a78bfa"}];
  const edges=[{from:0,to:3},{from:1,to:3},{from:2,to:3},{from:3,to:4},{from:3,to:5}];
  return (
    <svg viewBox="0 0 600 240" style={{width:"100%",maxWidth:560,display:"block",margin:"0 auto"}}>
      <defs><marker id="ahCM" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3a3a55"/></marker></defs>
      <text x="90" y="22" textAnchor="middle" fill="#00e87b" fontSize="10.5" fontWeight="700" fontFamily="var(--fb)" letterSpacing=".1em">LEARNED</text>
      <text x="300" y="22" textAnchor="middle" fill="#f5c842" fontSize="10.5" fontWeight="700" fontFamily="var(--fb)" letterSpacing=".1em">NOW</text>
      <text x="510" y="22" textAnchor="middle" fill="#a78bfa" fontSize="10.5" fontWeight="700" fontFamily="var(--fb)" letterSpacing=".1em">NEXT UP</text>
      {edges.map((e,i)=>{const f=nodes[e.from],t=nodes[e.to];const fw=f.big?55:50,tw=t.big?55:50;return <line key={i} x1={f.x+fw} y1={f.y} x2={t.x-tw} y2={t.y} stroke={`${t.col}55`} strokeWidth="1.5" markerEnd="url(#ahCM)"/>;})}
      {nodes.map((n,i)=>{const w=n.big?110:100,h=n.big?40:32;return (
        <g key={i}>
          <rect x={n.x-w/2} y={n.y-h/2} width={w} height={h} rx="8" fill={`${n.col}${n.big?"20":"10"}`} stroke={n.col} strokeWidth={n.big?2:1}/>
          <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fill={n.col} fontSize={n.big?13:11.5} fontWeight={n.big?700:500} fontFamily="var(--fb)">{n.label}</text>
        </g>);})}
    </svg>
  );
}

function FloatingAI({ variant, profile }) {
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const scrollRef=useRef(null);
  const v=VARS[variant];
  useEffect(()=>{scrollRef.current?.scrollTo(0,9999);},[msgs]);
  async function send(){
    if(!input.trim()||loading)return;
    const um=input.trim();setInput("");
    const nm=[...msgs,{role:"user",content:um}];setMsgs(nm);setLoading(true);
    const profileCtx=buildProfileContext(profile||{});
    const sys=`${profileCtx}\n\nYou are a friendly Python tutor helping a beginner. Current code:\n\n${v.code}\n\nOutput: ${v.out.join("\\n")}\n\nGive clear, helpful explanations with examples. Keep responses concise (3-5 sentences).`;
    const resp=await askAI(sys,nm.map(m=>({role:m.role,content:m.content})));
    setMsgs(p=>[...p,{role:"assistant",content:resp}]);setLoading(false);
  }
  const face="{ > \u203F \u00B0 }", thinkFace="{ \u2013 _ \u2013 }";
  return (<>
    {!open&&<div style={{position:"fixed",bottom:24,right:24,zIndex:1000,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
      {msgs.length===0&&<div style={{padding:"8px 14px",borderRadius:"12px 12px 4px 12px",background:"linear-gradient(135deg,#0c0c1e,#111128)",border:"1px solid rgba(0,196,240,.18)",fontSize:11.5,color:"#9898b8",boxShadow:"0 6px 24px rgba(0,0,0,.45)",animation:"fadeUp .6s ease-out",maxWidth:200,lineHeight:1.5,fontFamily:"var(--fb)"}}>Stuck on something? Tap me.</div>}
      <button onClick={()=>setOpen(true)} style={{width:82,height:52,borderRadius:16,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#0c0c1e,#111128)",boxShadow:"0 6px 28px rgba(0,196,240,.25), 0 0 0 1px rgba(0,196,240,.2)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s",whiteSpace:"nowrap"}}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.08)";e.currentTarget.style.boxShadow="0 6px 34px rgba(0,196,240,.4), 0 0 0 1px rgba(0,196,240,.35)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 6px 28px rgba(0,196,240,.25), 0 0 0 1px rgba(0,196,240,.2)";}}>
        <span style={{fontFamily:"var(--fm)",fontSize:12,color:"#00c4f0",fontWeight:700,whiteSpace:"nowrap"}}>{face}</span>
      </button>
    </div>}
    {open&&<div style={{position:"fixed",bottom:24,right:24,zIndex:1000,width:360,height:460,borderRadius:18,overflow:"hidden",background:"linear-gradient(180deg,#0a0a18,#07070f)",border:"1px solid #1e1e40",boxShadow:"0 10px 50px rgba(0,0,0,.6), 0 0 80px rgba(0,196,240,.08)",display:"flex",flexDirection:"column",animation:"fadeUp .3s ease-out"}}>
      <div style={{padding:"14px 16px",borderBottom:"1px solid #17172a",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,background:"#0c0c1e"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:"var(--fm)",fontSize:13,color:"#00c4f0",fontWeight:700}}>{face}</span>
          <div><div style={{fontSize:13,fontWeight:600,color:"#d4d4e8"}}>AI Tutor</div><div style={{fontSize:10,color:"#6a6a88"}}>Ask anything about the code</div></div>
        </div>
        <button onClick={()=>setOpen(false)} style={{background:"transparent",border:"1px solid #1e1e40",borderRadius:8,color:"#9898b8",cursor:"pointer",fontSize:16,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.length===0&&<div style={{fontSize:12.5,color:"#9898b8",textAlign:"center",marginTop:60,lineHeight:2,fontFamily:"var(--fb)"}}>
          <div style={{fontFamily:"var(--fm)",fontSize:22,color:"#00c4f0",marginBottom:10}}>{"{ \u00B0 _ \u00B0 }"}</div>
          Hi. Ask me about the code.<br/><span style={{color:"#6a6a88",fontSize:11.5}}>e.g. "What does enumerate do?"</span>
        </div>}
        {msgs.map((m,i)=>(<div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?"rgba(0,196,240,.08)":"#0c0c1e",border:m.role==="user"?"1px solid rgba(0,196,240,.25)":"1px solid #1e1e40",fontSize:12.5,color:m.role==="user"?"#d4d4e8":"#9898b8",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.content}</div>))}
        {loading&&<div style={{alignSelf:"flex-start",padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:"#0c0c1e",border:"1px solid #1e1e40",fontSize:12.5,color:"#9898b8"}}><span style={{fontFamily:"var(--fm)"}}>{thinkFace}</span> thinking<span style={{animation:"blink 1s step-end infinite"}}>...</span></div>}
      </div>
      <div style={{padding:"12px",borderTop:"1px solid #17172a",display:"flex",gap:8,flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask a question..." style={{flex:1,padding:"10px 14px",borderRadius:12,background:"#050510",border:"1px solid #1e1e40",color:"#d4d4e8",fontSize:12.5,fontFamily:"var(--fb)"}}/>
        <button disabled={!input.trim()||loading} onClick={send} style={{padding:"10px 16px",borderRadius:12,border:"none",background:!input.trim()||loading?"#1a1a2a":"linear-gradient(135deg,#00e87b,#00c4f0)",color:!input.trim()||loading?"#444466":"#050510",fontSize:13,fontWeight:700,cursor:!input.trim()||loading?"default":"pointer"}}>&uarr;</button>
      </div>
    </div>}
  </>);
}

function Confetti() {
  const pieces = Array.from({ length: 80 }, (_, i) => i);
  const colors = ["#00e87b","#00c4f0","#f5c842","#ff6b9d","#a78bfa","#00d9ff"];
  return (
    <div className="confetti-wrap">
      {pieces.map(i => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 2.5 + Math.random() * 2.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotate = Math.random() * 360;
        const width = 6 + Math.random() * 8;
        const height = 10 + Math.random() * 8;
        return <div key={i} className="confetti-pc" style={{ left:`${left}%`,background:color,width:`${width}px`,height:`${height}px`,animationDelay:`${delay}s`,animationDuration:`${duration}s`,transform:`rotate(${rotate}deg)` }}/>;
      })}
    </div>
  );
}

// =============================================================================
// MAIN DEMO COMPONENT
// =============================================================================
export default function Demo({ goHome }) {
  const [view,setView]=useState("home");
  const [step,setStep]=useState(0);
  const [maxS,setMaxS]=useState(0);
  const [pred,setPred]=useState(null);
  const [custom,setCustom]=useState("");
  const [useCust,setUseCust]=useState(false);
  const [subm,setSubm]=useState(false);
  const [oL,setOL]=useState([]);
  const [oR,setOR]=useState(false);
  const [showFb,setShowFb]=useState(false);
  const [aiFb,setAiFb]=useState("");
  const [aiLd,setAiLd]=useState(false);
  const [vari,setVari]=useState(0);
  const [sO,setSO]=useState([]);
  const [sR,setSR]=useState(false);
  const [selR,setSelR]=useState(null);
  const [anS,setAnS]=useState(-1);
  const [anP,setAnP]=useState(false);
  const anRef=useRef(null);
  const [refl,setRefl]=useState("");
  const [repC,setRepC]=useState(null);
  const [done,setDone]=useState(false);
  const [reflFb,setReflFb]=useState("");
  const [reflLd,setReflLd]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [keyInput,setKeyInput]=useState(getApiKey());
  const [keySaved,setKeySaved]=useState(!!getApiKey());
  const [orientStep,setOrientStep]=useState(0);
  const [orientAnswers,setOrientAnswers]=useState({});
  const [orientDir,setOrientDir]=useState("next");
  const [transferPred,setTransferPred]=useState(null);
  const [transferCustom,setTransferCustom]=useState("");
  const [transferUseCust,setTransferUseCust]=useState(false);
  const [transferSubm,setTransferSubm]=useState(false);
  const [transferOut,setTransferOut]=useState([]);
  const [transferRun,setTransferRun]=useState(false);
  const [journalEntry,setJournalEntry]=useState("");

  function runO(arr,sL,sR,cb){sR(true);sL([]);arr.forEach((l,i)=>{setTimeout(()=>{sL(p=>[...p,l]);if(i===arr.length-1){sR(false);if(cb)setTimeout(cb,500);}},(i+1)*420);});}
  function go(s){setStep(s);if(s>maxS)setMaxS(s);setSO([]);setSR(false);}

  function orientSelect(key,opt,multi){
    setOrientAnswers(p=>{const cur=p[key]||{selected:multi?[]:null,custom:""};if(multi){const arr=cur.selected||[];const nArr=arr.includes(opt)?arr.filter(x=>x!==opt):[...arr,opt];return{...p,[key]:{...cur,selected:nArr}};}return{...p,[key]:{...cur,selected:opt}};});
  }
  function orientSetCustom(key,val){setOrientAnswers(p=>{const cur=p[key]||{selected:null,custom:""};return{...p,[key]:{...cur,custom:val}};});}
  function orientCanProceed(){const q=ORIENT_Q[orientStep];const ans=orientAnswers[q.key];if(!ans)return false;const sel=ans.selected;const hasSel=q.multi?sel&&sel.length>0:!!sel;const hasCust=!!(ans.custom&&ans.custom.trim());return hasSel||hasCust;}
  function orientNext(){if(orientStep<ORIENT_Q.length-1){setOrientDir("next");setOrientStep(p=>p+1);}else go(1);}
  function orientPrev(){if(orientStep>0){setOrientDir("prev");setOrientStep(p=>p-1);}}

  useEffect(()=>{
    if(selR==="trace"||selR==="anim"){setAnS(-1);setAnP(false);let idx=0;anRef.current=setInterval(()=>{setAnS(idx);idx++;if(idx>3)clearInterval(anRef.current);},2200);return()=>clearInterval(anRef.current);}
  },[selR]);
  useEffect(()=>{if(anP&&anRef.current)clearInterval(anRef.current);},[anP]);
  function anPlay(){if(anS>=3){setSelR(null);setTimeout(()=>setSelR(selR),80);return;}setAnP(false);let idx=anS+1;anRef.current=setInterval(()=>{setAnS(idx);idx++;if(idx>3)clearInterval(anRef.current);},2200);}
  function anStepF(){setAnP(true);if(anS<3)setAnS(p=>p+1);}

  async function analyzeCustom(){setAiLd(true);const profileCtx=buildProfileContext(orientAnswers);const sys=`${profileCtx}\n\nYou are a Python tutor for beginners learning for loops. Code:\n\nfruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)\n\nOutput: apple, banana, cherry (each on separate line). Analyze the student's prediction in 3-4 sentences: mental model, validate reasoning, explain divergence, warm correction.`;const r=await askAI(sys,[{role:"user",content:`My prediction: ${custom}`}]);setAiFb(r);setAiLd(false);}
  async function evalRefl(){setReflLd(true);const profileCtx=buildProfileContext(orientAnswers);const sys=`${profileCtx}\n\nEvaluate a beginner's for-loop explanation. 3-4 sentences: what's right (specific), what's missing, suggestion, encouragement. Warm and constructive.`;const r=await askAI(sys,[{role:"user",content:`My explanation:\n\n${refl}`}]);setReflFb(r);setReflLd(false);}

  const gearIcon=<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" stroke="currentColor" strokeWidth="1.3"/><path d="M13 8a5 5 0 00-.08-.88l1.25-.98-1.25-2.17-1.48.5a5 5 0 00-1.51-.87l-.23-1.58h-2.5l-.23 1.58a5 5 0 00-1.51.87l-1.48-.5L2.83 6.14l1.25.98A5 5 0 004 8c0 .3.03.6.08.88l-1.25.98 1.25 2.17 1.48-.5c.46.36.97.65 1.51.87l.23 1.58h2.5l.23-1.58a5 5 0 001.51-.87l1.48.5 1.25-2.17-1.25-.98c.05-.28.08-.58.08-.88z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>;
  const shieldIcon=<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 5v5c0 4.3 3 7.5 7 8.5 4-1 7-4.2 7-8.5V5l-7-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

  // ============ HOME VIEW ============
  if (view === "home") return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--tx)" }}>
      {showSettings && (
        <div style={{ position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(5,5,16,.82)",backdropFilter:"blur(14px)",padding:24 }}>
          <div style={{ background:"linear-gradient(180deg,#0c0c1e,#080818)",borderRadius:20,padding:"34px 32px 30px",width:460,border:"1px solid rgba(0,232,123,.18)",boxShadow:"0 30px 80px rgba(0,0,0,.6)",animation:"fadeUp .4s ease both" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ color:"#00e87b" }}>{gearIcon}</span>
                <div style={{ fontSize:16,fontWeight:600,fontFamily:"var(--fb)" }}>Settings</div>
              </div>
              <button onClick={()=>setShowSettings(false)} style={{ background:"none",border:"none",color:"#9898b8",cursor:"pointer",fontSize:20,width:28,height:28 }}>&times;</button>
            </div>
            <div style={{ fontSize:12.5,color:"var(--tx2)",marginBottom:14,lineHeight:1.65 }}>Enter your <strong style={{ color:"var(--tx)" }}>Anthropic Claude API key</strong> to enable AI features in this demo.</div>
            <div className="secure-badge">
              <span>{shieldIcon}</span>
              <div>
                <div className="st1">Your key stays in your browser</div>
                <div className="st2">It's saved to your browser's local storage and sent only to api.anthropic.com when you interact with the AI &mdash; never to our servers.</div>
              </div>
            </div>
            <input value={keyInput} onChange={e=>setKeyInput(e.target.value)} type="password" placeholder="sk-ant-api03-..." style={{ width:"100%",padding:"11px 14px",borderRadius:10,background:"#050510",border:"1px solid #1e1e40",color:"#d4d4e8",fontSize:13,fontFamily:"var(--fm)",marginBottom:10 }}/>
            <div style={{ fontSize:11.5,color:"var(--muted)",marginBottom:16 }}>
              Don't have one? <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ color:"#00c4f0",textDecoration:"none",fontWeight:500 }}>Get a key &rarr;</a>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>{setApiKeyStore(keyInput);setKeySaved(true);setShowSettings(false);}} style={{ flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#00e87b,#00c4f0)",color:"#050510",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"var(--fb)" }}>Save key</button>
              {keySaved && <button onClick={()=>{setApiKeyStore("");setKeyInput("");setKeySaved(false);}} style={{ padding:"11px 18px",borderRadius:10,border:"1px solid rgba(255,107,107,.3)",background:"rgba(255,107,107,.05)",color:"#ff8a8a",fontSize:12.5,cursor:"pointer",fontFamily:"var(--fb)" }}>Clear</button>}
            </div>
            {keySaved && <div style={{ marginTop:12,fontSize:11.5,color:"#00e87b",fontFamily:"var(--fb)" }}>&#10003; API key saved</div>}
          </div>
        </div>
      )}

      <div style={{ padding:"56px 28px 48px",maxWidth:760,margin:"0 auto" }}>
        <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:32 }}>
          <button onClick={goHome} style={{ display:"flex",alignItems:"center",gap:0,background:"none",border:"none",cursor:"pointer",padding:0 }}>
            <Logo size={34}/>
            <span style={{ fontSize:22,fontWeight:700,letterSpacing:"-0.03em",color:"var(--tx)",marginLeft:-1 }}>gito</span>
          </button>
          <div style={{ fontFamily:"var(--fd)",fontStyle:"italic",fontSize:16,color:"var(--dm)",marginLeft:8 }}>I think, therefore I learn</div>
          <div style={{ flex:1 }}/>
          <button onClick={()=>setShowSettings(true)} style={{ width:34,height:34,borderRadius:9,background:keySaved?"rgba(0,232,123,.06)":"rgba(255,107,107,.05)",border:keySaved?"1px solid rgba(0,232,123,.25)":"1px solid rgba(255,107,107,.25)",color:keySaved?"#00e87b":"#ff8a8a",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .25s" }} title="API key settings">{gearIcon}</button>
        </div>

        <div style={{ marginBottom:44 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:100,background:"rgba(0,232,123,.06)",border:"1px solid rgba(0,232,123,.2)",fontSize:10.5,color:"#00e87b",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:20 }}>
            <span style={{ width:5,height:5,borderRadius:"50%",background:"#00e87b",animation:"pulse 2s infinite" }}/>
            Interactive Demo
          </div>
          <h1 style={{ fontFamily:"var(--fd)",fontSize:44,fontWeight:400,lineHeight:1.08,letterSpacing:"-0.01em",marginBottom:14 }}>Python Fundamentals</h1>
          <p style={{ fontSize:15,color:"var(--tx2)",lineHeight:1.75,maxWidth:560 }}>A walkthrough of the six-phase cycle on a single lesson. Predict, investigate, represent, reflect, and extend &mdash; one concept at a time.</p>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:48 }}>
          {[{l:"Predict first",d:"Your intuitions are the starting point for learning"},{l:"Explore freely",d:"Hands-on experimentation builds flexible understanding"},{l:"Choose your lens",d:"Multiple representations support diverse thinking"},{l:"Reflect and grow",d:"Putting it in your own words makes it stick"}].map((p,i)=>(
            <div key={i} style={{ padding:"14px 16px",borderRadius:11,background:"var(--s1)",border:"1px solid var(--bd)",transition:"all .3s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,232,123,.22)";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bd)";e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{ fontSize:12.5,fontWeight:600,marginBottom:4,color:"var(--tx2)",fontFamily:"var(--fb)" }}>{p.l}</div>
              <div style={{ fontSize:11.5,color:"var(--dm)",lineHeight:1.6 }}>{p.d}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily:"var(--fd)",fontSize:28,fontWeight:400,marginBottom:6,letterSpacing:"-0.01em" }}>Course curriculum</h2>
        <p style={{ fontSize:13,color:"var(--dm)",marginBottom:22 }}>Module 2, Lesson 1 is unlocked in this demo.</p>

        {CURRIC.map((m,mi)=>(
          <div key={mi} style={{ marginBottom:26 }}>
            <div style={{ display:"flex",gap:10,alignItems:"baseline",marginBottom:10 }}>
              <span style={{ fontSize:13,fontWeight:600,color:"var(--tx)",fontFamily:"var(--fb)" }}>{m.mod}</span>
              <span style={{ fontSize:11,color:"var(--muted)",fontFamily:"var(--fm)" }}>{m.wk}</span>
            </div>
            {m.ls.map((l,li)=>{
              const cur=l.s==="cur",dn=l.s==="done",lk=l.s==="lock";
              return (
                <button key={li} onClick={()=>cur&&setView("lesson")} style={{ display:"flex",alignItems:"center",gap:14,width:"100%",padding:"13px 16px",borderRadius:10,marginBottom:5,textAlign:"left",background:cur?"rgba(0,232,123,.04)":"var(--s1)",border:cur?"1.5px solid rgba(0,232,123,.35)":"1px solid var(--bd)",cursor:cur?"pointer":"default",opacity:lk?0.4:1,animation:cur?"glow 3s ease-in-out infinite":"none",transition:"all .25s" }}>
                  <div style={{ width:30,height:30,borderRadius:8,flexShrink:0,background:dn?"rgba(0,232,123,.08)":cur?"rgba(0,232,123,.04)":"var(--s2)",border:dn?"1.5px solid rgba(0,232,123,.35)":cur?"1.5px solid rgba(0,232,123,.3)":"1px solid var(--bd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:dn||cur?"#00e87b":"#444466",fontFamily:"var(--fm)" }}>
                    {dn?"\u2713":lk?<svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M2 5V3a3 3 0 116 0v2m-6 0h6m-6 0a1 1 0 00-1 1v4a1 1 0 001 1h6a1 1 0 001-1V6a1 1 0 00-1-1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>:"\u2192"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5,fontWeight:cur?600:500,color:cur?"var(--tx)":dn?"var(--tx2)":"var(--muted)",display:"flex",alignItems:"center",gap:10 }}>
                      {l.t}
                      {cur&&<span style={{ fontSize:9.5,padding:"2px 8px",borderRadius:100,background:"rgba(0,232,123,.1)",color:"#00e87b",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase" }}>Current</span>}
                    </div>
                    <div style={{ fontSize:11.5,color:cur?"var(--dm)":dn?"var(--dm)":"var(--muted)",marginTop:2 }}>{l.d}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop:26,padding:"18px 22px",borderRadius:12,background:"var(--s1)",border:"1px solid var(--bd)" }}>
          <div style={{ fontSize:10.5,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"#00e87b",marginBottom:8 }}>The cycle</div>
          <div style={{ fontSize:13,color:"var(--tx2)",lineHeight:1.75 }}>Each lesson moves through <span style={{ color:"var(--tx)",fontWeight:500 }}>Orient &rarr; Predict &rarr; Investigate &rarr; Represent &rarr; Reflect &rarr; Extend</span>. You think first. You explore on your own terms. The AI meets you where you are.</div>
        </div>
      </div>
    </div>
  );

  // ============ LESSON VIEW ============
  return (
    <div style={{ minHeight:"100vh",background:"var(--bg)",color:"var(--tx)" }}>
      <div style={{ padding:"12px 24px",borderBottom:"1px solid var(--bd)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(5,5,16,.8)",backdropFilter:"blur(14px)",position:"sticky",top:0,zIndex:50 }}>
        <button onClick={()=>setView("home")} style={{ display:"flex",alignItems:"center",gap:10,background:"none",border:"none",color:"var(--dm)",cursor:"pointer",fontSize:12.5,fontFamily:"var(--fb)",padding:0 }}>
          <Logo size={22}/>
          <span style={{ marginLeft:-1 }}>&larr; Back to curriculum</span>
        </button>
        <span style={{ fontSize:11,color:"var(--dm)",fontFamily:"var(--fm)",letterSpacing:".02em" }}>Module 2 &middot; For Loops</span>
      </div>

      <div style={{ padding:"14px 24px 0",display:"flex",gap:6,borderBottom:"1px solid var(--bd)",maxWidth:920,margin:"0 auto",overflowX:"auto" }}>
        {STEPS.map((s,i)=>{
          const m=SM[s],a=i===step,ok=i<=maxS;
          return (
            <button key={s} onClick={()=>ok&&go(i)} style={{ flex:"1 1 0",minWidth:0,padding:"10px 4px",borderRadius:0,border:"none",background:"transparent",borderBottom:a?`2px solid ${m.c}`:"2px solid transparent",color:a?m.c:ok?"var(--tx2)":"var(--muted)",fontSize:12.5,fontWeight:a?600:400,cursor:ok?"pointer":"default",transition:"all .2s",opacity:ok?1:.5,fontFamily:"var(--fb)" }}>
              <span style={{ fontFamily:"var(--fm)",fontSize:10,marginRight:6,opacity:.7 }}>{m.n}</span>
              {m.l}
            </button>
          );
        })}
      </div>

      <div style={{ maxWidth:740,margin:"0 auto",padding:"32px 24px 64px" }}>
        {/* ORIENT */}
        {step===0 && (()=>{
          const q=ORIENT_Q[orientStep];
          const ans=orientAnswers[q.key]||{selected:q.multi?[]:null,custom:""};
          const isLast=orientStep===ORIENT_Q.length-1;
          return (
            <div className="fade-up" key="s_orient">
              <div style={{ fontSize:10.5,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#ff6b9d",marginBottom:10 }}>Phase 01 &middot; Orient</div>
              <h2 style={{ fontFamily:"var(--fd)",fontSize:32,fontWeight:400,lineHeight:1.12,marginBottom:10,letterSpacing:"-0.01em" }}>Let me get to know you first</h2>
              <p style={{ fontSize:14,color:"var(--tx2)",lineHeight:1.75,marginBottom:24 }}>A quick six-question intake so I can calibrate the lesson to your background and preferred style. Skip the options and type your own answer any time.</p>
              <div style={{ display:"flex",gap:7,marginBottom:22,alignItems:"center" }}>
                {ORIENT_Q.map((_,i)=>(<div key={i} style={{ width:i===orientStep?30:8,height:8,borderRadius:4,background:i<=orientStep?"#ff6b9d":"var(--bd)",transition:"all .3s ease" }}/>))}
                <span style={{ marginLeft:12,fontSize:11,color:"var(--dm)",fontFamily:"var(--fm)" }}>{orientStep+1} / {ORIENT_Q.length}</span>
              </div>
              <div key={`orientQ-${orientStep}`} className={orientDir==="next"?"orient-next":"orient-prev"} style={{ background:"var(--s1)",borderRadius:16,padding:"28px 26px",border:"1px solid rgba(255,107,157,.18)",marginBottom:18 }}>
                <div style={{ fontSize:16,fontWeight:600,color:"var(--tx)",marginBottom:6,lineHeight:1.4,fontFamily:"var(--fb)" }}>{q.q}</div>
                {q.sub&&<div style={{ fontSize:13,color:"var(--dm)",marginBottom:18,lineHeight:1.6 }}>{q.sub}</div>}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16 }}>
                  {q.opts.map(opt=>{
                    const sel=q.multi?(ans.selected||[]).includes(opt):ans.selected===opt;
                    return (
                      <button key={opt} onClick={()=>orientSelect(q.key,opt,q.multi)} style={{ padding:"12px 14px",borderRadius:10,textAlign:"left",border:sel?"1.5px solid #ff6b9d":"1px solid var(--bd)",background:sel?"rgba(255,107,157,.06)":"var(--s2)",color:sel?"var(--tx)":"var(--tx2)",fontSize:12.5,cursor:"pointer",lineHeight:1.5,transition:"all .2s",fontFamily:"var(--fb)" }}>
                        {q.multi&&<span style={{ marginRight:7,color:sel?"#ff6b9d":"var(--muted)" }}>{sel?"\u25A0":"\u25A1"}</span>}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div style={{ padding:"14px 16px",borderRadius:10,border:ans.custom?"1.5px solid rgba(255,107,157,.4)":"1px solid var(--bd)",background:"var(--s2)",transition:"all .2s" }}>
                  <div style={{ fontSize:11,color:"#ff6b9d",marginBottom:7,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase" }}>Other &mdash; write your own</div>
                  <input value={ans.custom||""} onChange={e=>orientSetCustom(q.key,e.target.value)} placeholder="In your own words..." style={{ width:"100%",padding:"9px 11px",borderRadius:7,background:"var(--s3)",border:"1px solid var(--bd)",color:"var(--tx)",fontSize:13,fontFamily:"var(--fb)" }}/>
                </div>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <button disabled={orientStep===0} onClick={orientPrev} style={{ padding:"10px 20px",borderRadius:10,border:"1px solid var(--bd)",background:"transparent",color:orientStep===0?"var(--muted)":"var(--tx2)",fontSize:13,cursor:orientStep===0?"default":"pointer",fontFamily:"var(--fb)",fontWeight:500 }}>&larr; Previous</button>
                <Btn disabled={!orientCanProceed()} bg="linear-gradient(135deg,#ff6b9d,#f5528c)" color="#fff" onClick={orientNext}>
                  {isLast?"Start learning \u2192":"Next \u2192"}
                </Btn>
              </div>
            </div>
          );
        })()}

        {/* PREDICT */}
        {step===1 && <div className="fade-up" key="s_predict">
          <div style={{ fontSize:10.5,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#00e87b",marginBottom:10 }}>Phase 02 &middot; Predict</div>
          <h2 style={{ fontFamily:"var(--fd)",fontSize:32,fontWeight:400,lineHeight:1.12,marginBottom:10,letterSpacing:"-0.01em" }}>What do you think this code will do?</h2>
          <p style={{ fontSize:14,color:"var(--tx2)",lineHeight:1.75,marginBottom:22 }}>Commit to a guess before any answer shows up. This single act activates what you already know and sets up the rest of the session.</p>
          <CodeEl code={'fruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)'} accent="#00e87b"/>
          <div style={{ marginTop:22 }}>
            {!subm ? <>
              <div style={{ fontSize:11,fontWeight:700,color:"#00e87b",marginBottom:12,letterSpacing:".1em",textTransform:"uppercase" }}>Choose your prediction</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>
                {PREDS.map(o=><button key={o.id} onClick={()=>{setPred(o.id);setUseCust(false);}} style={{ padding:"14px 15px",borderRadius:10,textAlign:"left",border:pred===o.id&&!useCust?"1.5px solid #00e87b":"1px solid var(--bd)",background:pred===o.id&&!useCust?"rgba(0,232,123,.05)":"var(--s1)",color:pred===o.id&&!useCust?"var(--tx)":"var(--tx2)",fontSize:12,cursor:"pointer",whiteSpace:"pre-line",fontFamily:"var(--fm)",lineHeight:1.6,transition:"all .2s" }}>{o.t}</button>)}
              </div>
              <div style={{ padding:"14px 16px",borderRadius:10,marginBottom:16,border:useCust?"1.5px solid #00c4f0":"1px solid var(--bd)",background:useCust?"rgba(0,196,240,.04)":"var(--s1)",transition:"all .2s" }}>
                <div style={{ fontSize:11,fontWeight:700,color:useCust?"#00c4f0":"var(--muted)",marginBottom:8,letterSpacing:".08em",textTransform:"uppercase" }}>Or write your own prediction</div>
                <input value={custom} onChange={e=>{setCustom(e.target.value);setUseCust(true);setPred(null);}} onFocus={()=>{setUseCust(true);setPred(null);}} placeholder="Type what you think will happen..." style={{ width:"100%",padding:"9px 12px",borderRadius:7,background:"var(--s3)",border:"1px solid var(--bd)",color:"var(--tx)",fontSize:13,fontFamily:"var(--fb)" }}/>
              </div>
              <Btn disabled={!pred&&!custom.trim()} bg="linear-gradient(135deg,#00e87b,#00c4f0)" onClick={()=>{setSubm(true);runO(["apple","banana","cherry"],setOL,setOR,()=>{if(useCust&&custom.trim())analyzeCustom();setShowFb(true);});}}>&#9654; Submit & run</Btn>
            </> : <>
              <OutEl lines={oL} running={oR} color="#00e87b"/>
              {showFb&&!useCust&&pred&&(()=>{const fb=PFB[pred];return(
                <div className="fade-up" style={{ marginTop:16,borderRadius:12,padding:"18px 20px",background:fb.ok?"rgba(0,232,123,.04)":"rgba(245,200,66,.04)",border:fb.ok?"1px solid rgba(0,232,123,.25)":"1px solid rgba(245,200,66,.25)" }}>
                  <div style={{ fontSize:14.5,fontWeight:600,marginBottom:8,color:fb.ok?"#00e87b":"#f5c842",fontFamily:"var(--fb)" }}>{fb.ti}</div>
                  <div style={{ fontSize:13,color:"var(--tx2)",lineHeight:1.75 }}>{fb.bd}</div>
                  <Btn onClick={()=>go(2)} bg="linear-gradient(135deg,#f5c842,#e09a2a)" sx={{ marginTop:16 }}>Continue &rarr;</Btn>
                </div>);})()}
              {showFb&&useCust&&<div className="fade-up" style={{ marginTop:16 }}>
                <div style={{ background:"var(--s1)",borderRadius:13,padding:"16px 20px",border:"1px solid rgba(0,196,240,.2)" }}>
                  <div style={{ fontSize:10.5,color:"#00c4f0",fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:".1em" }}>AI Analysis</div>
                  {aiLd?<div style={{ color:"var(--dm)",fontSize:13 }}>Analyzing<span style={{ animation:"blink 1s step-end infinite" }}>...</span></div>:<div style={{ fontSize:13,color:"var(--tx2)",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{aiFb}</div>}
                </div>
                {!aiLd&&aiFb&&<Btn onClick={()=>go(2)} bg="linear-gradient(135deg,#f5c842,#e09a2a)" sx={{ marginTop:16 }}>Continue &rarr;</Btn>}
              </div>}
            </>}
          </div>
        </div>}

        {/* INVESTIGATE */}
        {step===2 && <div className="fade-up" key="s_investigate">
          <div style={{ fontSize:10.5,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#f5c842",marginBottom:10 }}>Phase 03 &middot; Investigate</div>
          <h2 style={{ fontFamily:"var(--fd)",fontSize:32,fontWeight:400,lineHeight:1.12,marginBottom:10,letterSpacing:"-0.01em" }}>What happens when you change the code?</h2>
          <p style={{ fontSize:14,color:"var(--tx2)",lineHeight:1.75,marginBottom:20 }}>Modify a variable, swap an input, test a hypothesis. Predict first, then verify. The AI tutor is here when you need it.</p>
          <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>
            {VARS.map((v,i)=><button key={v.k} onClick={()=>{setVari(i);setSO([]);setSR(false);}} style={{ padding:"7px 15px",borderRadius:8,border:vari===i?"1.5px solid rgba(245,200,66,.45)":"1px solid var(--bd)",background:vari===i?"rgba(245,200,66,.05)":"var(--s1)",color:vari===i?"#f5c842":"var(--tx2)",fontSize:12.5,fontWeight:vari===i?600:400,cursor:"pointer",transition:"all .2s",fontFamily:"var(--fb)" }}>{v.l}</button>)}
          </div>
          <CodeEl code={VARS[vari].code} accent="#f5c842"/>
          <div style={{ display:"flex",gap:12,alignItems:"center",marginTop:14,marginBottom:14 }}>
            <Btn disabled={sR} bg="linear-gradient(135deg,#f5c842,#e09a2a)" onClick={()=>runO(VARS[vari].out,setSO,setSR)}>{sR?"Running...":"\u25B6 Run code"}</Btn>
            <span style={{ fontSize:11.5,color:"var(--dm)" }}>Predict first, then verify</span>
          </div>
          <OutEl lines={sO} running={sR} color="#f5c842"/>
          <Btn onClick={()=>go(3)} bg="linear-gradient(135deg,#00c4f0,#0099cc)" color="#fff" sx={{ marginTop:20 }}>I've explored enough &rarr;</Btn>
          <FloatingAI variant={vari} profile={orientAnswers}/>
        </div>}

        {/* REPRESENT */}
        {step===3 && <div className="fade-up" key="s_represent">
          <div style={{ fontSize:10.5,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#00c4f0",marginBottom:10 }}>Phase 04 &middot; Represent</div>
          <h2 style={{ fontFamily:"var(--fd)",fontSize:32,fontWeight:400,lineHeight:1.12,marginBottom:10,letterSpacing:"-0.01em" }}>Choose how you want to understand this</h2>
          <p style={{ fontSize:14,color:"var(--tx2)",lineHeight:1.75,marginBottom:20 }}>Pick the angle that makes it click. Try several and see which ones fit your thinking.</p>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24 }}>
            {[
              {k:"annotated",t:"Line-by-line",d:"Step-by-step code breakdown"},
              {k:"trace",t:"Trace table",d:"Watch variables change each step"},
              {k:"anim",t:"Animation",d:"Visual iteration walkthrough"},
              {k:"analogy",t:"Real-life analogy",d:"Everyday metaphor"},
              {k:"mindmap",t:"Concept map",d:"How key ideas connect"},
              {k:"compare",t:"With vs without",d:"Why loops exist"},
              {k:"video",t:"Video walkthrough",d:"Watch a full explanation"},
            ].map(r=>(
              <button key={r.k} onClick={()=>setSelR(r.k)} style={{ padding:"16px 14px",borderRadius:12,textAlign:"left",border:selR===r.k?"1.5px solid #00c4f0":"1px solid var(--bd)",background:selR===r.k?"rgba(0,196,240,.05)":"var(--s1)",cursor:"pointer",transition:"all .25s",fontFamily:"var(--fb)" }}
                onMouseEnter={e=>{if(selR!==r.k){e.currentTarget.style.borderColor="rgba(0,196,240,.25)";e.currentTarget.style.transform="translateY(-2px)";}}}
                onMouseLeave={e=>{if(selR!==r.k){e.currentTarget.style.borderColor="var(--bd)";e.currentTarget.style.transform="translateY(0)";}}}>
                <div style={{ fontSize:13,fontWeight:600,color:selR===r.k?"var(--tx)":"var(--tx2)",marginBottom:4 }}>{r.t}</div>
                <div style={{ fontSize:11.5,color:"var(--dm)",lineHeight:1.5 }}>{r.d}</div>
              </button>
            ))}
          </div>

          {selR==="annotated"&&<div className="fade-up" style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,196,240,.18)",marginBottom:18 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00c4f0",marginBottom:18,letterSpacing:".1em",textTransform:"uppercase" }}>Line-by-line breakdown</div>
            {[
              {c:'fruits = ["apple", "banana", "cherry"]',n:1,t:"Creates a list \u2014 an ordered container with three strings. The name 'fruits' is a label you choose."},
              {c:"for fruit in fruits:",n:2,t:"Loop declaration: take each element from 'fruits', one at a time, name it 'fruit', then run the indented code below. The colon marks the start of the loop body. The name 'fruit' is your choice \u2014 'for x in fruits:' works identically."},
              {c:"    print(fruit)",n:3,t:"print() displays the current value of 'fruit'. The 4-space indent is critical \u2014 it tells Python this line is inside the loop. No indent means not part of the loop."},
            ].map((x,i)=>(
              <div key={i} style={{ marginBottom:18,paddingBottom:18,borderBottom:i<2?"1px solid var(--bd)":"none" }}>
                <div style={{ fontFamily:"var(--fm)",fontSize:12.5,color:"var(--tx2)",padding:"9px 14px",background:"var(--s3)",borderRadius:7,marginBottom:10 }}>
                  <span style={{ color:"var(--muted)",marginRight:12 }}>{x.n}</span>{x.c}
                </div>
                <div style={{ fontSize:13,color:"var(--tx2)",lineHeight:1.8,paddingLeft:14,borderLeft:"2px solid rgba(0,196,240,.3)" }}>{x.t}</div>
              </div>
            ))}
            <div style={{ padding:"12px 16px",borderRadius:9,background:"rgba(0,196,240,.04)",fontSize:12.5,color:"var(--tx2)",lineHeight:1.65 }}>
              <strong style={{ color:"#00c4f0" }}>Key idea:</strong> The for loop repeats a block of code once for each item in a sequence. It stops when the list is exhausted.
            </div>
          </div>}

          {selR==="trace"&&<div className="fade-up" style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,196,240,.18)",marginBottom:18 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00c4f0",marginBottom:10,letterSpacing:".1em",textTransform:"uppercase" }}>Variable trace table</div>
            <p style={{ fontSize:12.5,color:"var(--dm)",marginBottom:16,lineHeight:1.6 }}>Track how each variable changes at every step of execution.</p>
            <TraceTable step={anS}/>
            <div style={{ display:"flex",gap:8,marginTop:16,alignItems:"center",flexWrap:"wrap" }}>
              <button onClick={()=>anP?anPlay():setAnP(true)} style={{ padding:"6px 14px",borderRadius:7,background:"rgba(0,196,240,.06)",border:"1px solid rgba(0,196,240,.22)",color:"#00c4f0",fontSize:11.5,cursor:"pointer",fontFamily:"var(--fb)" }}>{anP?"\u25B6 Play":"\u23F8 Pause"}</button>
              <button onClick={anStepF} style={{ padding:"6px 14px",borderRadius:7,background:"rgba(0,196,240,.06)",border:"1px solid rgba(0,196,240,.22)",color:"#00c4f0",fontSize:11.5,cursor:"pointer",fontFamily:"var(--fb)" }}>&#9197; Next</button>
              <button onClick={()=>{setSelR(null);setTimeout(()=>setSelR("trace"),80);}} style={{ padding:"6px 14px",borderRadius:7,background:"rgba(0,196,240,.06)",border:"1px solid rgba(0,196,240,.22)",color:"#00c4f0",fontSize:11.5,cursor:"pointer",fontFamily:"var(--fb)" }}>Restart</button>
              <span style={{ fontSize:11.5,color:"var(--dm)" }}>{anS===-1?"Ready":anS<3?`Iteration ${anS+1} of 3`:"Done"}</span>
            </div>
          </div>}

          {selR==="anim"&&<div className="fade-up" style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,196,240,.18)",marginBottom:18 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00c4f0",marginBottom:16,letterSpacing:".1em",textTransform:"uppercase" }}>Step-by-step animation</div>
            <div style={{ display:"flex",gap:28,flexWrap:"wrap",alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:10.5,color:"var(--dm)",marginBottom:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em" }}>fruits</div>
                <div style={{ display:"flex",gap:6 }}>
                  {["apple","banana","cherry"].map((f,i)=>(
                    <div key={f} style={{ padding:"12px 16px",borderRadius:8,textAlign:"center",background:anS===i?"rgba(0,196,240,.1)":"var(--s3)",border:anS===i?"1.5px solid #00c4f0":i<anS?"1.5px solid rgba(0,232,123,.3)":"1px solid var(--bd)",color:anS===i?"#00c4f0":i<anS?"rgba(0,232,123,.8)":"var(--muted)",fontFamily:"var(--fm)",fontSize:12.5,transition:"all .4s",transform:anS===i?"scale(1.08)":"scale(1)" }}>
                      "{f}"
                      {anS===i&&<div style={{ fontSize:9.5,color:"#00c4f0",marginTop:4 }}>&uarr; fruit</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:10.5,color:"var(--dm)",marginBottom:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em" }}>output</div>
                <div style={{ background:"var(--s3)",borderRadius:8,padding:"12px 16px",minWidth:110,minHeight:66,fontFamily:"var(--fm)",fontSize:12.5,lineHeight:2,border:"1px solid var(--bd)" }}>
                  {["apple","banana","cherry"].filter((_,i)=>i<=anS&&anS<4).map((f,i)=><div key={i} style={{ color:"#00c4f0" }}>{f}</div>)}
                </div>
              </div>
            </div>
            <div style={{ marginTop:14,fontSize:12.5,color:"var(--tx2)",lineHeight:1.6,minHeight:22 }}>
              {anS===-1&&"Starting..."}
              {anS===0&&'Iteration 1: fruit = "apple", then print(fruit)'}
              {anS===1&&'Iteration 2: fruit = "banana", then print(fruit)'}
              {anS===2&&'Iteration 3: fruit = "cherry", then print(fruit)'}
              {anS>=3&&"Loop complete \u2014 3 iterations."}
            </div>
            <div style={{ display:"flex",gap:8,marginTop:12,flexWrap:"wrap" }}>
              <button onClick={()=>anP?anPlay():setAnP(true)} style={{ padding:"6px 14px",borderRadius:7,background:"rgba(0,196,240,.06)",border:"1px solid rgba(0,196,240,.22)",color:"#00c4f0",fontSize:11.5,cursor:"pointer",fontFamily:"var(--fb)" }}>{anP?"\u25B6 Play":"\u23F8 Pause"}</button>
              <button onClick={anStepF} style={{ padding:"6px 14px",borderRadius:7,background:"rgba(0,196,240,.06)",border:"1px solid rgba(0,196,240,.22)",color:"#00c4f0",fontSize:11.5,cursor:"pointer",fontFamily:"var(--fb)" }}>&#9197; Step</button>
              <button onClick={()=>{setSelR(null);setTimeout(()=>setSelR("anim"),80);}} style={{ padding:"6px 14px",borderRadius:7,background:"rgba(0,196,240,.06)",border:"1px solid rgba(0,196,240,.22)",color:"#00c4f0",fontSize:11.5,cursor:"pointer",fontFamily:"var(--fb)" }}>Restart</button>
            </div>
          </div>}

          {selR==="analogy"&&<div className="fade-up" style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,196,240,.18)",marginBottom:18 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00c4f0",marginBottom:14,letterSpacing:".1em",textTransform:"uppercase" }}>The grocery bag</div>
            <div style={{ fontSize:13.5,color:"var(--tx2)",lineHeight:1.95 }}>
              <p>Imagine a bag with three items inside: apple, banana, cherry.</p>
              <p style={{ marginTop:12 }}><code style={{ color:"#00c4f0",background:"rgba(0,196,240,.06)",padding:"2px 8px",borderRadius:5,fontFamily:"var(--fm)",fontSize:12 }}>for fruit in fruits</code> means <strong style={{ color:"var(--tx)" }}>pull out one item at a time</strong>:</p>
              <div style={{ background:"var(--s3)",borderRadius:10,padding:"16px 20px",margin:"12px 0",lineHeight:2.2,fontSize:13,border:"1px solid var(--bd)" }}>
                Pull out "apple" &rarr; say it aloud (print)<br/>
                Pull out "banana" &rarr; say it aloud<br/>
                Pull out "cherry" &rarr; say it aloud<br/>
                Bag is empty &rarr; done
              </div>
              <p style={{ color:"var(--dm)",marginTop:10 }}><strong style={{ color:"#f5c842" }}>Key idea:</strong> the loop processes each item in order, one by one.</p>
            </div>
          </div>}

          {selR==="mindmap"&&<div className="fade-up" style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,196,240,.18)",marginBottom:18 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00c4f0",marginBottom:8,letterSpacing:".1em",textTransform:"uppercase" }}>Concept map</div>
            <p style={{ fontSize:12.5,color:"var(--dm)",marginBottom:16,lineHeight:1.55 }}>Read top to bottom: the syntax at the top breaks down into three core concepts, each with deeper details below.</p>
            <MindMap/>
          </div>}

          {selR==="compare"&&<div className="fade-up" style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,196,240,.18)",marginBottom:18 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00c4f0",marginBottom:14,letterSpacing:".1em",textTransform:"uppercase" }}>With vs without</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <div>
                <div style={{ fontSize:11.5,fontWeight:700,color:"#ff8a8a",marginBottom:6,letterSpacing:".05em" }}>Without loop</div>
                <pre style={{ fontFamily:"var(--fm)",fontSize:12,lineHeight:1.9,background:"var(--s3)",padding:"14px",borderRadius:8,color:"var(--tx2)",border:"1px solid rgba(255,107,107,.15)",whiteSpace:"pre-wrap" }}>{'fruits = ["apple","banana","cherry"]\nprint(fruits[0])\nprint(fruits[1])\nprint(fruits[2])\n# 1000 items = 1000 lines'}</pre>
              </div>
              <div>
                <div style={{ fontSize:11.5,fontWeight:700,color:"#00e87b",marginBottom:6,letterSpacing:".05em" }}>With loop</div>
                <pre style={{ fontFamily:"var(--fm)",fontSize:12,lineHeight:1.9,background:"var(--s3)",padding:"14px",borderRadius:8,color:"var(--tx2)",border:"1px solid rgba(0,232,123,.15)",whiteSpace:"pre-wrap" }}>{'fruits = ["apple","banana","cherry"]\nfor fruit in fruits:\n    print(fruit)\n# Works for any size'}</pre>
              </div>
            </div>
          </div>}

          {selR==="video"&&<div className="fade-up" style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,196,240,.18)",marginBottom:18 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00c4f0",marginBottom:14,letterSpacing:".1em",textTransform:"uppercase" }}>Video walkthrough</div>
            <p style={{ fontSize:12.5,color:"var(--dm)",marginBottom:14,lineHeight:1.6 }}>A full narrated walkthrough of the for-loop concept.</p>
            <div style={{ borderRadius:10,overflow:"hidden",border:"1px solid var(--bd)",background:"#000",position:"relative" }}>
              <video src="/video.mp4" controls playsInline style={{ width:"100%",display:"block",maxHeight:420 }}
                onError={e=>{e.target.style.display="none";if(e.target.nextSibling)e.target.nextSibling.style.display="flex";}}/>
              <div style={{ display:"none",width:"100%",height:180,background:"var(--s3)",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8 }}>
                <span style={{ color:"var(--dm)",fontSize:24 }}>&#9654;</span>
                <span style={{ color:"var(--muted)",fontSize:11 }}>Place video.mp4 in the public folder</span>
              </div>
            </div>
          </div>}

          {selR&&<Btn onClick={()=>go(4)} bg="linear-gradient(135deg,#a78bfa,#8b5cf6)" color="#fff" sx={{ marginTop:6 }}>Continue to reflect &rarr;</Btn>}
        </div>}

        {/* REFLECT */}
        {step===4 && <div className="fade-up" key="s_reflect">
          <div style={{ fontSize:10.5,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#a78bfa",marginBottom:10 }}>Phase 05 &middot; Reflect</div>
          <h2 style={{ fontFamily:"var(--fd)",fontSize:32,fontWeight:400,lineHeight:1.12,marginBottom:10,letterSpacing:"-0.01em" }}>Say it in your own words</h2>
          <p style={{ fontSize:14,color:"var(--tx2)",lineHeight:1.75,marginBottom:24 }}>Write what you understand now. The AI reads your reflection and asks one follow-up question to sharpen your thinking further.</p>
          <div style={{ background:"var(--s1)",borderRadius:14,padding:"26px 24px",border:"1px solid rgba(167,139,250,.2)",marginBottom:18 }}>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#a78bfa",marginBottom:8,letterSpacing:".1em",textTransform:"uppercase" }}>01 &middot; Prediction vs reality</div>
              <div style={{ padding:"12px 14px",borderRadius:8,background:"var(--s2)",border:"1px solid var(--bd)",fontSize:13,color:"var(--tx2)",lineHeight:1.65 }}>
                {pred==="correct"&&"You predicted correctly."}
                {pred==="list"&&"You predicted the whole list would print. Actually each item printed separately."}
                {pred==="last"&&"You predicted only the last item. Actually the loop ran for all three."}
                {pred==="error"&&"You predicted an error. Actually 'for' auto-defines the variable."}
                {useCust&&`Your prediction: "${custom}"`}
                {!pred&&!useCust&&"(none recorded)"}
              </div>
            </div>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#a78bfa",marginBottom:8,letterSpacing:".1em",textTransform:"uppercase" }}>02 &middot; Explain a for loop in your words</div>
              <textarea value={refl} onChange={e=>{setRefl(e.target.value);setReflFb("");}} placeholder="Explain to a friend who has never coded..." style={{ width:"100%",minHeight:100,padding:"12px 14px",borderRadius:9,background:"var(--s3)",border:"1px solid var(--bd)",color:"var(--tx)",fontSize:13,lineHeight:1.7,resize:"vertical",fontFamily:"var(--fb)" }}/>
              {refl.trim()&&!reflFb&&!reflLd&&<button onClick={evalRefl} style={{ marginTop:10,padding:"8px 18px",borderRadius:8,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.3)",color:"#a78bfa",fontSize:12.5,cursor:"pointer",fontWeight:600,fontFamily:"var(--fb)" }}>Get AI feedback</button>}
              {(reflLd||reflFb)&&<div className="fade-up" style={{ marginTop:12,background:"var(--s2)",borderRadius:10,padding:"16px 18px",border:"1px solid rgba(167,139,250,.22)" }}>
                <div style={{ fontSize:10.5,color:"#a78bfa",fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:".1em" }}>AI Feedback</div>
                {reflLd?<div style={{ color:"var(--dm)",fontSize:13 }}>Evaluating<span style={{ animation:"blink 1s step-end infinite" }}>...</span></div>:<div style={{ fontSize:13,color:"var(--tx2)",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{reflFb}</div>}
              </div>}
            </div>
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:"#a78bfa",marginBottom:8,letterSpacing:".1em",textTransform:"uppercase" }}>03 &middot; Which representation helped most?</div>
              <div style={{ fontSize:12.5,color:"var(--dm)",marginBottom:10,lineHeight:1.55 }}>Noticing how you learn best is a skill that improves over time.</div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {[{k:"annotated",l:"Line-by-line"},{k:"trace",l:"Trace"},{k:"anim",l:"Animation"},{k:"analogy",l:"Analogy"},{k:"mindmap",l:"Concept map"},{k:"compare",l:"Compare"},{k:"video",l:"Video"}].map(r=>
                  <button key={r.k} onClick={()=>setRepC(r.k)} style={{ padding:"7px 13px",borderRadius:8,border:repC===r.k?"1.5px solid #a78bfa":"1px solid var(--bd)",background:repC===r.k?"rgba(167,139,250,.05)":"var(--s2)",color:repC===r.k?"#a78bfa":"var(--tx2)",fontSize:12,cursor:"pointer",fontFamily:"var(--fb)",transition:"all .2s" }}>{r.l}</button>
                )}
              </div>
            </div>
          </div>
          <Btn disabled={!refl.trim()} bg="linear-gradient(135deg,#a78bfa,#00c4f0)" color="#fff" onClick={()=>go(5)}>Continue to extend &rarr;</Btn>
        </div>}

        {/* EXTEND */}
        {step===5 && <div className="fade-up" key="s_extend">
          <div style={{ fontSize:10.5,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#00d9ff",marginBottom:10 }}>Phase 06 &middot; Extend</div>
          <h2 style={{ fontFamily:"var(--fd)",fontSize:32,fontWeight:400,lineHeight:1.12,marginBottom:10,letterSpacing:"-0.01em" }}>Take it somewhere new</h2>
          <p style={{ fontSize:14,color:"var(--tx2)",lineHeight:1.75,marginBottom:24 }}>If you can apply the idea to something you have never seen before, the understanding is yours. One small transfer challenge, then a quick look at how this lesson connects to the rest.</p>

          <div style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,217,255,.18)",marginBottom:20 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00d9ff",marginBottom:14,letterSpacing:".1em",textTransform:"uppercase" }}>Transfer challenge</div>
            <p style={{ fontSize:13,color:"var(--tx2)",marginBottom:14,lineHeight:1.6 }}>What will this new code print?</p>
            <CodeEl code={"for i in range(5):\n    print(i * 2)"} accent="#00d9ff"/>
            {!transferSubm ? <div style={{ marginTop:16 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12 }}>
                {TRANSFER_PREDS.map(o=>(
                  <button key={o.id} onClick={()=>{setTransferPred(o.id);setTransferUseCust(false);}} style={{ padding:"13px 15px",borderRadius:10,textAlign:"left",border:transferPred===o.id&&!transferUseCust?"1.5px solid #00d9ff":"1px solid var(--bd)",background:transferPred===o.id&&!transferUseCust?"rgba(0,217,255,.05)":"var(--s2)",color:transferPred===o.id&&!transferUseCust?"var(--tx)":"var(--tx2)",fontSize:12.5,cursor:"pointer",fontFamily:"var(--fm)",transition:"all .2s" }}>{o.t}</button>
                ))}
              </div>
              <div style={{ padding:"14px 16px",borderRadius:10,marginBottom:14,border:transferUseCust?"1.5px solid #00d9ff":"1px solid var(--bd)",background:transferUseCust?"rgba(0,217,255,.04)":"var(--s2)",transition:"all .2s" }}>
                <div style={{ fontSize:11,color:transferUseCust?"#00d9ff":"var(--muted)",marginBottom:7,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase" }}>Or write your own prediction</div>
                <input value={transferCustom} onChange={e=>{setTransferCustom(e.target.value);setTransferUseCust(true);setTransferPred(null);}} onFocus={()=>{setTransferUseCust(true);setTransferPred(null);}} placeholder="What do you think will print?" style={{ width:"100%",padding:"9px 11px",borderRadius:7,background:"var(--s3)",border:"1px solid var(--bd)",color:"var(--tx)",fontSize:13,fontFamily:"var(--fb)" }}/>
              </div>
              <Btn disabled={!transferPred&&!transferCustom.trim()} bg="linear-gradient(135deg,#00d9ff,#0099cc)" color="#fff" onClick={()=>{setTransferSubm(true);runO(TRANSFER_OUT,setTransferOut,setTransferRun);}}>&#9654; Submit & run</Btn>
            </div> : <div style={{ marginTop:16 }}>
              <OutEl lines={transferOut} running={transferRun} color="#00d9ff"/>
              {!transferRun&&transferOut.length===TRANSFER_OUT.length&&<div className="fade-up" style={{ marginTop:14,borderRadius:12,padding:"16px 18px",background:transferUseCust?"rgba(0,217,255,.04)":(TRANSFER_FB[transferPred]?.ok?"rgba(0,232,123,.04)":"rgba(245,200,66,.04)"),border:transferUseCust?"1px solid rgba(0,217,255,.25)":(TRANSFER_FB[transferPred]?.ok?"1px solid rgba(0,232,123,.25)":"1px solid rgba(245,200,66,.25)") }}>
                {transferUseCust?<>
                  <div style={{ fontSize:13.5,fontWeight:600,marginBottom:7,color:"#00d9ff",fontFamily:"var(--fb)" }}>Actual output: 0, 2, 4, 6, 8</div>
                  <div style={{ fontSize:13,color:"var(--tx2)",lineHeight:1.7 }}>You wrote: "{transferCustom}". The loop iterates over range(5) &mdash; which gives 0 through 4 &mdash; and prints each value times 2. Same model as the fruits loop, just with a numeric iterable instead of a list.</div>
                </>:<>
                  <div style={{ fontSize:13.5,fontWeight:600,marginBottom:7,color:TRANSFER_FB[transferPred]?.ok?"#00e87b":"#f5c842",fontFamily:"var(--fb)" }}>{TRANSFER_FB[transferPred]?.ti}</div>
                  <div style={{ fontSize:13,color:"var(--tx2)",lineHeight:1.7 }}>{TRANSFER_FB[transferPred]?.bd}</div>
                </>}
              </div>}
            </div>}
          </div>

          <div style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,217,255,.18)",marginBottom:20 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00d9ff",marginBottom:8,letterSpacing:".1em",textTransform:"uppercase" }}>Where this lesson fits</div>
            <p style={{ fontSize:12.5,color:"var(--dm)",marginBottom:18,lineHeight:1.55 }}>On the left is what you have already built up. On the right is where for loops take you next.</p>
            <ConnectionMap/>
          </div>

          <div style={{ background:"var(--s1)",borderRadius:14,padding:"24px 22px",border:"1px solid rgba(0,217,255,.18)",marginBottom:20 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#00d9ff",marginBottom:8,letterSpacing:".1em",textTransform:"uppercase" }}>Learning journal (optional)</div>
            <p style={{ fontSize:12.5,color:"var(--dm)",marginBottom:12,lineHeight:1.55 }}>Leave blank if nothing comes to mind. This is just a scratchpad for you.</p>
            <textarea value={journalEntry} onChange={e=>setJournalEntry(e.target.value)} placeholder="Questions you still want to explore, connections you noticed, things you want to revisit..." style={{ width:"100%",minHeight:100,padding:"12px 14px",borderRadius:9,background:"var(--s3)",border:"1px solid var(--bd)",color:"var(--tx)",fontSize:13,lineHeight:1.7,resize:"vertical",fontFamily:"var(--fb)" }}/>
          </div>

          {!done ? <Btn bg="linear-gradient(135deg,#00d9ff,#00c4f0)" color="#050510" onClick={()=>setDone(true)}>Complete this lesson</Btn> : <>
            <Confetti/>
            <div className="completion-card" style={{ background:"linear-gradient(180deg,rgba(0,232,123,.06),rgba(0,196,240,.04))",border:"1px solid rgba(0,232,123,.28)",borderRadius:18,padding:"44px 32px",textAlign:"center",position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle at 50% 0%,rgba(0,232,123,.15),transparent 60%)",pointerEvents:"none" }}/>
              <div style={{ position:"relative",zIndex:1 }}>
                <div style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:100,background:"rgba(245,200,66,.1)",border:"1px solid rgba(245,200,66,.3)",fontSize:10,color:"#f5c842",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",marginBottom:18 }}>
                  <span style={{ width:5,height:5,borderRadius:"50%",background:"#f5c842",animation:"pulse 2s infinite" }}/>
                  Lesson Complete
                </div>
                <h2 style={{ fontFamily:"var(--fd)",fontSize:44,fontWeight:400,marginBottom:12,letterSpacing:"-0.01em",lineHeight:1.1 }}>
                  <em style={{ fontStyle:"italic",background:"linear-gradient(135deg,#00e87b,#00c4f0,#f5c842)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Congratulations!</em>
                </h2>
                <div style={{ fontSize:16,color:"var(--tx)",marginBottom:8,fontWeight:500 }}>You finished your first lesson.</div>
                <div style={{ fontSize:13.5,color:"var(--tx2)",lineHeight:1.75,maxWidth:440,margin:"0 auto 24px" }}>Every concept you understand this deeply is one you'll keep. Momentum is everything &mdash; don't stop now.</div>
                <div style={{ display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap" }}>
                  <button onClick={()=>setView("home")} style={{ padding:"11px 20px",borderRadius:10,background:"transparent",border:"1px solid var(--bd)",color:"var(--tx2)",cursor:"pointer",fontSize:13,fontFamily:"var(--fb)",fontWeight:500,transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--dm)";e.currentTarget.style.color="var(--tx)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bd)";e.currentTarget.style.color="var(--tx2)";}}>
                    &larr; Back to curriculum
                  </button>
                  <Btn bg="linear-gradient(135deg,#00e87b,#00c4f0)">Keep going: While loops &rarr;</Btn>
                </div>
              </div>
            </div>
          </>}
        </div>}
      </div>
    </div>
  );
}
