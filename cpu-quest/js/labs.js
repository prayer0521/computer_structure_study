/* ===== 可交互实验室 =====
   每个 lab 是 function(el){...}，负责把自己渲染进 el 并绑定事件 */
const LABS = {};
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const bin = (n, w=8) => (n>>>0).toString(2).padStart(w,"0").slice(-w);

/* ---------- 1. 逻辑门游乐场 ---------- */
LABS.gates = function(el){
  el.innerHTML = `
    <div class="lab-row">
      <button class="sw" data-in="a"><span class="dot"></span>输入 A = <b>0</b></button>
      <button class="sw" data-in="b"><span class="dot"></span>输入 B = <b>0</b></button>
      <span class="lab-hint" style="margin:0">← 点一下试试，看下面哪个灯亮</span>
    </div>
    <div class="lab-row" id="g-out"></div>
    <div class="lab-hint">💡 每个「门」就是一小撮晶体管。全世界所有的 CPU，都只是这几种门堆了几百亿个。</div>`;
  const st = {a:0, b:0};
  const gates = [
    ["AND",  "与",   (a,b)=>a&b,      "两个都是1才亮"],
    ["OR",   "或",   (a,b)=>a|b,      "有一个1就亮"],
    ["XOR",  "异或", (a,b)=>a^b,      "两个不一样才亮"],
    ["NAND", "与非", (a,b)=>(a&b)?0:1,"AND反过来（万能门！）"],
    ["NOT A","非",   (a)=>a?0:1,      "只看A，反过来"]
  ];
  function draw(){
    $("#g-out", el).innerHTML = gates.map(([n,cn,f,tip])=>{
      const v = f(st.a, st.b);
      return `<div class="bulb ${v?"on":""}" title="${tip}">
        <span class="led"></span><span>${n} <span style="color:var(--dim)">${cn}</span> = <b>${v}</b></span></div>`;
    }).join("");
  }
  $$(".sw", el).forEach(b => b.onclick = () => {
    const k = b.dataset.in; st[k] ^= 1;
    b.classList.toggle("on", !!st[k]);
    $("b", b).textContent = st[k];
    draw();
  });
  draw();
};

/* ---------- 2. 加法器 ---------- */
LABS.adder = function(el){
  el.innerHTML = `
    <p style="margin-top:0">全加器：3个输入(A、B、进位输入)，2个输出(和、进位输出)。这就是 CPU 里做加法的那个零件。</p>
    <div class="lab-row">
      <button class="sw" data-in="a"><span class="dot"></span>A = <b>0</b></button>
      <button class="sw" data-in="b"><span class="dot"></span>B = <b>0</b></button>
      <button class="sw" data-in="c"><span class="dot"></span>Cin 进位输入 = <b>0</b></button>
    </div>
    <div class="lab-row" id="a-out"></div>
    <div class="readout" id="a-say"></div>
    <div class="lab-hint">🔗 内部只用了 2个XOR + 2个AND + 1个OR。把 64 个这玩意串起来，就是能算 64 位加法的 ALU。</div>`;
  const st={a:0,b:0,c:0};
  function draw(){
    const t = st.a + st.b + st.c;
    const sum = t & 1, cout = t > 1 ? 1 : 0;
    $("#a-out", el).innerHTML =
      `<div class="bulb ${sum?"on":""}"><span class="led"></span>Sum 和 = <b>${sum}</b></div>
       <div class="bulb ${cout?"on":""}"><span class="led"></span>Cout 进位输出 = <b>${cout}</b></div>`;
    $("#a-say", el).innerHTML =
      `<span class="k">十进制：</span><span class="v">${st.a} + ${st.b} + ${st.c} = ${t}</span><br>
       <span class="k">二进制结果：</span><span class="v">${cout}${sum}</span>
       <span style="color:var(--dim)">（左边是进位，右边是本位）</span>`;
  }
  $$(".sw", el).forEach(b => b.onclick = () => {
    st[b.dataset.in] ^= 1; b.classList.toggle("on", !!st[b.dataset.in]);
    $("b", b).textContent = st[b.dataset.in]; draw();
  });
  draw();
};

/* ---------- 3. 8位二进制转换器 ---------- */
LABS.binary = function(el){
  el.innerHTML = `
    <p style="margin-top:0">点亮开关，看数字变化。每一位的「面值」写在下面。</p>
    <div class="bitgrid" id="b-bits"></div>
    <div class="lab-row">
      <button class="mini-btn" data-set="0">全灭 (0)</button>
      <button class="mini-btn" data-set="255">全亮 (255)</button>
      <button class="mini-btn" data-set="65">65</button>
      <button class="mini-btn" data-rnd="1">🎲 随机</button>
    </div>
    <div class="readout" id="b-out"></div>
    <div class="lab-hint">💡 8个开关 = 1个字节 = 能表示 0~255 共 256 种状态。这就是为什么很多东西的上限是 255。</div>`;
  let v = 65;
  function draw(){
    $("#b-bits", el).innerHTML = [7,6,5,4,3,2,1,0].map(i=>{
      const on = (v>>i)&1;
      return `<div class="bit ${on?"on":""}" data-i="${i}">${on}<span class="pw">${1<<i}</span></div>`;
    }).join("");
    $$(".bit", el).forEach(b => b.onclick = () => { v ^= (1 << +b.dataset.i); draw(); });
    const ch = (v>=32 && v<127) ? String.fromCharCode(v) : "（不可打印）";
    const terms = [7,6,5,4,3,2,1,0].filter(i=>(v>>i)&1).map(i=>1<<i);
    $("#b-out", el).innerHTML =
      `<span class="k">二进制：</span><span class="v">${bin(v)}</span><br>
       <span class="k">十进制：</span><span class="v">${v}</span>
         <span style="color:var(--dim)">${terms.length?" = "+terms.join(" + "):" = 0"}</span><br>
       <span class="k">十六进制：</span><span class="v">0x${v.toString(16).toUpperCase().padStart(2,"0")}</span><br>
       <span class="k">当成字符看：</span><span class="v">${ch}</span>`;
  }
  el.onclick = e => {
    const t = e.target.closest("[data-set],[data-rnd]"); if(!t) return;
    v = t.dataset.rnd ? Math.floor(Math.random()*256) : +t.dataset.set; draw();
  };
  draw();
};

/* ---------- 4. 补码探险 ---------- */
LABS.twos = function(el){
  el.innerHTML = `
    <p style="margin-top:0">同样的 8 个比特，换一种「读法」就能表示负数。点开关，对比两种解释。</p>
    <div class="bitgrid" id="t-bits"></div>
    <div class="lab-row">
      <button class="mini-btn" data-op="neg">🔄 取负 (取反+1)</button>
      <button class="mini-btn" data-op="inc">+1</button>
      <button class="mini-btn" data-op="dec">-1</button>
      <button class="mini-btn" data-set="0">归零</button>
      <button class="mini-btn" data-set="128">试试 10000000</button>
    </div>
    <div class="readout" id="t-out"></div>
    <div class="lab-hint">🎯 关键实验：从 127 再 +1 会发生什么？从 0 再 -1 呢？（这就是「溢出」和为什么 -1 是全1）</div>`;
  let v = 5;
  function draw(){
    $("#t-bits", el).innerHTML = [7,6,5,4,3,2,1,0].map(i=>{
      const on=(v>>i)&1;
      const pw = i===7 ? "-128" : String(1<<i);
      return `<div class="bit ${on?"on":""}" data-i="${i}" title="${i===7?"符号位：权重是 -128":""}">${on}<span class="pw">${pw}</span></div>`;
    }).join("");
    $$(".bit", el).forEach(b => b.onclick = () => { v ^= (1 << +b.dataset.i); v &= 255; draw(); });
    const signed = v >= 128 ? v - 256 : v;
    $("#t-out", el).innerHTML =
      `<span class="k">比特串：</span><span class="v">${bin(v)}</span><br>
       <span class="k">无符号读法：</span><span class="v">${v}</span>
         <span style="color:var(--dim)">（0 ~ 255）</span><br>
       <span class="k">补码读法：</span><span class="v" style="color:${signed<0?"var(--rd)":"var(--gr)"}">${signed}</span>
         <span style="color:var(--dim)">（-128 ~ 127）</span><br>
       <span class="k">最高位：</span><span class="v">${(v>>7)&1}</span>
         <span style="color:var(--dim)">${(v>>7)&1?"→ 是负数":"→ 是非负数"}</span>`;
  }
  el.onclick = e => {
    const t = e.target.closest("[data-op],[data-set]"); if(!t) return;
    if(t.dataset.set !== undefined) v = +t.dataset.set;
    else if(t.dataset.op === "neg") v = ((~v)+1) & 255;
    else if(t.dataset.op === "inc") v = (v+1) & 255;
    else if(t.dataset.op === "dec") v = (v-1) & 255;
    draw();
  };
  draw();
};

/* ---------- 5. IEEE754 浮点显微镜 ---------- */
LABS.float = function(el){
  el.innerHTML = `
    <p style="margin-top:0">输入一个小数，看它在内存里真实的 32 个比特长什么样。</p>
    <div class="lab-row">
      <input id="f-in" value="0.1" style="font-family:var(--mono);font-size:15px;padding:9px 13px;
        background:#080d1c;border:1px solid var(--line);border-radius:9px;color:var(--cy);width:150px">
      ${[0.1,1.5,-2.75,3.14159,1e-8,255].map(x=>`<button class="mini-btn" data-v="${x}">${x}</button>`).join("")}
    </div>
    <div class="readout" id="f-out"></div>
    <div class="block b-warn" style="margin-top:14px">
      <h3>😱 世纪谜案：0.1 + 0.2 ≠ 0.3</h3>
      <div class="readout" id="f-demo"></div>
    </div>`;
  function draw(){
    const x = parseFloat($("#f-in", el).value);
    if(isNaN(x)){ $("#f-out", el).innerHTML = "请输入一个数字"; return; }
    const buf = new ArrayBuffer(4);
    new Float32Array(buf)[0] = x;
    const u = new Uint32Array(buf)[0];
    const b = bin(u, 32);
    const sign = b[0], exp = b.slice(1,9), man = b.slice(9);
    const e = parseInt(exp,2);
    $("#f-out", el).innerHTML =
      `<span class="k">你输入：</span><span class="v">${x}</span><br>
       <span class="k">存进去实际是：</span><span class="v">${new Float32Array(buf)[0]}</span>
         ${new Float32Array(buf)[0] !== x ? `<span style="color:var(--rd)"> ← 已经不精确了！</span>` : ""}<br>
       <span class="k">32个比特：</span>
         <span style="color:var(--rd);font-weight:700">${sign}</span>
         <span style="color:var(--gd);font-weight:700">${exp}</span>
         <span style="color:var(--cy)">${man}</span><br>
       <span class="k">├ 符号位：</span><span class="v">${sign}</span> <span style="color:var(--dim)">${sign==="1"?"负数":"正数"}</span><br>
       <span class="k">├ 阶码(8位)：</span><span class="v">${exp}</span> <span style="color:var(--dim)">= ${e}，减去偏移127 → 实际指数 ${e-127}</span><br>
       <span class="k">└ 尾数(23位)：</span><span class="v" style="font-size:12px">${man}</span><br>
       <span class="k">还原公式：</span><span style="color:var(--dim)">(-1)<sup>${sign}</sup> × 1.${man.slice(0,10)}… × 2<sup>${e-127}</sup></span><br>
       <span class="k">十六进制：</span><span class="v">0x${u.toString(16).toUpperCase().padStart(8,"0")}</span>`;
  }
  const f = new Float32Array(1);
  f[0]=0.1; const a=f[0]; f[0]=0.2; const bb=f[0];
  $("#f-demo", el).innerHTML =
    `<span class="k">0.1 真实值：</span><span class="v">${(0.1).toPrecision(20)}</span><br>
     <span class="k">0.2 真实值：</span><span class="v">${(0.2).toPrecision(20)}</span><br>
     <span class="k">相加得到：</span><span class="v" style="color:var(--rd)">${(0.1+0.2).toPrecision(20)}</span><br>
     <span class="k">0.1+0.2==0.3 ?</span><span class="v" style="color:var(--rd)">${0.1+0.2===0.3}</span><br>
     <span style="color:var(--dim);font-size:12px">原因：二进制没法精确写出 0.1，就像十进制没法精确写出 1/3。<br>
     所以永远别用 == 比较浮点数，要用 |a-b| &lt; 一个很小的数。</span>`;
  $("#f-in", el).oninput = draw;
  el.onclick = e => {
    const t = e.target.closest("[data-v]"); if(!t) return;
    $("#f-in", el).value = t.dataset.v; draw();
  };
  draw();
};

/* ---------- 6. ALU 实验台 ---------- */
LABS.alu = function(el){
  const ops = [["ADD","+"],["SUB","-"],["AND","&"],["OR","|"],["XOR","^"],["SHL","<<1"]];
  el.innerHTML = `
    <p style="margin-top:0">ALU（算术逻辑单元）= CPU 的计算肌肉。给它两个数和一个「操作码」，它吐出结果和几个标志位。</p>
    <div class="lab-row">
      <label style="font-family:var(--mono);font-size:13px">A <input id="u-a" type="number" value="12" min="0" max="15"
        style="width:64px;font-family:var(--mono);padding:6px;background:#080d1c;border:1px solid var(--line);border-radius:7px;color:var(--cy)"></label>
      <label style="font-family:var(--mono);font-size:13px">B <input id="u-b" type="number" value="5" min="0" max="15"
        style="width:64px;font-family:var(--mono);padding:6px;background:#080d1c;border:1px solid var(--line);border-radius:7px;color:var(--cy)"></label>
      <span style="color:var(--dim);font-size:12px">(4位，0~15)</span>
    </div>
    <div class="lab-row" id="u-ops">${ops.map(([o,s],i)=>
      `<button class="sw ${i===0?"on":""}" data-op="${o}"><span class="dot"></span>${o} <span style="color:var(--dim)">${s}</span></button>`).join("")}</div>
    <div class="readout" id="u-out"></div>
    <div class="lab-hint">🚩 标志位是 CPU 的「感觉」：Z=结果是0吗，N=结果是负的吗，C=算超了吗。<br>
       <code>if (a == b)</code> 底层就是：算 <code>a-b</code>，然后看 Z 标志。</div>`;
  let op = "ADD";
  function draw(){
    const a = Math.max(0,Math.min(15, +$("#u-a",el).value|0));
    const b = Math.max(0,Math.min(15, +$("#u-b",el).value|0));
    let raw;
    switch(op){
      case "ADD": raw = a+b; break;
      case "SUB": raw = a-b; break;
      case "AND": raw = a&b; break;
      case "OR":  raw = a|b; break;
      case "XOR": raw = a^b; break;
      case "SHL": raw = a<<1; break;
    }
    const r = raw & 15;
    const Z = r===0?1:0, N = (r>>3)&1, C = (raw>15||raw<0)?1:0;
    $("#u-out",el).innerHTML =
      `<span class="k">A =</span><span class="v">${bin(a,4)}</span> <span style="color:var(--dim)">(${a})</span><br>
       <span class="k">B =</span><span class="v">${bin(b,4)}</span> <span style="color:var(--dim)">(${b})</span><br>
       <span class="k">${op} 结果 =</span><span class="v">${bin(r,4)}</span>
         <span style="color:var(--dim)">(无符号 ${r}，补码看作 ${r>7?r-16:r})</span>
         ${C?`<span style="color:var(--rd)"> ⚠ 4位装不下了，真实值 ${raw}</span>`:""}<br>
       <span class="k">标志位：</span>
         <span class="chip" style="${Z?"color:var(--gr);border-color:var(--gr)":""}">Z=${Z}</span>
         <span class="chip" style="${N?"color:var(--rd);border-color:var(--rd)":""}">N=${N}</span>
         <span class="chip" style="${C?"color:var(--gd);border-color:var(--gd)":""}">C=${C}</span>`;
  }
  el.oninput = draw;
  $("#u-ops",el).onclick = e => {
    const t = e.target.closest("[data-op]"); if(!t) return;
    op = t.dataset.op;
    $$("[data-op]",el).forEach(x=>x.classList.toggle("on", x===t));
    draw();
  };
  draw();
};

/* ---------- 7. 迷你 CPU 单步模拟器（核心！） ---------- */
LABS.minicpu = function(el){
  const PROG = [
    {t:"LOAD R1, #5",  op:"LOAD", d:"R1", v:5,  say:"把数字5放进R1，当计数器"},
    {t:"LOAD R2, #0",  op:"LOAD", d:"R2", v:0,  say:"R2清零，当累加器"},
    {t:"ADD  R2, R1",  op:"ADD",  d:"R2", s:"R1", say:"R2 = R2 + R1（累加）"},
    {t:"DEC  R1",      op:"DEC",  d:"R1", say:"R1 减 1"},
    {t:"JNZ  R1, 2",   op:"JNZ",  s:"R1", v:2,  say:"R1不为0就跳回第2行 → 循环！"},
    {t:"OUT  R2",      op:"OUT",  s:"R2", say:"把R2的值输出"},
    {t:"HALT",         op:"HALT", say:"停机"}
  ];
  el.innerHTML = `
    <p style="margin-top:0">这是一台真的（虽然很小）CPU。它在跑 <code>1+2+3+4+5</code>。<br>
    <b>关键：CPU 一辈子只会重复三件事 —— 取指 → 译码 → 执行。</b>点「下一步」，一个微步一个微步地看。</p>
    <div class="lab-row" id="c-stages">
      <span class="stage" data-st="0">① 取指 FETCH</span>
      <span class="stage" data-st="1">② 译码 DECODE</span>
      <span class="stage" data-st="2">③ 执行 EXECUTE</span>
    </div>
    <div class="cpu-grid">
      <div class="cpu-box">
        <h4>内存 / 程序</h4>
        <div id="c-code"></div>
      </div>
      <div class="cpu-box">
        <h4>寄存器</h4>
        <div id="c-regs"></div>
        <h4 style="margin-top:13px">控制单元的解读</h4>
        <div id="c-say" style="font-size:12px;color:var(--gd);min-height:34px;font-family:var(--mono)"></div>
      </div>
    </div>
    <div class="cpu-box"><h4>输出</h4><div id="c-out" style="font-family:var(--mono);font-size:15px;color:var(--gr);min-height:23px">（还没有输出）</div></div>
    <div class="lab-row" style="margin-top:13px">
      <button class="primary" id="c-step" style="padding:9px 20px">下一步 ▸</button>
      <button class="mini-btn" id="c-run">▶ 自动跑</button>
      <button class="mini-btn" id="c-reset">↺ 重置</button>
      <span class="chip" id="c-cyc">周期 0</span>
    </div>
    <div class="lab-hint">🤯 就这样。你电脑上所有的东西 —— 浏览器、游戏、AI —— 都只是这个循环，每秒跑几十亿次。</div>`;

  let R, PC, IR, out, cyc, stage, timer=null, hot=null;
  function reset(){
    R={R1:0,R2:0}; PC=0; IR=null; out=[]; cyc=0; stage=0; hot=null;
    if(timer){clearInterval(timer);timer=null;$("#c-run",el).textContent="▶ 自动跑";}
    $("#c-out",el).textContent="（还没有输出）";
    $("#c-step",el).disabled=false;
    draw("");
  }
  function draw(msg){
    $("#c-code",el).innerHTML = PROG.map((p,i)=>
      `<div class="codeline ${i===PC?"cur":""}"><span class="n">${i}</span><span>${p.t}</span></div>`).join("");
    $("#c-regs",el).innerHTML =
      `<div class="regrow ${hot==="PC"?"hot":""}"><span>PC 程序计数器</span><span>${PC}</span></div>
       <div class="regrow ${hot==="IR"?"hot":""}"><span>IR 指令寄存器</span><span>${IR?IR.t.trim():"—"}</span></div>
       <div class="regrow ${hot==="R1"?"hot":""}"><span>R1</span><span>${R.R1}</span></div>
       <div class="regrow ${hot==="R2"?"hot":""}"><span>R2</span><span>${R.R2}</span></div>`;
    $$(".stage",el).forEach(s=>s.classList.toggle("act", +s.dataset.st===stage));
    $("#c-say",el).textContent = msg;
    $("#c-cyc",el).textContent = "周期 "+cyc;
  }
  function step(){
    if(stage===0){                                  // FETCH
      if(PC>=PROG.length){ finish(); return; }
      IR = PROG[PC]; hot="IR"; stage=1; cyc++;
      draw(`取指：从内存第 ${PC} 格读出「${IR.t.trim()}」放进 IR`);
    } else if(stage===1){                            // DECODE
      hot=null; stage=2;
      draw(`译码：这是 ${IR.op} 指令 —— ${IR.say}`);
    } else {                                         // EXECUTE
      const p = IR; let jumped=false;
      switch(p.op){
        case "LOAD": R[p.d]=p.v; hot=p.d; break;
        case "ADD":  R[p.d]=R[p.d]+R[p.s]; hot=p.d; break;
        case "DEC":  R[p.d]=R[p.d]-1; hot=p.d; break;
        case "JNZ":  if(R[p.s]!==0){ PC=p.v; jumped=true; hot="PC"; } break;
        case "OUT":  out.push(R[p.s]); $("#c-out",el).textContent = "→ "+out.join("  "); hot=null; break;
        case "HALT": finish(); return;
      }
      if(!jumped) PC++;
      stage=0;
      draw(`执行完毕。${jumped?`PC 被改成 ${PC}（跳转）`:`PC 自动指向下一条 → ${PC}`}`);
    }
  }
  function finish(){
    stage=0;
    if(timer){clearInterval(timer);timer=null;$("#c-run",el).textContent="▶ 自动跑";}
    $("#c-step",el).disabled=true;
    draw("🏁 HALT —— 程序结束。结果 "+(out[0]!==undefined?out[0]:"?"));
    if(typeof onLabDone==="function") onLabDone("first_run");
  }
  $("#c-step",el).onclick = step;
  $("#c-reset",el).onclick = reset;
  $("#c-run",el).onclick = () => {
    if(timer){ clearInterval(timer); timer=null; $("#c-run",el).textContent="▶ 自动跑"; }
    else { $("#c-run",el).textContent="⏸ 暂停"; timer=setInterval(()=>{ if($("#c-step",el).disabled){clearInterval(timer);timer=null;$("#c-run",el).textContent="▶ 自动跑";return;} step(); }, 420); }
  };
  reset();
};

/* ---------- 8. 函数调用栈 ---------- */
LABS.stack = function(el){
  el.innerHTML = `
    <p style="margin-top:0">代码：<code>int fact(int n){ return n<=1 ? 1 : n*fact(n-1); }</code>，调用 <code>fact(4)</code>。<br>
    点「下一步」看栈怎么长出来、又怎么收回去。</p>
    <div class="cpu-grid">
      <div class="cpu-box">
        <h4>调用栈（栈顶在上，往下长）</h4>
        <div class="stackv" id="s-view" style="min-height:190px"></div>
      </div>
      <div class="cpu-box">
        <h4>发生了什么</h4>
        <div class="log" id="s-log" style="max-height:190px"></div>
      </div>
    </div>
    <div class="lab-row">
      <button class="primary" id="s-step" style="padding:9px 20px">下一步 ▸</button>
      <button class="mini-btn" id="s-reset">↺ 重置</button>
      <span class="chip" id="s-sp"></span>
    </div>
    <div class="lab-hint">💥 栈溢出（stack overflow）就是这里叠太高了 —— 递归忘了写终止条件，帧一直压不弹，撞到栈空间上限。</div>`;
  const steps = [];
  (function build(){
    for(let n=4;n>=1;n--) steps.push({a:"push", n});
    for(let n=1;n<=4;n++) steps.push({a:"pop", n, r:[1,1,2,6,24][n]});
  })();
  let i=0, frames=[], logs=[];
  function draw(){
    $("#s-view",el).innerHTML = frames.length
      ? [...frames].reverse().map((f,k)=>
          `<div class="frame ${k===0?"top":""}">
             <div class="fn">fact(n=${f.n}) ${k===0?"← 栈顶 (SP)":""}</div>
             <div class="vars">局部变量 n=${f.n} · 返回地址已保存 ${f.ret!==undefined?`· 返回值 ${f.ret}`:""}</div>
           </div>`).join("")
      : `<div style="color:var(--dim);font-size:12px">栈是空的</div>`;
    $("#s-log",el).innerHTML = logs.map(l=>`<div class="${l[0]}">${l[1]}</div>`).join("");
    $("#s-log",el).scrollTop = 99999;
    $("#s-sp",el).textContent = `栈深度 ${frames.length}`;
    $("#s-step",el).disabled = i>=steps.length;
  }
  function step(){
    if(i>=steps.length) return;
    const s = steps[i++];
    if(s.a==="push"){
      frames.push({n:s.n});
      logs.push(["sys",`压栈：调用 fact(${s.n})，为它开一个新栈帧`]);
      if(s.n===1) logs.push(["hit",`n=1 到底了！不再递归，开始往回返`]);
    }else{
      const f = frames.pop();
      logs.push(["hit",`fact(${s.n}) 返回 ${s.r} → 弹栈，帧被回收`]);
      if(frames.length) frames[frames.length-1].ret = s.r;
      if(!frames.length) logs.push(["sys",`🏁 最终结果 fact(4) = 24`]);
    }
    draw();
    if(i>=steps.length && typeof onLabDone==="function") onLabDone("stack_walk");
  }
  $("#s-step",el).onclick = step;
  $("#s-reset",el).onclick = ()=>{ i=0;frames=[];logs=[];draw(); };
  draw();
};

/* ---------- 9. 内存布局 ---------- */
LABS.memmap = function(el){
  const segs = [
    ["栈 Stack","#fbbf24","局部变量、函数参数、返回地址","向下增长 ↓","自动"],
    ["（空隙）","#2a3765","栈和堆之间的空地","",""],
    ["堆 Heap","#34d399","malloc / new 出来的东西","向上增长 ↑","手动/GC"],
    ["BSS","#a78bfa","未初始化的全局变量（自动清0）","固定","程序启动"],
    ["Data","#31e1f7","已初始化的全局变量","固定","程序启动"],
    ["Text 代码段","#fb7185","你的机器指令本身（只读）","固定","程序启动"]
  ];
  el.innerHTML = `
    <p style="margin-top:0">一个程序跑起来后，它眼里的内存长这样（高地址在上）。鼠标悬停看说明。</p>
    <div style="display:flex;flex-direction:column;gap:5px;margin:14px 0">
      ${segs.map(([n,c,d,g,l])=>`
        <div style="border:1px solid ${c}66;background:${c}14;border-radius:10px;padding:11px 15px;
                    display:flex;gap:13px;align-items:center;flex-wrap:wrap" title="${d}">
          <b style="color:${c};font-family:var(--mono);min-width:112px">${n}</b>
          <span style="font-size:13px;color:var(--dim);flex:1">${d}</span>
          ${g?`<span class="chip">${g}</span>`:""}
          ${l?`<span class="chip">${l}</span>`:""}
        </div>`).join("")}
    </div>
    <div class="lab-hint">🎭 每个进程都以为自己独占整块内存，其实是操作系统给每个人发了一套假地址（虚拟内存）。这个骗术在世界9揭穿。</div>`;
};

/* ---------- 10. 缓存模拟器 ---------- */
LABS.cache = function(el){
  el.innerHTML = `
    <p style="margin-top:0">同一个二维数组，两种遍历顺序，速度能差几倍。这里模拟：缓存有 4 行，每行装 4 个连续元素。</p>
    <div class="lab-row">
      <button class="sw on" data-mode="row"><span class="dot"></span>按行遍历 a[i][j]</button>
      <button class="sw" data-mode="col"><span class="dot"></span>按列遍历 a[j][i]</button>
      <button class="mini-btn" id="k-run">▶ 开始访问</button>
      <button class="mini-btn" id="k-reset">↺ 重置</button>
    </div>
    <div class="cpu-grid">
      <div class="cpu-box">
        <h4>缓存内容（4行 × 4元素）</h4>
        <div class="cache-vis" id="k-lines"></div>
        <div class="readout" id="k-stat" style="margin-top:11px"></div>
      </div>
      <div class="cpu-box"><h4>访问日志</h4><div class="log" id="k-log"></div></div>
    </div>
    <div class="lab-hint">⚡ 一次缓存命中约 1~4 个周期，一次内存访问约 200+ 周期。差 50 倍 —— 这就是为什么循环顺序能决定性能。</div>`;
  const N=8, LINES=4, BS=4;
  let mode="row", cache=[], hits=0, misses=0, timer=null, seq=[], idx=0;
  function order(){
    const a=[];
    for(let i=0;i<N;i++) for(let j=0;j<N;j++) a.push(mode==="row" ? i*N+j : j*N+i);
    return a;
  }
  function reset(){
    if(timer){clearInterval(timer);timer=null;}
    cache=[]; hits=0; misses=0; idx=0; seq=order(); draw([]);
  }
  function draw(logs){
    $("#k-lines",el).innerHTML = Array.from({length:LINES},(_,i)=>{
      const c = cache[i];
      return `<div class="cline ${c?"filled":""} ${c&&c.hit?"hit":""}">${c?`块${c.blk}<br>[${c.blk*BS}-${c.blk*BS+BS-1}]`:"空"}</div>`;
    }).join("");
    const tot=hits+misses;
    $("#k-stat",el).innerHTML =
      `<span class="k">命中：</span><span class="v" style="color:var(--gr)">${hits}</span><br>
       <span class="k">未命中：</span><span class="v" style="color:var(--rd)">${misses}</span><br>
       <span class="k">命中率：</span><span class="v">${tot?(hits/tot*100).toFixed(1):0}%</span><br>
       <span class="k">估算耗时：</span><span class="v">${hits*4+misses*200} 周期</span>`;
    if(logs) $("#k-log",el).innerHTML = logs.map(l=>`<div class="${l[0]}">${l[1]}</div>`).join("");
    $("#k-log",el).scrollTop=99999;
  }
  let logs=[];
  function one(){
    if(idx>=seq.length){
      clearInterval(timer); timer=null;
      logs.push(["sys",`—— 结束：命中率 ${(hits/(hits+misses)*100).toFixed(1)}%`]);
      draw(logs);
      if(typeof onLabDone==="function") onLabDone("cache_hit");
      return;
    }
    const addr = seq[idx++], blk = Math.floor(addr/BS), slot = blk % LINES;
    cache.forEach(c=>{ if(c) c.hit=false; });
    if(cache[slot] && cache[slot].blk===blk){
      hits++; cache[slot].hit=true;
      logs.push(["hit",`访问 a[${Math.floor(addr/N)}][${addr%N}] (地址${addr}) → 命中 ✓`]);
    }else{
      misses++; cache[slot]={blk, hit:true};
      logs.push(["miss",`访问 a[${Math.floor(addr/N)}][${addr%N}] (地址${addr}) → 未命中，从内存搬块${blk}`]);
    }
    if(logs.length>60) logs=logs.slice(-60);
    draw(logs);
  }
  el.onclick = e => {
    const m = e.target.closest("[data-mode]");
    if(m){ mode=m.dataset.mode; $$("[data-mode]",el).forEach(x=>x.classList.toggle("on",x===m)); logs=[]; reset(); }
    if(e.target.id==="k-run"){ if(timer)return; logs=[["sys",`开始：${mode==="row"?"按行":"按列"}遍历 8×8 数组`]]; if(idx>=seq.length)reset(); timer=setInterval(one,90); }
    if(e.target.id==="k-reset"){ logs=[]; reset(); }
  };
  reset();
};

/* ---------- 11. 流水线 ---------- */
LABS.pipeline = function(el){
  const ST=["IF","ID","EX","ME","WB"], CLS=["s-IF","s-ID","s-EX","s-ME","s-WB"];
  const NAMES={IF:"取指",ID:"译码",EX:"执行",ME:"访存",WB:"写回"};
  el.innerHTML = `
    <p style="margin-top:0">洗衣店比喻：洗→烘→叠。等第一件全干完再洗第二件是傻的，应该第一件在烘的时候就洗第二件。</p>
    <div class="lab-row">
      <button class="sw" data-p="0"><span class="dot"></span>不用流水线（老实人）</button>
      <button class="sw on" data-p="1"><span class="dot"></span>用流水线（聪明人）</button>
    </div>
    <div style="overflow-x:auto"><table class="pipe-tbl" id="p-tbl"></table></div>
    <div class="readout" id="p-stat"></div>
    <div class="lab-row" style="margin-top:11px;font-size:11px;color:var(--dim)">
      ${ST.map((s,i)=>`<span class="chip ${CLS[i]}" style="color:#06182b">${s} ${NAMES[s]}</span>`).join("")}
    </div>
    <div class="lab-hint">⚠️ 代价：如果下一条指令要用上一条还没算完的结果，就得「停顿」；遇到 if 分支还得猜哪边 —— 猜错就白干，全部倒掉重来。</div>`;
  let piped=1;
  function draw(){
    const n=5, cycles = piped ? n+ST.length-1 : n*ST.length;
    let h=`<tr><th>指令</th>${Array.from({length:cycles},(_,i)=>`<th>${i+1}</th>`).join("")}</tr>`;
    for(let i=0;i<n;i++){
      const start = piped ? i : i*ST.length;
      let row=`<tr><td style="text-align:left;white-space:nowrap">指令${i+1}</td>`;
      for(let c=0;c<cycles;c++){
        const k=c-start;
        row += (k>=0&&k<ST.length) ? `<td class="s ${CLS[k]}">${ST[k]}</td>` : `<td></td>`;
      }
      h+=row+"</tr>";
    }
    $("#p-tbl",el).innerHTML=h;
    $("#p-stat",el).innerHTML =
      `<span class="k">5条指令耗时：</span><span class="v">${cycles} 个周期</span><br>
       <span class="k">吞吐量：</span><span class="v">${(5/cycles).toFixed(2)} 条/周期</span><br>
       ${piped?`<span style="color:var(--gr)">✓ 提速 ${(25/cycles).toFixed(1)}倍。注意：单条指令并没有变快，是「同时在做的事」变多了。</span>`
              :`<span style="color:var(--rd)">✗ 每个部件 5个周期里有 4个在摸鱼。</span>`}`;
  }
  el.onclick = e => {
    const t=e.target.closest("[data-p]"); if(!t) return;
    piped=+t.dataset.p; $$("[data-p]",el).forEach(x=>x.classList.toggle("on",x===t)); draw();
  };
  draw();
};

/* ---------- 12. 虚拟内存地址翻译 ---------- */
LABS.vm = function(el){
  el.innerHTML = `
    <p style="margin-top:0">程序说「我要地址 9000」。这个地址是假的。MMU 硬件负责把它翻译成真地址。<br>
    这里：页大小 4096 字节，用一张页表查。</p>
    <div class="lab-row">
      <label style="font-family:var(--mono);font-size:13px">虚拟地址
        <input id="v-in" type="number" value="9000" style="width:110px;font-family:var(--mono);padding:6px;
          background:#080d1c;border:1px solid var(--line);border-radius:7px;color:var(--cy)"></label>
      ${[0,9000,13000,21000].map(v=>`<button class="mini-btn" data-v="${v}">${v}</button>`).join("")}
    </div>
    <div class="cpu-grid">
      <div class="cpu-box"><h4>翻译过程</h4><div class="readout" id="v-out" style="margin:0;border:0;background:none;padding:0"></div></div>
      <div class="cpu-box"><h4>页表</h4><div id="v-tbl" class="tbl-mono"></div></div>
    </div>
    <div class="lab-hint">🎭 骗术三连：① 每个进程都以为自己有整块连续内存 ② 你越界访问别人的内存会被拦下（段错误就是这么来的）③ 内存不够时可以偷偷把某页挪到硬盘上。</div>`;
  const PT = {0:{f:7,ok:1},1:{f:3,ok:1},2:{f:9,ok:1},3:{f:null,ok:0},4:{f:1,ok:1}};
  function draw(){
    const va = Math.max(0, +$("#v-in",el).value|0);
    const pg = Math.floor(va/4096), off = va%4096, e = PT[pg];
    $("#v-tbl",el).innerHTML =
      `<table style="width:100%;border-collapse:collapse">
        <tr><th style="border:1px solid var(--line);padding:5px">虚拟页</th>
            <th style="border:1px solid var(--line);padding:5px">物理页框</th>
            <th style="border:1px solid var(--line);padding:5px">有效</th></tr>
        ${Object.entries(PT).map(([k,v])=>
          `<tr style="${+k===pg?"background:#fbbf2433":""}">
            <td style="border:1px solid var(--line);padding:5px;text-align:center">${k}</td>
            <td style="border:1px solid var(--line);padding:5px;text-align:center">${v.f===null?"—":v.f}</td>
            <td style="border:1px solid var(--line);padding:5px;text-align:center">${v.ok?"✓":"✗"}</td></tr>`).join("")}
      </table>`;
    $("#v-out",el).innerHTML =
      `<span class="k">虚拟地址：</span><span class="v">${va}</span><br>
       <span class="k">拆开 →</span> 页号 <span class="v">${pg}</span> ＋ 页内偏移 <span class="v">${off}</span>
         <span style="color:var(--dim)">（${va} ÷ 4096 = ${pg} 余 ${off}）</span><br>
       <span class="k">查页表：</span>${
         !e ? `<span style="color:var(--rd)">这一页根本没映射 → 💥 Segmentation fault</span>`
         : !e.ok ? `<span style="color:var(--gd)">页不在内存 → 缺页中断，OS 去硬盘搬</span>`
         : `虚拟页 ${pg} → 物理页框 <span class="v">${e.f}</span>`}<br>
       ${e&&e.ok?`<span class="k">真实物理地址：</span><span class="v" style="color:var(--gr)">${e.f*4096+off}</span>
         <span style="color:var(--dim)">（${e.f} × 4096 + ${off}）</span>`:""}`;
  }
  $("#v-in",el).oninput=draw;
  el.onclick=e=>{ const t=e.target.closest("[data-v]"); if(!t)return; $("#v-in",el).value=t.dataset.v; draw(); };
  draw();
};

/* ---------- 13. 抽象层全景（序章用） ---------- */
LABS.tower = function(el){
  const L = [
    ["你写的代码","#fb7185","print(\"hi\") / for 循环 / 函数","世界6-7"],
    ["编程语言 + 编译器","#f97316","把人话翻译成机器指令","世界6"],
    ["操作系统","#fbbf24","分配CPU时间、假装内存无限多","世界9"],
    ["机器指令 (ISA)","#a3e635","MOV / ADD / JMP —— CPU的母语","世界5"],
    ["微架构","#34d399","寄存器、ALU、流水线、缓存","世界4·8"],
    ["数字逻辑","#31e1f7","与门、或门、加法器、触发器","世界2"],
    ["电路与比特","#818cf8","高电压=1，低电压=0","世界1"],
    ["晶体管 / 沙子","#a78bfa","一个能被电控制的开关","世界1"]
  ];
  el.innerHTML = `
    <p style="margin-top:0">这就是你要爬的塔。<b>每一层只需要知道下一层「能干什么」，不需要知道它「怎么干的」</b> —— 这个叫抽象，是整个计算机科学最重要的一个词。</p>
    <div style="display:flex;flex-direction:column;gap:6px;margin:16px 0">
      ${L.map(([n,c,d,w],i)=>`
        <div style="border:1px solid ${c}66;background:linear-gradient(90deg,${c}22,transparent);
                    border-radius:11px;padding:12px 16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;
                    margin-left:${i*8}px">
          <b style="color:${c};min-width:150px;font-size:14px">${n}</b>
          <span style="flex:1;font-size:13px;color:var(--dim);min-width:180px">${d}</span>
          <span class="chip" style="color:${c};border-color:${c}55">${w}</span>
        </div>`).join("")}
    </div>
    <div class="lab-hint">🎯 从下往上爬。爬完你会发现：<code>a + b</code> 这三个字符，背后有八层楼在给你干活。</div>`;
};

/* ---------- 14. 编译流水线 ---------- */
LABS.compile = function(el){
  const stages = [
    {n:"① 源代码", f:"main.c", c:`int add(int a, int b){\n    return a + b;\n}\nint main(){\n    return add(2, 3);\n}`, say:"你写的人话。人看得懂，CPU 一个字都不认识。"},
    {n:"② 预处理", f:"main.i", c:`// #include 被展开成几千行\n// #define 被替换\n// 注释被删掉\nint add(int a, int b){\n    return a + b;\n}\nint main(){\n    return add(2, 3);\n}`, say:"纯文本替换。#include 就是「把那个文件整个粘贴到这里」。"},
    {n:"③ 编译成汇编", f:"main.s", c:`add:\n    mov  eax, edi\n    add  eax, esi\n    ret\nmain:\n    mov  esi, 3\n    mov  edi, 2\n    call add\n    ret`, say:"这一步最难：语法分析、优化。出来的是「人还能读」的机器指令。"},
    {n:"④ 汇编成机器码", f:"main.o", c:`89 f8            ; mov eax, edi\n01 f0            ; add eax, esi\nc3               ; ret\nbe 03 00 00 00   ; mov esi, 3\nbf 02 00 00 00   ; mov edi, 2\ne8 ?? ?? ?? ??   ; call add ← 地址还不知道！\nc3               ; ret`, say:"一对一翻译成字节。注意 call 的地址是 ?? —— 还不知道 add 最后在哪。"},
    {n:"⑤ 链接", f:"a.out", c:`# 链接器做两件事：\n# 1. 把多个 .o 拼起来（还有库函数）\n# 2. 把所有 ?? 填上真实地址\n\ne8 0a 00 00 00   ; call add → 补上了！\n\n→ 可执行文件 a.out 诞生 🎉`, say:"「undefined reference」报错就出在这一步：你用了某个函数，但链接器找不到它的实现。"}
  ];
  el.innerHTML = `
    <p style="margin-top:0"><code>gcc main.c</code> 这一条命令，其实偷偷做了 5 件事。点标签看每一步。</p>
    <div class="lab-row" id="p-tabs">${stages.map((s,i)=>
      `<button class="sw ${i===0?"on":""}" data-i="${i}"><span class="dot"></span>${s.n}</button>`).join("")}</div>
    <div class="cpu-box"><h4 id="p-f"></h4><pre style="margin:0;background:none;border:0;padding:0"><code id="p-c"></code></pre></div>
    <div class="readout" id="p-s"></div>
    <div class="lab-hint">🔧 想亲眼看？终端里试：<code>gcc -S main.c</code> 出汇编，<code>objdump -d a.out</code> 反汇编。</div>`;
  function draw(i){
    const s=stages[i];
    $("#p-f",el).textContent=s.f;
    $("#p-c",el).textContent=s.c;
    $("#p-s",el).innerHTML=`💡 ${s.say}`;
  }
  $("#p-tabs",el).onclick=e=>{
    const t=e.target.closest("[data-i]"); if(!t)return;
    $$("[data-i]",el).forEach(x=>x.classList.toggle("on",x===t)); draw(+t.dataset.i);
  };
  draw(0);
};

/* ---------- 15. 进程调度 ---------- */
LABS.sched = function(el){
  el.innerHTML = `
    <p style="margin-top:0">你只有 1 个 CPU 核，却同时开着浏览器、音乐、编辑器。怎么办？<b>飞快地轮流</b>，快到你察觉不到。</p>
    <div class="lab-row">
      <button class="primary" id="d-run" style="padding:9px 20px">▶ 开始调度</button>
      <button class="mini-btn" id="d-reset">↺ 重置</button>
      <span class="chip" id="d-t">时间片 0</span>
    </div>
    <div class="cpu-box"><h4>CPU 现在在跑谁</h4><div id="d-cpu" style="font-family:var(--mono);font-size:17px;min-height:30px;color:var(--gd)">—— 空闲 ——</div></div>
    <div id="d-procs" style="display:flex;flex-direction:column;gap:7px;margin:12px 0"></div>
    <div class="lab-hint">🎩 每次切换都要保存全部寄存器、换页表 —— 这叫「上下文切换」，有成本。切太勤反而慢。</div>
  `;
  const P = [
    {n:"浏览器", need:6, done:0, c:"#31e1f7"},
    {n:"音乐播放", need:4, done:0, c:"#34d399"},
    {n:"编辑器", need:5, done:0, c:"#fbbf24"},
    {n:"后台更新", need:3, done:0, c:"#a78bfa"}
  ];
  let t=0, cur=0, timer=null;
  function draw(){
    $("#d-procs",el).innerHTML = P.map((p,i)=>{
      const pct = p.done/p.need*100;
      const fin = p.done>=p.need;
      return `<div style="display:flex;gap:11px;align-items:center;
        border:1px solid ${i===cur&&!fin?p.c:"var(--line)"};border-radius:10px;padding:9px 13px;
        background:${i===cur&&!fin?p.c+"1f":"transparent"}">
        <b style="min-width:82px;font-size:13px;color:${p.c}">${p.n}</b>
        <div style="flex:1;height:9px;background:#0007;border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${p.c};transition:.3s;border-radius:99px"></div></div>
        <span class="chip" style="min-width:66px;text-align:center">${fin?"✓ 完成":p.done+"/"+p.need}</span>
      </div>`;
    }).join("");
    $("#d-t",el).textContent="时间片 "+t;
  }
  function tick(){
    const pending = P.map((p,i)=>i).filter(i=>P[i].done<P[i].need);
    if(!pending.length){
      clearInterval(timer); timer=null;
      $("#d-cpu",el).innerHTML=`<span style="color:var(--gr)">🏁 全部完成。你「感觉」它们是同时跑的，其实是轮流。</span>`;
      draw(); return;
    }
    cur = pending[t % pending.length];
    P[cur].done++; t++;
    $("#d-cpu",el).innerHTML=`▶ ${P[cur].n} <span style="color:var(--dim);font-size:13px">（其他 ${pending.length-1} 个被冻在原地等着）</span>`;
    draw();
  }
  $("#d-run",el).onclick=()=>{ if(timer)return; timer=setInterval(tick,450); };
  $("#d-reset",el).onclick=()=>{ if(timer){clearInterval(timer);timer=null;} t=0;cur=0;P.forEach(p=>p.done=0);
    $("#d-cpu",el).textContent="—— 空闲 ——"; draw(); };
  draw();
};

/* ---------- 16. 延迟数量级 ---------- */
LABS.latency = function(el){
  const D=[
    ["CPU 一个周期","0.3 ns","1 秒","💓"],
    ["L1 缓存","1 ns","3 秒","⚡"],
    ["L2 缓存","4 ns","13 秒","🔋"],
    ["L3 缓存","20 ns","1 分钟","🧊"],
    ["内存 DRAM","100 ns","5 分钟","🏃"],
    ["SSD 读一次","150 μs","5 天","🚚"],
    ["机械硬盘寻道","10 ms","1 年","🐢"],
    ["同城网络往返","0.5 ms","19 天","📮"],
    ["跨洲网络往返","150 ms","15 年","🐌"]
  ];
  el.innerHTML = `
    <p style="margin-top:0">把「1个CPU周期」放大成「1秒」，其他等待就变成人能感受的时间。<b>这张表是性能直觉的来源。</b></p>
    <table style="width:100%"><tr><th></th><th>真实耗时</th><th>放大后（人的尺度）</th></tr>
    ${D.map(([n,r,h,e])=>`<tr>
      <td>${e} ${n}</td>
      <td class="tbl-mono" style="color:var(--cy)">${r}</td>
      <td style="color:var(--gd);font-weight:700">${h}</td></tr>`).join("")}
    </table>
    <div class="lab-hint">🤯 CPU 等一次内存，相当于你等 5 分钟。等一次跨洲网络请求，相当于等 15 年。<br>
    所以工程师拼命做的事就三件：<b>别去内存</b>（用缓存）、<b>别去磁盘</b>（用内存）、<b>别去网络</b>（用本地缓存）。</div>`;
};
