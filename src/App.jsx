import { useState, useEffect, useRef } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

function getApiKey() {
  try { return localStorage.getItem("cogito_api_key") || ""; } catch { return ""; }
}
function setApiKey(k) {
  try { localStorage.setItem("cogito_api_key", k); } catch {}
}

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
      if (r.status === 401) return "Invalid API key. Please check your key in settings (gear icon).";
      return `API error: ${err.error?.message || r.statusText}`;
    }
    const d = await r.json();
    return d.content?.[0]?.text || "Couldn't generate a response.";
  } catch (e) { return "AI unavailable: " + e.message; }
}

// ===== DATA =====
const CURRIC = [
  { mod: "Module 1: Foundations", wk: "Weeks 1\u20133", ls: [
    { t: "Variables & Data Types", s: "done", d: "Numbers, strings, booleans \u2014 how Python stores information" },
    { t: "Operators & Expressions", s: "done", d: "Math, comparison, and logical operations" },
    { t: "Lists, Tuples & Strings", s: "done", d: "Ordered collections and text manipulation" },
  ]},
  { mod: "Module 2: Control Flow", wk: "Weeks 4\u20136", ls: [
    { t: "For Loops", s: "cur", d: "Iterating over collections with for...in" },
    { t: "While Loops & Loop Control", s: "lock", d: "Conditional repetition, break, continue" },
    { t: "Conditionals & Branching", s: "lock", d: "if/elif/else decision trees" },
  ]},
  { mod: "Module 3: Functions & Structure", wk: "Weeks 7\u20139", ls: [
    { t: "Defining Functions", s: "lock", d: "Packaging reusable logic with def" },
    { t: "Parameters, Returns & Scope", s: "lock", d: "Inputs, outputs, and variable visibility" },
    { t: "Error Handling & Debugging", s: "lock", d: "try/except, reading tracebacks, debugging" },
  ]},
  { mod: "Module 4: Data & Projects", wk: "Weeks 10\u201312", ls: [
    { t: "Dictionaries & Sets", s: "lock", d: "Key-value pairs and unique collections" },
    { t: "File I/O & Data Processing", s: "lock", d: "Reading, writing, and transforming real data" },
    { t: "Capstone Project", s: "lock", d: "Build a complete program combining all concepts" },
  ]},
];

const STEPS = ["predict","struggle","represent","reflect"];
const SM = {
  predict:{e:"\u{1F52E}",l:"Predict",c:"#00ff88",th:"Productive Failure"},
  struggle:{e:"\u{1F9E9}",l:"Explore",c:"#ffbf00",th:"Active Learning"},
  represent:{e:"\u{1F3A8}",l:"Understand",c:"#63b3ff",th:"Multiple Representations"},
  reflect:{e:"\u{1F4AD}",l:"Reflect",c:"#a78bfa",th:"Metacognition"},
};

const PREDS = [
  {id:"correct",t:"Prints each fruit on its own line:\napple\nbanana\ncherry"},
  {id:"list",t:'Prints the whole list:\n["apple","banana","cherry"]'},
  {id:"last",t:"Only prints the last item:\ncherry"},
  {id:"error",t:"Throws an error because\n\'fruit\' is not defined"},
];
const PFB = {
  correct:{ok:true,ti:"Nice! Your prediction was correct.",bd:"Your intuition is solid \u2014 a for loop takes each element one at a time. Even correct predictions benefit from deeper exploration."},
  list:{ok:false,ti:"Not quite \u2014 but a great learning moment.",bd:"You expected print to output the entire list. That would happen with print(fruits). But a for loop unpacks the list and processes items one by one."},
  last:{ok:false,ti:"Interesting prediction \u2014 let's unpack it.",bd:"You thought only the last item would print. Actually, in each iteration 'fruit' gets reassigned AND print() runs each time. The loop executes the entire indented block repeatedly."},
  error:{ok:false,ti:"Reasonable concern \u2014 but Python handles this.",bd:"'for fruit in fruits:' itself defines the variable. Each iteration, Python assigns the next element to 'fruit' automatically."},
};

const VARS = [
  {k:"orig",l:"Original",code:'fruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)',out:["apple","banana","cherry"]},
  {k:"idx",l:"\u{1F522} With Index",code:'fruits = ["apple", "banana", "cherry"]\nfor i, fruit in enumerate(fruits):\n    print(f"{i}: {fruit}")',out:["0: apple","1: banana","2: cherry"]},
  {k:"flt",l:"\u{1F352} Skip Cherry",code:'fruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    if fruit != "cherry":\n        print(fruit)',out:["apple","banana"]},
  {k:"rev",l:"\u{1F504} Reverse",code:'fruits = ["apple", "banana", "cherry"]\nfor fruit in reversed(fruits):\n    print(fruit)',out:["cherry","banana","apple"]},
];

const FU="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap";

// ===== COMPONENTS =====
function CodeEl({code,accent="#00ff88"}){
  const kw=["for","in","if","def","return","while","else","elif","not","and","or"];
  const bi=["print","enumerate","reversed","range","len"];
  function hl(ln){const ps=[];let b="",iS=false,sc="";for(let i=0;i<ln.length;i++){const c=ln[i];if(iS){b+=c;if(c===sc){ps.push({t:b,k:"s"});b="";iS=false;}}else if(c==='"'||c==="'"){if(b){ps.push({t:b,k:"c"});b="";}b=c;iS=true;sc=c;}else b+=c;}if(b)ps.push({t:b,k:iS?"s":"c"});return ps.map((p,pi)=>{if(p.k==="s")return <span key={pi} style={{color:"#c3e88d"}}>{p.t}</span>;return p.t.split(/\b/).map((tok,ti)=>{if(kw.includes(tok))return <span key={`${pi}-${ti}`} style={{color:"#c792ea"}}>{tok}</span>;if(bi.includes(tok))return <span key={`${pi}-${ti}`} style={{color:"#82aaff"}}>{tok}</span>;return <span key={`${pi}-${ti}`}>{tok}</span>;});});}
  return(
    <div style={{background:"#0d1117",borderRadius:12,overflow:"hidden",border:`1px solid ${accent}20`}}>
      <div style={{padding:"8px 14px",borderBottom:"1px solid #1a1f2e",display:"flex",alignItems:"center",gap:7}}>
        {["#ff5f57","#febc2e","#28c840"].map((c,i)=><span key={i} style={{width:10,height:10,borderRadius:"50%",background:c,display:"inline-block"}}/>)}
        <span style={{fontSize:11,color:"#888",marginLeft:6,fontFamily:"'JetBrains Mono',monospace"}}>lesson.py</span>
      </div>
      <pre style={{padding:"16px 18px",margin:0,fontFamily:"'JetBrains Mono',monospace",fontSize:13,lineHeight:2,color:"#d4d4d4",overflowX:"auto"}}>
        {code.split("\n").map((l,i)=><div key={i}><span style={{color:"#667",marginRight:14,userSelect:"none",display:"inline-block",width:18,textAlign:"right"}}>{i+1}</span>{hl(l)}</div>)}
      </pre>
    </div>
  );
}

function OutEl({lines,running,color="#00ff88"}){return(
  <div style={{background:"#0a0a0f",borderRadius:10,padding:"12px 16px",border:"1px solid #1a1a2a",minHeight:46}}>
    <div style={{fontSize:10,color:"#888",marginBottom:5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"'JetBrains Mono',monospace"}}>output</div>
    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,lineHeight:1.9}}>
      {lines.map((l,i)=><div key={i} style={{color,animation:"slideIn .25s ease-out"}}>{l}</div>)}
      {running&&<span style={{color,animation:"blink 1s step-end infinite"}}>{"\u2588"}</span>}
      {!running&&lines.length===0&&<span style={{color:"#667",fontStyle:"italic"}}>Waiting...</span>}
    </div>
  </div>
);}

function Btn({children,onClick,disabled,bg,color="#08080f",sx={}}){
  return <button onClick={onClick} disabled={disabled} style={{padding:"10px 24px",borderRadius:10,border:"none",background:disabled?"#1a1a2a":bg,color:disabled?"#444":color,fontSize:13,fontWeight:700,cursor:disabled?"default":"pointer",transition:"all .2s",...sx}}>{children}</button>;
}

// Trace Table
function TraceTable({step:aS}){
  const rows=[
    {it:"Before loop",fruits:'["apple","banana","cherry"]',fruit:"\u2014",act:"\u2014",out:""},
    {it:"Iteration 1",fruits:'["apple","banana","cherry"]',fruit:'"apple"',act:'print("apple")',out:"apple"},
    {it:"Iteration 2",fruits:'["apple","banana","cherry"]',fruit:'"banana"',act:'print("banana")',out:"apple\nbanana"},
    {it:"Iteration 3",fruits:'["apple","banana","cherry"]',fruit:'"cherry"',act:'print("cherry")',out:"apple\nbanana\ncherry"},
    {it:"After loop",fruits:'["apple","banana","cherry"]',fruit:'"cherry" (last)',act:"\u2014 (ended)",out:"apple\nbanana\ncherry"},
  ];
  const hd=["Step","fruits","fruit","Action","Output"];
  const ks=["it","fruits","fruit","act","out"];
  return(<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'JetBrains Mono',monospace",fontSize:11.5}}>
    <thead><tr>{hd.map((h,i)=><th key={i} style={{padding:"10px 12px",textAlign:"left",color:"#63b3ff",borderBottom:"2px solid #63b3ff30",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
    <tbody>{rows.map((row,ri)=>{const vis=ri<=aS+1,act=ri===aS+1&&aS<4;if(!vis)return null;return(
      <tr key={ri} style={{animation:"slideIn .3s ease-out",background:act?"#63b3ff08":"transparent"}}>
        {ks.map((k,ki)=><td key={ki} style={{padding:"10px 12px",borderBottom:"1px solid #141420",color:act?(ki===2?"#63b3ff":ki===3?"#82aaff":"#bbb"):"#666",fontWeight:act?600:400,whiteSpace:k==="out"?"pre-wrap":"nowrap",verticalAlign:"top"}}>{row[k]}</td>)}
      </tr>);})}</tbody>
  </table></div>);
}

// ★ IMPROVED Mind Map - clear top-down hierarchy with labeled arrows
function MindMap(){
  // Layout: top-down tree. Root at top, branches below.
  const w=600, h=400;
  // Nodes
  const nodes = [
    // Level 0 - root
    { x:300, y:40, label:"for fruit in fruits:", col:"#63b3ff", w:200, h:34, fontSize:13, bold:true },
    // Level 1 - three main parts
    { x:100, y:140, label:"The Collection", col:"#00ff88", w:140, h:30, fontSize:11, bold:true },
    { x:300, y:140, label:"The Loop Variable", col:"#a78bfa", w:160, h:30, fontSize:11, bold:true },
    { x:500, y:140, label:"The Loop Body", col:"#ffbf00", w:140, h:30, fontSize:11, bold:true },
    // Level 2 - details
    { x:100, y:220, label:'fruits = ["apple",...]', col:"#00ff88", w:160, h:26, fontSize:10, bold:false },
    { x:300, y:220, label:"fruit changes each\niteration", col:"#a78bfa", w:160, h:38, fontSize:10, bold:false },
    { x:500, y:220, label:"print(fruit)\nruns every time", col:"#ffbf00", w:140, h:38, fontSize:10, bold:false },
    // Level 3 - how it works
    { x:100, y:310, label:"Any iterable:\nlist, string, range...", col:"#00ff8880", w:150, h:38, fontSize:10, bold:false },
    { x:300, y:310, label:"Auto-assigned by\nPython each cycle", col:"#a78bfa80", w:160, h:38, fontSize:10, bold:false },
    { x:500, y:310, label:"Must be indented\n(4 spaces)", col:"#ffbf0080", w:140, h:38, fontSize:10, bold:false },
  ];
  // Edges with labels
  const edges = [
    { from:0, to:1, label:"iterates over" },
    { from:0, to:2, label:"assigns to" },
    { from:0, to:3, label:"executes" },
    { from:1, to:4, label:"" },
    { from:2, to:5, label:"" },
    { from:3, to:6, label:"" },
    { from:4, to:7, label:"" },
    { from:5, to:8, label:"" },
    { from:6, to:9, label:"" },
  ];

  return(
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",maxWidth:580,display:"block",margin:"0 auto"}}>
      <defs>
        <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#334"/>
        </marker>
      </defs>
      {/* Edges */}
      {edges.map((e,i) => {
        const f = nodes[e.from], t = nodes[e.to];
        const fy = f.y + f.h/2, ty = t.y - t.h/2;
        const mx = (f.x + t.x)/2, my = (fy + ty)/2;
        return(
          <g key={i}>
            <line x1={f.x} y1={fy} x2={t.x} y2={ty} stroke="#1a2a3a" strokeWidth={1.5} markerEnd="url(#arrowhead)"/>
            {e.label && <text x={mx + (f.x < t.x ? 8 : f.x > t.x ? -8 : 0)} y={my} textAnchor="middle" fill="#3a4a5a" fontSize={9} fontFamily="'DM Sans',sans-serif" fontStyle="italic">{e.label}</text>}
          </g>
        );
      })}
      {/* Nodes */}
      {nodes.map((n,i) => {
        const lines = n.label.split("\n");
        return(
          <g key={i}>
            <rect x={n.x - n.w/2} y={n.y - n.h/2} width={n.w} height={n.h} rx={8}
              fill={`${n.col}10`} stroke={n.col} strokeWidth={i===0?2:1}/>
            {lines.map((line,li) => (
              <text key={li} x={n.x} y={n.y + (li - (lines.length-1)/2) * 13}
                textAnchor="middle" dominantBaseline="central"
                fill={n.col} fontSize={n.fontSize} fontWeight={n.bold?700:400}
                fontFamily={i===0||i>=4?"'JetBrains Mono',monospace":"'DM Sans',sans-serif"}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
      {/* Reading guide */}
      <text x={20} y={h-10} fill="#222" fontSize={9} fontFamily="'DM Sans',sans-serif">{"\u2193"} Read top to bottom: syntax {"\u2192"} concepts {"\u2192"} details</text>
    </svg>
  );
}

// ★ CUTE Floating AI with animated code-face
function FloatingAI({variant}){
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
    const sys=`You are a friendly Python tutor helping an absolute beginner. Current code:\n\n${v.code}\n\nOutput: ${v.out.join("\\n")}\n\nRules: Give clear, helpful explanations with examples. Keep responses concise (3-5 sentences). Be warm and encouraging.`;
    const resp=await askAI(sys,nm.map(m=>({role:m.role,content:m.content})));
    setMsgs(p=>[...p,{role:"assistant",content:resp}]);setLoading(false);
  }

  // Static wink face - no rapid blinking
  const face = "{ > \u203F \u00B0 }";
  const thinkFace = "{ \u2013 _ \u2013 }";

  return(<>
    {/* Floating mascot button */}
    {!open&&<div style={{position:"fixed",bottom:24,right:24,zIndex:1000,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
      {/* Speech bubble */}
      {msgs.length===0&&<div style={{
        padding:"8px 14px",borderRadius:"12px 12px 4px 12px",
        background:"linear-gradient(135deg,#0d1a2e,#121830)",
        border:"1px solid #1a3050",fontSize:11.5,color:"#6b8ab8",
        boxShadow:"0 4px 20px rgba(0,0,0,0.3)",animation:"fadeUp .6s ease-out",
        maxWidth:180,lineHeight:1.5,
      }}>Stuck on something? Tap me! {"\u2728"}</div>}
      {/* The mascot */}
      <button onClick={()=>setOpen(true)} style={{
        width:80,height:52,borderRadius:16,border:"none",cursor:"pointer",
        background:"linear-gradient(135deg,#0d1a2e,#1a2540)",
        boxShadow:"0 4px 24px rgba(59,130,246,0.25), 0 0 0 1px rgba(59,130,246,0.15)",
        display:"flex",alignItems:"center",justifyContent:"center",
        transition:"all .3s",position:"relative",whiteSpace:"nowrap",
      }}
      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 4px 30px rgba(59,130,246,0.4), 0 0 0 1px rgba(59,130,246,0.3)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(59,130,246,0.25), 0 0 0 1px rgba(59,130,246,0.15)";}}
      >
        <span style={{
          fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#3b82f6",fontWeight:700,
          whiteSpace:"nowrap",
        }}>{face}</span>
      </button>
    </div>}

    {/* Chat Panel */}
    {open&&<div style={{
      position:"fixed",bottom:24,right:24,zIndex:1000,
      width:360,height:440,borderRadius:18,overflow:"hidden",
      background:"linear-gradient(180deg,#0a0e14,#0c1018)",
      border:"1px solid #1a2a40",
      boxShadow:"0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(59,130,246,0.08)",
      display:"flex",flexDirection:"column",animation:"fadeUp .3s ease-out",
    }}>
      <div style={{padding:"14px 16px",borderBottom:"1px solid #142030",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#3b82f6",fontWeight:700}}>{face}</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"#b0c8e0"}}>AI Tutor</div>
            <div style={{fontSize:10,color:"#889"}}>Ask anything about the code</div>
          </div>
        </div>
        <button onClick={()=>setOpen(false)} style={{background:"#ffffff06",border:"1px solid #1a2535",borderRadius:8,color:"#99a",cursor:"pointer",fontSize:16,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>{"\u00D7"}</button>
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.length===0&&<div style={{fontSize:12,color:"#b0c0d0",textAlign:"center",marginTop:50,lineHeight:2}}>
          <span style={{fontSize:28,display:"block",marginBottom:8}}>{"{ \u00B0 _ \u00B0 }"}</span>
          Hi! Ask me about the code.<br/><span style={{color:"#99aabb"}}>e.g. "What does enumerate do?"</span>
        </div>}
        {msgs.map((m,i)=>(
          <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?"#1a3050":"#111828",border:m.role==="user"?"1px solid #1a4070":"1px solid #1a2535",fontSize:12.5,color:m.role==="user"?"#b0c8e8":"#8899b0",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.content}</div>
        ))}
        {loading&&<div style={{alignSelf:"flex-start",padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:"#111828",border:"1px solid #1a2535",fontSize:12.5,color:"#99a"}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace"}}>{thinkFace}</span> thinking<span style={{animation:"blink 1s step-end infinite"}}>...</span>
        </div>}
      </div>
      <div style={{padding:"12px",borderTop:"1px solid #142030",display:"flex",gap:8,flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask a question..."
          style={{flex:1,padding:"10px 14px",borderRadius:12,background:"#060810",border:"1px solid #1a2535",color:"#e0e0ea",fontSize:12.5,fontFamily:"'DM Sans',sans-serif"}}/>
        <button disabled={!input.trim()||loading} onClick={send} style={{padding:"10px 16px",borderRadius:12,border:"none",background:!input.trim()||loading?"#1a1a2a":"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff",fontSize:13,fontWeight:700,cursor:!input.trim()||loading?"default":"pointer"}}>{"\u2191"}</button>
      </div>
    </div>}
  </>);
}

// ===== MAIN =====
export default function App(){
  const[view,setView]=useState("home");
  const[step,setStep]=useState(0);
  const[maxS,setMaxS]=useState(0);
  const[pred,setPred]=useState(null);
  const[custom,setCustom]=useState("");
  const[useCust,setUseCust]=useState(false);
  const[subm,setSubm]=useState(false);
  const[oL,setOL]=useState([]);
  const[oR,setOR]=useState(false);
  const[showFb,setShowFb]=useState(false);
  const[aiFb,setAiFb]=useState("");
  const[aiLd,setAiLd]=useState(false);
  const[vari,setVari]=useState(0);
  const[sO,setSO]=useState([]);
  const[sR,setSR]=useState(false);
  const[selR,setSelR]=useState(null);
  const[anS,setAnS]=useState(-1);
  const[anP,setAnP]=useState(false);
  const anRef=useRef(null);
  const[refl,setRefl]=useState("");
  const[repC,setRepC]=useState(null);
  const[done,setDone]=useState(false);
  const[reflFb,setReflFb]=useState("");
  const[reflLd,setReflLd]=useState(false);
  const[showSettings,setShowSettings]=useState(false);
  const[keyInput,setKeyInput]=useState(getApiKey());
  const[keySaved,setKeySaved]=useState(!!getApiKey());

  function runO(arr,sL,sR,cb){sR(true);sL([]);arr.forEach((l,i)=>{setTimeout(()=>{sL(p=>[...p,l]);if(i===arr.length-1){sR(false);if(cb)setTimeout(cb,500);}},((i+1)*420));});}
  function go(s){setStep(s);if(s>maxS)setMaxS(s);setSO([]);setSR(false);}

  useEffect(()=>{
    if(selR==="trace"||selR==="anim"){setAnS(-1);setAnP(false);let idx=0;anRef.current=setInterval(()=>{setAnS(idx);idx++;if(idx>3)clearInterval(anRef.current);},2200);return()=>clearInterval(anRef.current);}
  },[selR]);
  useEffect(()=>{if(anP&&anRef.current)clearInterval(anRef.current);},[anP]);
  function anPlay(){if(anS>=3){setSelR(null);setTimeout(()=>setSelR(selR),80);return;}setAnP(false);let idx=anS+1;anRef.current=setInterval(()=>{setAnS(idx);idx++;if(idx>3)clearInterval(anRef.current);},2200);}
  function anStepF(){setAnP(true);if(anS<3)setAnS(p=>p+1);}

  async function analyzeCustom(){setAiLd(true);const sys=`You are a Python tutor for beginners learning for loops. Code:\n\nfruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)\n\nOutput: apple, banana, cherry (each on separate line). Analyze the student's prediction in 3-4 sentences: mental model, validate reasoning, explain divergence, warm correction.`;const r=await askAI(sys,[{role:"user",content:`My prediction: ${custom}`}]);setAiFb(r);setAiLd(false);}
  async function evalRefl(){setReflLd(true);const sys=`Evaluate a beginner's for loop explanation. 3-4 sentences: what's right (specific), what's missing, suggestion, encouragement. Warm and constructive.`;const r=await askAI(sys,[{role:"user",content:`My explanation:\n\n${refl}`}]);setReflFb(r);setReflLd(false);}

  const CSS=`@import url('${FU}');
@keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes glow{0%,100%{box-shadow:0 0 15px #00ff8812}50%{box-shadow:0 0 30px #00ff8820}}
*{box-sizing:border-box;margin:0;padding:0}html,body{background:#08080f}
textarea:focus,button:focus,input:focus{outline:none}button{font-family:'DM Sans',sans-serif}
.fade-up{animation:fadeUp .4s ease-out}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#222;border-radius:3px}
input::placeholder,textarea::placeholder{color:#3a3a4a}`;

  // ===== HOME =====
  if(view==="home")return(
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh",background:"#08080f",color:"#e0e0ea"}}>
      <style>{CSS}</style>
      
      {showSettings&&<div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)"}}>
        <div style={{background:"#0d0d16",borderRadius:16,padding:"28px",width:380,border:"1px solid #1a1a2a",boxShadow:"0 8px 40px rgba(0,0,0,0.5)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:15,fontWeight:700}}>{"⚙️"} Settings</div>
            <button onClick={()=>setShowSettings(false)} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:18}}>{"×"}</button>
          </div>
          <div style={{fontSize:12,color:"#999",marginBottom:8,lineHeight:1.6}}>Enter your Claude API key to enable AI features. Your key is stored locally in your browser only.</div>
          <input value={keyInput} onChange={e=>setKeyInput(e.target.value)} type="password"
            placeholder="sk-ant-api03-..." style={{width:"100%",padding:"10px 12px",borderRadius:8,background:"#08080f",border:"1px solid #1a1a2a",color:"#e0e0ea",fontSize:13,fontFamily:"'JetBrains Mono',monospace",marginBottom:12}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setApiKey(keyInput);setKeySaved(true);setShowSettings(false);}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#00ff88,#00cc88)",color:"#08080f",fontWeight:700,fontSize:13,cursor:"pointer"}}>Save Key</button>
            {keySaved&&<button onClick={()=>{setApiKey("");setKeyInput("");setKeySaved(false);}} style={{padding:"10px 16px",borderRadius:8,border:"1px solid #ff6b6b30",background:"#ff6b6b08",color:"#ff6b6b",fontSize:12,cursor:"pointer"}}>Clear</button>}
          </div>
          {keySaved&&<div style={{marginTop:10,fontSize:11,color:"#00ff88"}}>{"✓"} API key saved</div>}
        </div>
      </div>}
      <div style={{padding:"44px 24px 36px",maxWidth:720,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:0}}>
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" style={{marginRight:-2}}>
              <defs><linearGradient id="lgMain" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stopColor="#00ff88"/><stop offset="100%" stopColor="#00bbff"/></linearGradient></defs>
              <circle cx="28" cy="28" r="18" stroke="url(#lgMain)" strokeWidth="5" fill="none" strokeDasharray="85 28" strokeDashoffset="-8" strokeLinecap="round"/>
              <circle cx="49" cy="20" r="7" stroke="url(#lgMain)" strokeWidth="3.5" fill="none" opacity="0.8"/>
              <circle cx="44" cy="14" r="2" fill="url(#lgMain)" opacity="0.4"/>
            </svg>
            <span style={{fontSize:28,fontWeight:700,letterSpacing:"-0.03em",color:"#e0e0ea"}}>gito</span>
          </div>
          <div style={{fontSize:11,color:"#999",marginLeft:6}}>I think, therefore I learn</div>
          <button onClick={()=>setShowSettings(true)} style={{width:32,height:32,borderRadius:8,background:keySaved?"#00ff8808":"#ff6b6b08",border:keySaved?"1px solid #00ff8820":"1px solid #ff6b6b20",color:keySaved?"#00ff88":"#ff6b6b",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}} title="API Key Settings">{"⚙"}</button>
        </div>
        <h1 style={{fontSize:28,fontWeight:700,lineHeight:1.3,letterSpacing:"-0.03em",marginBottom:8}}>Python Fundamentals</h1>
        <p style={{fontSize:14,color:"#999",lineHeight:1.7,maxWidth:540}}>An interactive learning environment grounded in Learning Sciences research.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:22,marginBottom:36}}>
          {[{i:"\u{1F52E}",l:"Predict first",d:"Your existing intuitions are the starting point for learning"},{i:"\u{1F9E9}",l:"Explore freely",d:"Hands-on experimentation builds flexible understanding"},{i:"\u{1F3A8}",l:"Choose your lens",d:"Multiple representations support diverse thinking styles"},{i:"\u{1F4AD}",l:"Reflect and grow",d:"Self-explanation consolidates understanding"}].map((p,i)=>(
            <div key={i} style={{padding:"12px 14px",borderRadius:10,background:"#0d0d16",border:"1px solid #181824"}}>
              <div style={{fontSize:18,marginBottom:5}}>{p.i}</div><div style={{fontSize:12,fontWeight:600,marginBottom:2,color:"#ccc"}}>{p.l}</div><div style={{fontSize:10.5,color:"#777",lineHeight:1.5}}>{p.d}</div>
            </div>))}
        </div>
        <h2 style={{fontSize:16,fontWeight:700,marginBottom:14}}>Course Curriculum</h2>
        {CURRIC.map((m,mi)=>(
          <div key={mi} style={{marginBottom:22}}>
            <div style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:8}}><span style={{fontSize:13,fontWeight:700}}>{m.mod}</span><span style={{fontSize:11,color:"#777"}}>{m.wk}</span></div>
            {m.ls.map((l,li)=>{const cur=l.s==="cur",dn=l.s==="done",lk=l.s==="lock";return(
              <button key={li} onClick={()=>cur&&setView("lesson")} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"11px 14px",borderRadius:9,marginBottom:4,textAlign:"left",background:cur?"#00ff8808":"#0d0d16",border:cur?"1.5px solid #00ff8835":"1px solid #181824",cursor:cur?"pointer":"default",opacity:lk?0.35:1,animation:cur?"glow 3s ease-in-out infinite":"none"}}>
                <div style={{width:28,height:28,borderRadius:7,flexShrink:0,background:dn?"#00ff8812":"#0d0d16",border:dn?"1.5px solid #00ff8840":cur?"1.5px solid #00ff8830":"1px solid #1a1a2a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:dn||cur?"#00ff88":"#444"}}>{dn?"\u2713":lk?"\u{1F512}":"\u2192"}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:cur?600:500,color:cur?"#e8e8f0":dn?"#a0a0a8":"#777"}}>{l.t}{cur&&<span style={{marginLeft:8,fontSize:9,padding:"2px 7px",borderRadius:20,background:"#00ff8815",color:"#00ff88",fontWeight:700}}>CURRENT</span>}</div><div style={{fontSize:11,color:cur?"#888":dn?"#666":"#555",marginTop:1}}>{l.d}</div></div>
              </button>);})}
          </div>))}
        <div style={{marginTop:16,padding:"14px 16px",borderRadius:10,background:"#0d0d16",border:"1px solid #181824"}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Design Philosophy</div>
          <div style={{fontSize:11.5,color:"#888",lineHeight:1.8}}>Each lesson follows <strong style={{color:"#bbb"}}>Predict {"\u2192"} Explore {"\u2192"} Represent {"\u2192"} Reflect</strong>, a four-step cycle grounded in Productive Failure (Kapur & Bielaczyc, 2012), Multiple Representations (Ainsworth, 2006), Self-Regulated Learning (J{"\u00E4"}rvel{"\u00E4"} et al., 2018), and Conceptual Change research (diSessa, 2022).</div>
        </div>
      </div>
    </div>
  );

  // ===== LESSON =====
  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh",background:"#08080f",color:"#e0e0ea"}}>
      <style>{CSS}</style>
      <div style={{padding:"9px 18px",borderBottom:"1px solid #131320",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0a0a10"}}>
        <button onClick={()=>setView("home")} style={{display:"flex",alignItems:"center",gap:7,background:"none",border:"none",color:"#999",cursor:"pointer",fontSize:12}}>
          <svg width="22" height="16" viewBox="0 0 200 56" fill="none"><defs><linearGradient id="lgSm" x1="0" y1="0" x2="200" y2="56"><stop offset="0%" stopColor="#00ff88"/><stop offset="100%" stopColor="#00bbff"/></linearGradient></defs><circle cx="20" cy="24" r="14" stroke="url(#lgSm)" strokeWidth="4.5" fill="none" strokeDasharray="66 22" strokeDashoffset="-6" strokeLinecap="round"/><circle cx="37" cy="15" r="5" stroke="url(#lgSm)" strokeWidth="3" fill="none" opacity="0.75"/><circle cx="33.5" cy="10.5" r="2" fill="url(#lgSm)" opacity="0.35"/></svg>{"\u2190"} Curriculum
        </button>
        <span style={{fontSize:11,color:"#888",fontFamily:"'JetBrains Mono',monospace"}}>Module 2 {"\u00B7"} For Loops</span>
      </div>
      <div style={{padding:"10px 18px",display:"flex",gap:4,borderBottom:"1px solid #101018"}}>
        {STEPS.map((s,i)=>{const m=SM[s],a=i===step,ok=i<=maxS;return(
          <button key={s} onClick={()=>ok&&go(i)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:a?`${m.c}0A`:"transparent",borderBottom:a?`2px solid ${m.c}`:"2px solid transparent",color:a?m.c:ok?"#555":"#2a2a35",fontSize:12.5,fontWeight:a?600:400,cursor:ok?"pointer":"default"}}>
            {m.e} {m.l}{a&&<div style={{fontSize:9,color:`${m.c}70`,marginTop:1}}>{m.th}</div>}
          </button>);})}
      </div>
      <div style={{maxWidth:700,margin:"0 auto",padding:"22px 18px 48px"}}>

        {/* PREDICT */}
        {step===0&&<div className="fade-up" key="s0">
          <h2 style={{fontSize:18,fontWeight:700,marginBottom:5}}>What do you think this code will do?</h2>
          <p style={{fontSize:13,color:"#999",lineHeight:1.7,marginBottom:18}}>Making a prediction activates your prior knowledge and prepares your mind for deeper understanding (Kapur, 2012).</p>
          <CodeEl code={'fruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)'} accent="#00ff88"/>
          <div style={{marginTop:20}}>
            {!subm?<>
              <div style={{fontSize:12,fontWeight:600,color:"#00ff88",marginBottom:10}}>Choose your prediction:</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
                {PREDS.map(o=><button key={o.id} onClick={()=>{setPred(o.id);setUseCust(false);}} style={{padding:"12px 13px",borderRadius:9,textAlign:"left",border:pred===o.id&&!useCust?"1.5px solid #00ff88":"1.5px solid #1a1a2a",background:pred===o.id&&!useCust?"#00ff8808":"#0b0b14",color:pred===o.id&&!useCust?"#ccc":"#666",fontSize:12,cursor:"pointer",whiteSpace:"pre-line",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.5}}>{o.t}</button>)}
              </div>
              <div style={{padding:"12px 14px",borderRadius:9,marginBottom:14,border:useCust?"1.5px solid #3b82f6":"1.5px solid #1a1a2a",background:useCust?"#3b82f608":"#0b0b14"}}>
                <div style={{fontSize:12,fontWeight:600,color:useCust?"#3b82f6":"#555",marginBottom:8}}>{"\u{1F4AC}"} I have a different prediction:</div>
                <input value={custom} onChange={e=>{setCustom(e.target.value);setUseCust(true);setPred(null);}} onFocus={()=>{setUseCust(true);setPred(null);}} placeholder="Type what you think will happen..." style={{width:"100%",padding:"8px 12px",borderRadius:6,background:"#08080f",border:"1px solid #1a1a2a",color:"#e0e0ea",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}/>
              </div>
              <Btn disabled={!pred&&!custom.trim()} bg="linear-gradient(135deg,#00ff88,#00cc88)" onClick={()=>{setSubm(true);runO(["apple","banana","cherry"],setOL,setOR,()=>{if(useCust&&custom.trim())analyzeCustom();setShowFb(true);});}}>{"\u25B6"} Submit Prediction & Run</Btn>
            </>:<>
              <OutEl lines={oL} running={oR} color="#00ff88"/>
              {showFb&&!useCust&&pred&&(()=>{const fb=PFB[pred];return(
                <div className="fade-up" style={{marginTop:14,borderRadius:11,padding:"16px 18px",background:fb.ok?"#00ff8806":"#ffbf0006",border:fb.ok?"1px solid #00ff8820":"1px solid #ffbf0020"}}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:6,color:fb.ok?"#00ff88":"#ffbf00"}}>{fb.ok?"\u2728 ":"\u{1F914} "}{fb.ti}</div>
                  <div style={{fontSize:13,color:"#999",lineHeight:1.8}}>{fb.bd}</div>
                  {!fb.ok&&<div style={{marginTop:10,padding:"8px 12px",borderRadius:7,background:"#ffffff03",fontSize:11.5,color:"#888",lineHeight:1.6,fontStyle:"italic"}}>Research: wrong predictions lead to better retention (Kapur & Bielaczyc, 2012).</div>}
                  <Btn onClick={()=>go(1)} bg="linear-gradient(135deg,#ffbf00,#ff9500)" sx={{marginTop:14}}>Continue {"\u2192"}</Btn>
                </div>);})()}
              {showFb&&useCust&&<div className="fade-up" style={{marginTop:14}}>
                <div style={{background:"#0e1a2e",borderRadius:12,padding:"14px 18px",border:"1px solid #1a3050"}}>
                  <div style={{fontSize:10,color:"#3b82f6",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>{"\u{1F916}"} AI Analysis</div>
                  {aiLd?<div style={{color:"#999",fontSize:13}}>Analyzing<span style={{animation:"blink 1s step-end infinite"}}>...</span></div>:<div style={{fontSize:13,color:"#b0c8e0",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiFb}</div>}
                </div>
                {!aiLd&&aiFb&&<Btn onClick={()=>go(1)} bg="linear-gradient(135deg,#ffbf00,#ff9500)" sx={{marginTop:14}}>Continue {"\u2192"}</Btn>}
              </div>}
            </>}
          </div>
        </div>}

        {/* STRUGGLE */}
        {step===1&&<div className="fade-up" key="s1">
          <h2 style={{fontSize:18,fontWeight:700,marginBottom:5}}>Explore: What happens when you change the code?</h2>
          <p style={{fontSize:13,color:"#999",lineHeight:1.7,marginBottom:16}}>Experiment freely with variations. When you need guidance, the AI tutor is here to help.</p>
          <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
            {VARS.map((v,i)=><button key={v.k} onClick={()=>{setVari(i);setSO([]);setSR(false);}} style={{padding:"6px 13px",borderRadius:7,border:"none",background:vari===i?"#ffbf000A":"#0b0b14",border:vari===i?"1.5px solid #ffbf0038":"1.5px solid #1a1a2a",color:vari===i?"#ffbf00":"#555",fontSize:12.5,fontWeight:vari===i?600:400,cursor:"pointer"}}>{v.l}</button>)}
          </div>
          <CodeEl code={VARS[vari].code} accent="#ffbf00"/>
          <div style={{display:"flex",gap:8,alignItems:"center",marginTop:12,marginBottom:12}}>
            <Btn disabled={sR} bg="linear-gradient(135deg,#ffbf00,#ff9500)" onClick={()=>runO(VARS[vari].out,setSO,setSR)}>{sR?"Running...":"\u25B6 Run Code"}</Btn>
            <span style={{fontSize:11,color:"#888"}}>Predict first, then verify</span>
          </div>
          <OutEl lines={sO} running={sR} color="#ffbf00"/>
          <Btn onClick={()=>go(2)} bg="linear-gradient(135deg,#63b3ff,#3b82f6)" color="#fff" sx={{marginTop:16}}>I've explored enough {"\u2192"}</Btn>
          <FloatingAI variant={vari}/>
        </div>}

        {/* REPRESENT */}
        {step===2&&<div className="fade-up" key="s2">
          <h2 style={{fontSize:18,fontWeight:700,marginBottom:5}}>Choose how you want to understand this</h2>
          <p style={{fontSize:13,color:"#999",lineHeight:1.7,marginBottom:16}}>Choose the representation that resonates with how you think. Different learners benefit from different perspectives (Ainsworth, 2006).</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
            {[
              {k:"annotated",i:"\u{1F4DD}",t:"Line-by-Line",d:"Step-by-step code breakdown"},
              {k:"trace",i:"\u{1F4CA}",t:"Trace Table",d:"Watch variables change each step"},
              {k:"anim",i:"\u{1F3AC}",t:"Animation",d:"Visual iteration walkthrough"},
              {k:"analogy",i:"\u{1F9FA}",t:"Real-Life Analogy",d:"Everyday metaphor"},
              {k:"mindmap",i:"\u{1F578}",t:"Concept Map",d:"How key ideas connect"},
              {k:"compare",i:"\u{1F504}",t:"With vs Without",d:"Why loops exist"},
            ].map(r=>(
              <button key={r.k} onClick={()=>setSelR(r.k)} style={{padding:"14px 10px",borderRadius:11,textAlign:"left",border:selR===r.k?"1.5px solid #63b3ff":"1.5px solid #1a1a2a",background:selR===r.k?"#63b3ff08":"#0b0b14",cursor:"pointer"}}>
                <div style={{fontSize:20,marginBottom:5}}>{r.i}</div><div style={{fontSize:12,fontWeight:600,color:selR===r.k?"#e0e0ea":"#999",marginBottom:2}}>{r.t}</div><div style={{fontSize:10.5,color:"#888"}}>{r.d}</div>
              </button>))}
          </div>

          {/* LINE-BY-LINE */}
          {selR==="annotated"&&<div className="fade-up" style={{background:"#0b0b14",borderRadius:13,padding:"20px",border:"1px solid #63b3ff18",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#63b3ff",marginBottom:14}}>{"\u{1F4DD}"} Line-by-Line Breakdown</div>
            {[
              {c:'fruits = ["apple", "banana", "cherry"]',n:1,t:"Creates a list \u2014 an ordered container with three strings. The name 'fruits' is a label you choose."},
              {c:"for fruit in fruits:",n:2,t:"Loop declaration: take each element from 'fruits', one at a time, name it 'fruit', then run the indented code below. The colon marks the start of the loop body. The name 'fruit' is your choice \u2014 'for x in fruits:' works identically."},
              {c:"    print(fruit)",n:3,t:"print() displays the current value of 'fruit'. The 4-space indent is critical \u2014 it tells Python this line is inside the loop. No indent = not part of the loop."},
            ].map((x,i)=>(
              <div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<2?"1px solid #141420":"none"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12.5,color:"#d4d4d4",padding:"8px 12px",background:"#08080f",borderRadius:6,marginBottom:8}}><span style={{color:"#777",marginRight:10}}>{x.n}</span>{x.c}</div>
                <div style={{fontSize:12.5,color:"#888",lineHeight:1.75,paddingLeft:12,borderLeft:"2px solid #63b3ff28"}}>{x.t}</div>
              </div>))}
            <div style={{padding:"10px 14px",borderRadius:8,background:"#63b3ff06",fontSize:12,color:"#999",lineHeight:1.6}}>
              {"\u{1F4A1}"} <strong style={{color:"#63b3ff"}}>Key:</strong> The for loop repeats a block of code once for each item in a sequence. Stops when the list is exhausted.
            </div>
          </div>}

          {/* TRACE TABLE */}
          {selR==="trace"&&<div className="fade-up" style={{background:"#0b0b14",borderRadius:13,padding:"20px",border:"1px solid #63b3ff18",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#63b3ff",marginBottom:14}}>{"\u{1F4CA}"} Variable Trace Table</div>
            <p style={{fontSize:12,color:"#888",marginBottom:14,lineHeight:1.6}}>Track how each variable changes at every step of execution.</p>
            <TraceTable step={anS}/>
            <div style={{display:"flex",gap:8,marginTop:14,alignItems:"center"}}>
              <button onClick={()=>anP?anPlay():setAnP(true)} style={{padding:"5px 12px",borderRadius:6,background:"#63b3ff0D",border:"1px solid #63b3ff20",color:"#63b3ff",fontSize:11,cursor:"pointer"}}>{anP?"\u25B6 Play":"\u23F8 Pause"}</button>
              <button onClick={anStepF} style={{padding:"5px 12px",borderRadius:6,background:"#63b3ff0D",border:"1px solid #63b3ff20",color:"#63b3ff",fontSize:11,cursor:"pointer"}}>{"\u23E9"} Next</button>
              <button onClick={()=>{setSelR(null);setTimeout(()=>setSelR("trace"),80);}} style={{padding:"5px 12px",borderRadius:6,background:"#63b3ff0D",border:"1px solid #63b3ff20",color:"#63b3ff",fontSize:11,cursor:"pointer"}}>{"\u{1F504}"}</button>
              <span style={{fontSize:11,color:"#888"}}>{anS===-1?"Ready":anS<3?`Iteration ${anS+1}/3`:"Done"}</span>
            </div>
          </div>}

          {/* ANIMATION */}
          {selR==="anim"&&<div className="fade-up" style={{background:"#0b0b14",borderRadius:13,padding:"20px",border:"1px solid #63b3ff18",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#63b3ff",marginBottom:14}}>{"\u{1F3AC}"} Step-by-Step Animation</div>
            <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:10,color:"#888",marginBottom:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>fruits</div>
                <div style={{display:"flex",gap:5}}>
                  {["apple","banana","cherry"].map((f,i)=>(
                    <div key={f} style={{padding:"10px 14px",borderRadius:7,textAlign:"center",background:anS===i?"#63b3ff10":"#08080f",border:anS===i?"1.5px solid #63b3ff":i<anS?"1.5px solid #00ff8830":"1.5px solid #1a1a2a",color:anS===i?"#63b3ff":i<anS?"#00ff8880":"#444",fontFamily:"'JetBrains Mono',monospace",fontSize:12.5,transition:"all .4s",transform:anS===i?"scale(1.06)":"scale(1)"}}>
                      "{f}"{anS===i&&<div style={{fontSize:9,color:"#63b3ff",marginTop:3}}>{"\u2191"} fruit</div>}
                    </div>))}
                </div>
              </div>
              <div>
                <div style={{fontSize:10,color:"#888",marginBottom:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>output</div>
                <div style={{background:"#08080f",borderRadius:7,padding:"10px 14px",minWidth:100,minHeight:60,fontFamily:"'JetBrains Mono',monospace",fontSize:12.5,lineHeight:2}}>
                  {["apple","banana","cherry"].filter((_,i)=>i<=anS&&anS<4).map((f,i)=><div key={i} style={{color:"#63b3ff"}}>{f}</div>)}
                </div>
              </div>
            </div>
            <div style={{marginTop:12,fontSize:12,color:"#999",lineHeight:1.6,minHeight:18}}>
              {anS===-1&&"Starting..."}{anS===0&&'Iteration 1: fruit = "apple" \u2192 print(fruit)'}{anS===1&&'Iteration 2: fruit = "banana" \u2192 print(fruit)'}{anS===2&&'Iteration 3: fruit = "cherry" \u2192 print(fruit)'}{anS>=3&&"\u2705 Loop complete \u2014 3 iterations."}
            </div>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button onClick={()=>anP?anPlay():setAnP(true)} style={{padding:"5px 12px",borderRadius:6,background:"#63b3ff0D",border:"1px solid #63b3ff20",color:"#63b3ff",fontSize:11,cursor:"pointer"}}>{anP?"\u25B6 Play":"\u23F8 Pause"}</button>
              <button onClick={anStepF} style={{padding:"5px 12px",borderRadius:6,background:"#63b3ff0D",border:"1px solid #63b3ff20",color:"#63b3ff",fontSize:11,cursor:"pointer"}}>{"\u23E9"} Step</button>
              <button onClick={()=>{setSelR(null);setTimeout(()=>setSelR("anim"),80);}} style={{padding:"5px 12px",borderRadius:6,background:"#63b3ff0D",border:"1px solid #63b3ff20",color:"#63b3ff",fontSize:11,cursor:"pointer"}}>{"\u{1F504}"}</button>
            </div>
          </div>}

          {/* ANALOGY */}
          {selR==="analogy"&&<div className="fade-up" style={{background:"#0b0b14",borderRadius:13,padding:"20px",border:"1px solid #63b3ff18",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#63b3ff",marginBottom:12}}>{"\u{1F9FA}"} The Grocery Bag</div>
            <div style={{fontSize:13,color:"#bbb",lineHeight:1.9}}>
              <p>Imagine a bag: {"\u{1F34E}"} apple, {"\u{1F34C}"} banana, {"\u{1F352}"} cherry.</p>
              <p style={{marginTop:10}}><code style={{color:"#63b3ff",background:"#63b3ff0D",padding:"2px 7px",borderRadius:4,fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>for fruit in fruits</code> = <strong style={{color:"#e0e0ea"}}>pull out one item at a time</strong>:</p>
              <div style={{background:"#08080f",borderRadius:9,padding:"14px 16px",margin:"10px 0",lineHeight:2.2,fontSize:12.5}}>
                {"\u{1F91E}"} Pull {"\u{1F34E}"} "apple" {"\u2192"} say aloud (print)<br/>{"\u{1F91E}"} Pull {"\u{1F34C}"} "banana" {"\u2192"} say aloud<br/>{"\u{1F91E}"} Pull {"\u{1F352}"} "cherry" {"\u2192"} say aloud<br/>{"\u{1F91E}"} Empty {"\u2192"} done!
              </div>
              <p style={{color:"#777",marginTop:8}}><strong style={{color:"#ffbf00"}}>Key:</strong> The loop processes each item in order, one by one.</p>
            </div>
          </div>}

          {/* ★ IMPROVED MIND MAP */}
          {selR==="mindmap"&&<div className="fade-up" style={{background:"#0b0b14",borderRadius:13,padding:"20px",border:"1px solid #63b3ff18",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#63b3ff",marginBottom:6}}>{"\u{1F578}"} Concept Map</div>
            <p style={{fontSize:11.5,color:"#888",marginBottom:14,lineHeight:1.5}}>Read top to bottom: the syntax at the top breaks down into three core concepts, each with deeper details below.</p>
            <MindMap/>
          </div>}

          {/* COMPARE */}
          {selR==="compare"&&<div className="fade-up" style={{background:"#0b0b14",borderRadius:13,padding:"20px",border:"1px solid #63b3ff18",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#63b3ff",marginBottom:12}}>{"\u{1F504}"} With vs Without</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><div style={{fontSize:11,fontWeight:600,color:"#ff6b6b",marginBottom:5}}>{"\u274C"} Manual</div><pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.9,background:"#08080f",padding:"12px",borderRadius:7,color:"#d4d4d4",border:"1px solid #ff6b6b12",whiteSpace:"pre-wrap"}}>{'fruits = ["apple","banana","cherry"]\nprint(fruits[0])\nprint(fruits[1])\nprint(fruits[2])\n# 1000 items = 1000 lines...'}</pre></div>
              <div><div style={{fontSize:11,fontWeight:600,color:"#00ff88",marginBottom:5}}>{"\u2705"} With loop</div><pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.9,background:"#08080f",padding:"12px",borderRadius:7,color:"#d4d4d4",border:"1px solid #00ff8812",whiteSpace:"pre-wrap"}}>{'fruits = ["apple","banana","cherry"]\nfor fruit in fruits:\n    print(fruit)\n# Works for any size!'}</pre></div>
            </div>
          </div>}

          {/* VIDEO EMBED AREA */}
          <div style={{marginTop:8,marginBottom:16,borderRadius:12,overflow:"hidden",border:"1px solid #1a2a3a"}}>
            <div style={{background:"#0b0b14",padding:"20px",textAlign:"center"}}>
              <video src="./video.mp4" controls playsInline style={{width:"100%",borderRadius:8,maxHeight:340,background:"#08080f"}}
                onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
              <div style={{display:"none",width:"100%",height:180,background:"#08080f",borderRadius:8,alignItems:"center",justifyContent:"center",border:"1px dashed #1a2a3a",flexDirection:"column",gap:8}}>
                <span style={{color:"#888",fontSize:36}}>{"\u25B6"}</span>
                <span style={{color:"#666",fontSize:11}}>Place video.mp4 in the public folder</span>
              </div>
            </div>
          </div>

          {selR&&<Btn onClick={()=>go(3)} bg="linear-gradient(135deg,#a78bfa,#8b5cf6)" color="#fff" sx={{marginTop:4}}>Continue {"\u2192"} Reflect</Btn>}
        </div>}

        {/* REFLECT */}
        {step===3&&<div className="fade-up" key="s3">
          <h2 style={{fontSize:18,fontWeight:700,marginBottom:5}}>Reflect: What just happened in your head?</h2>
          <p style={{fontSize:13,color:"#999",lineHeight:1.7,marginBottom:18}}>Articulating your understanding in your own words deepens learning through self-explanation (Chi et al., 1989). After you write, the AI provides personalized feedback.</p>
          <div style={{background:"#0b0b14",borderRadius:13,padding:"20px",border:"1px solid #a78bfa18",marginBottom:16}}>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:12,fontWeight:600,color:"#a78bfa",marginBottom:6}}>1. Prediction vs. Reality</div>
              <div style={{padding:"10px 12px",borderRadius:7,background:"#ffffff03",border:"1px solid #1a1a2a",fontSize:12.5,color:"#777"}}>
                {pred==="correct"&&"\u2705 Predicted correctly."}{pred==="list"&&"Predicted the whole list \u2014 actually printed each item."}{pred==="last"&&"Predicted only last \u2014 loop ran for all."}{pred==="error"&&"Predicted error \u2014 'for' auto-defines."}{useCust&&`Your prediction: "${custom}"`}{!pred&&!useCust&&"(none)"}
              </div>
            </div>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:12,fontWeight:600,color:"#a78bfa",marginBottom:6}}>2. Explain: What does a for loop do?</div>
              <textarea value={refl} onChange={e=>{setRefl(e.target.value);setReflFb("");}} placeholder="Explain to a friend who's never coded..." style={{width:"100%",minHeight:80,padding:"10px 12px",borderRadius:7,background:"#08080f",border:"1.5px solid #a78bfa18",color:"#e0e0ea",fontSize:12.5,lineHeight:1.7,resize:"vertical",fontFamily:"'DM Sans',sans-serif"}}/>
              {refl.trim()&&!reflFb&&!reflLd&&<button onClick={evalRefl} style={{marginTop:8,padding:"7px 16px",borderRadius:7,background:"#a78bfa10",border:"1px solid #a78bfa25",color:"#a78bfa",fontSize:12,cursor:"pointer",fontWeight:600}}>{"\u{1F916}"} Get AI Feedback</button>}
              {(reflLd||reflFb)&&<div className="fade-up" style={{marginTop:10,background:"#0e1a2e",borderRadius:10,padding:"14px 16px",border:"1px solid #1a3050"}}>
                <div style={{fontSize:10,color:"#a78bfa",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>{"\u{1F916}"} Feedback</div>
                {reflLd?<div style={{color:"#999",fontSize:13}}>Evaluating<span style={{animation:"blink 1s step-end infinite"}}>...</span></div>:<div style={{fontSize:13,color:"#b0c8e0",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{reflFb}</div>}
              </div>}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:"#a78bfa",marginBottom:6}}>3. Which representation helped you most?</div>
              <div style={{fontSize:11,color:"#889",marginBottom:8,lineHeight:1.5}}>Noticing how you learn best is a metacognitive skill that improves over time.</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[{k:"annotated",l:"\u{1F4DD} Line-by-line"},{k:"trace",l:"\u{1F4CA} Trace"},{k:"anim",l:"\u{1F3AC} Animation"},{k:"analogy",l:"\u{1F9FA} Analogy"},{k:"mindmap",l:"\u{1F578} Mind Map"},{k:"compare",l:"\u{1F504} Compare"}].map(r=><button key={r.k} onClick={()=>setRepC(r.k)} style={{padding:"6px 12px",borderRadius:7,border:repC===r.k?"1.5px solid #a78bfa":"1.5px solid #1a1a2a",background:repC===r.k?"#a78bfa0A":"#0b0b14",color:repC===r.k?"#a78bfa":"#999",fontSize:11.5,cursor:"pointer"}}>{r.l}</button>)}
              </div>
            </div>
          </div>
          {!done?<Btn disabled={!refl.trim()} bg="linear-gradient(135deg,#00ff88,#00bbff)" onClick={()=>setDone(true)}>Complete Lesson {"\u2728"}</Btn>
          :<div className="fade-up" style={{background:"#00ff8806",border:"1px solid #00ff8820",borderRadius:13,padding:"24px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>{"\u{1F389}"}</div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:6}}>Lesson Complete!</div>
            <div style={{fontSize:12.5,color:"#777",lineHeight:1.8,maxWidth:440,margin:"0 auto"}}>You learned <strong style={{color:"#e0e0ea"}}>for loops</strong> through Predict {"\u2192"} Explore {"\u2192"} Represent {"\u2192"} Reflect.</div>
            <div style={{marginTop:14,display:"flex",justifyContent:"center",gap:12}}>
              <button onClick={()=>setView("home")} style={{padding:"7px 16px",borderRadius:7,background:"#ffffff05",border:"1px solid #1a1a2a",color:"#777",cursor:"pointer",fontSize:12}}>{"\u2190"} Curriculum</button>
              <button style={{padding:"7px 16px",borderRadius:7,background:"#63b3ff0D",border:"1px solid #63b3ff20",color:"#63b3ff",cursor:"pointer",fontSize:12}}>Next: While Loops {"\u2192"}</button>
            </div>
          </div>}
        </div>}
      </div>
    </div>
  );
}
