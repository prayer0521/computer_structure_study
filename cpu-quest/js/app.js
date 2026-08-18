/* ===== 引擎：路由 / 渲染 / 战斗 / 反馈 =====
   依赖：state.js (S, RANKS, BADGES) · labs.js ($, $$, LABS) · content-*.js (LEVELS, WORLDS)
   注意：$ / $$ 已在 labs.js 中声明，此处直接复用，不可重复声明 */

const XP_PER_Q = 15;                       // 每道 Boss 题首次答对的 XP
const ALL = WORLDS.flatMap(w => w.nodes);  // 全部关卡的线性顺序
const LEVEL_BADGE = { w3a:"twos_comp", w3b:"float_god" };
const BLOCK_CLS = { story:"b-story", analogy:"b-analogy", aha:"b-aha", warn:"b-warn", lab:"b-lab" };

/* ---------- 解锁规则：第一关永久开放，其余需前一关通关 ---------- */
function unlocked(id){
  const i = ALL.indexOf(id);
  if(i <= 0) return i === 0;
  return S.isDone(ALL[i-1]);
}
function nextUp(){ return ALL.find(id => !S.isDone(id)) || null; }

/* ================= HUD ================= */
function syncHUD(){
  const r = S.rank(), nx = S.nextRank();
  $("#rank-icon").textContent = r.icon;
  $("#rank-name").textContent = r.name;
  $("#rank-lv").textContent = "Lv." + r.lv;
  $("#stat-done").textContent = S.doneCount();
  $("#stat-badge").textContent = S.badgeCount();
  if(nx){
    const span = nx.need - r.need, got = S.d.xp - r.need;
    $("#xp-fill").style.width = Math.min(100, got / span * 100) + "%";
    $("#xp-label").textContent = `${S.d.xp} / ${nx.need} XP`;
    $("#xp-next").textContent = "下一级：" + nx.name;
  }else{
    $("#xp-fill").style.width = "100%";
    $("#xp-label").textContent = S.d.xp + " XP";
    $("#xp-next").textContent = "已满级 👑";
  }
}

/* ================= 反馈特效 ================= */
function toast(msg, gold){
  const d = document.createElement("div");
  d.className = "toast" + (gold ? " gold" : "");
  d.innerHTML = msg;
  $("#toast-wrap").appendChild(d);
  setTimeout(() => d.remove(), 2800);
}
function xpPop(n, el){
  const p = document.createElement("div");
  p.className = "pop-xp";
  p.textContent = "+" + n + " XP";
  const r = el ? el.getBoundingClientRect() : {left:innerWidth/2, top:innerHeight/2, width:0};
  p.style.left = (r.left + r.width/2) + "px";
  p.style.top  = r.top + "px";
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1200);
}
function confetti(n = 90){
  const cols = ["#31e1f7","#a78bfa","#fbbf24","#34d399","#fb7185"];
  for(let i = 0; i < n; i++){
    const c = document.createElement("div");
    c.className = "conf";
    c.style.left = Math.random()*100 + "vw";
    c.style.top = "-14px";
    c.style.background = cols[i % cols.length];
    c.style.animationDuration = (1.9 + Math.random()*1.6) + "s";
    c.style.animationDelay = (Math.random()*.45) + "s";
    $("#fx").appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}
function levelUp(r){
  $("#lu-icon").textContent = r.icon;
  $("#lu-name").textContent = r.name;
  $("#lu-desc").textContent = r.desc;
  $("#levelup").classList.remove("hidden");
  confetti(150);
}
$("#lu-close").onclick = () => $("#levelup").classList.add("hidden");

function gainXP(n, el){
  const up = S.addXP(n);
  xpPop(n, el);
  syncHUD();
  if(up) setTimeout(() => levelUp(up), 420);
}
function giveBadge(id){
  const b = S.grant(id);
  if(b){ toast(`🏆 获得徽章 <b>${b.name}</b><br><span style="color:var(--dim);font-size:12px">${b.hint}</span>`, true); syncHUD(); }
}
/* labs.js 里的实验完成时会回调这个全局函数 */
function onLabDone(badgeId){ if(badgeId) giveBadge(badgeId); }

/* ================= 地图 ================= */
function renderMap(){
  const nx = nextUp(), total = ALL.length, done = S.doneCount();
  let h = `
    <div class="hero">
      <h1>从沙子到程序</h1>
      <p>亲手造一台计算机 · 一共 ${total} 关，你已通关 ${done} 关</p>
    </div>
    <div class="block" style="padding:16px 22px">
      <div class="xp-row"><span>总进度</span><span>${done} / ${total}</span></div>
      <div class="xp-bar"><div style="height:100%;width:${total?done/total*100:0}%;
        background:linear-gradient(90deg,var(--cy),var(--gr));border-radius:99px;transition:width .6s"></div></div>
    </div>`;

  for(const w of WORLDS){
    const wDone = w.nodes.filter(n => S.isDone(n)).length;
    h += `<div class="world">
      <div class="world-head">
        <span class="world-num">${w.num}</span>
        <h2>${w.icon} ${w.name}</h2>
        <span class="sub">${w.sub}<br>${wDone}/${w.nodes.length} 通关</span>
      </div>
      <div class="nodes">`;
    for(const id of w.nodes){
      const L = LEVELS[id];
      if(!L){ continue; }
      const ok = unlocked(id), fin = S.isDone(id);
      const cls = fin ? "done" : (!ok ? "locked" : (id === nx ? "next" : ""));
      h += `<div class="node ${cls}" data-go="${ok ? id : ""}">
        <div class="ico">${L.icon}</div>
        <h3>${L.title}</h3>
        <div class="hook">${ok ? L.hook : "先通关上一关"}</div>
        <div class="foot">
          <span>+${L.xp} XP</span>
          <span>· ${L.quiz.length} 题</span>
          ${L.blocks.some(b => b.t === "lab") ? `<span style="color:var(--cy)">· ⚡ 可动手</span>` : ""}
        </div>
      </div>`;
    }
    h += `</div></div>`;
  }

  h += `<div class="world">
    <div class="world-head"><span class="world-num">收藏</span><h2>🏆 徽章墙</h2>
      <span class="sub">${S.badgeCount()}/${BADGES.length}</span></div>
    <div class="badge-grid">
      ${BADGES.map(b => `<div class="badge ${S.hasBadge(b.id) ? "" : "locked"}">
        <span class="bi">${b.icon}</span><b>${b.name}</b>
        <div style="color:var(--dim);margin-top:3px">${b.hint}</div></div>`).join("")}
    </div>
  </div>
  <div style="text-align:center;margin-top:40px">
    <button class="ghost" id="btn-reset">🗑 清空进度重新开始</button>
  </div>`;

  const v = $("#view");
  v.innerHTML = h;
  v.querySelectorAll(".node").forEach((n, i) => {
    n.style.animation = `rise .4s ${Math.min(i*.03, .5)}s backwards`;
    n.onclick = () => { if(n.dataset.go) location.hash = "#/lv/" + n.dataset.go; };
  });
  $("#btn-reset").onclick = () => {
    if(confirm("确定清空全部进度？XP、通关记录、徽章都会消失，无法恢复。")){
      S.reset(); syncHUD(); renderMap(); toast("进度已清空，从头再来 🌱");
    }
  };
  scrollTo(0, 0);
}

/* ================= 关卡页 ================= */
function renderLesson(id){
  const L = LEVELS[id];
  if(!L || !unlocked(id)){ location.hash = "#/map"; return; }

  const wIdx = WORLDS.findIndex(w => w.nodes.includes(id));
  const w = WORLDS[wIdx];
  let h = `
    <div class="crumb"><a data-map>🗺️ 地图</a> / ${w.num} ${w.name}</div>
    <div class="lesson-head">
      <h1>${L.icon} ${L.title}</h1>
      <p class="hook">${L.hook}</p>
    </div>`;

  L.blocks.forEach((b, i) => {
    h += `<div class="block ${BLOCK_CLS[b.t] || ""}" style="animation-delay:${Math.min(i*.05,.4)}s">
      ${b.h ? `<h3>${b.h}</h3>` : ""}
      ${b.html || ""}
      ${b.lab ? `<div class="lab-wrap" data-lab="${b.lab}"></div>` : ""}
    </div>`;
  });

  h += `<div class="block boss-card" id="boss">
      <h3>👾 Boss 战 · ${L.quiz.length} 题</h3>
      <p style="margin-top:0;color:var(--dim);font-size:13px">
        答错不扣血也不扣分，只会给你解析。首次答对每题 +${XP_PER_Q} XP。</p>
      <div class="boss-hp"><div class="boss-fill" id="hp" style="width:100%"></div></div>
      <div class="boss-meta"><span>Boss HP</span><span id="hp-txt">${L.quiz.length} / ${L.quiz.length}</span></div>
      <div id="qbox" style="margin-top:20px"></div>
    </div>
    <div class="finish"><div class="finish-in">
      <div class="info" id="fin-info">通关奖励 <b>+${L.xp} XP</b>${S.isDone(id) ? "（已领取）" : ""}</div>
      <button class="ghost" data-map>🗺️ 地图</button>
      <button class="primary" id="btn-next" disabled>先打完 Boss</button>
    </div></div>`;

  const v = $("#view");
  v.innerHTML = h;
  v.querySelectorAll("[data-map]").forEach(a => a.onclick = () => location.hash = "#/map");

  /* 挂载交互实验 */
  v.querySelectorAll("[data-lab]").forEach(el => {
    const fn = LABS[el.dataset.lab];
    if(fn){ try{ fn(el); }catch(e){ el.innerHTML = `<div style="color:var(--rd)">实验加载失败：${e.message}</div>`; console.error(e); } }
    else el.innerHTML = `<div style="color:var(--dim)">（实验 ${el.dataset.lab} 尚未实现）</div>`;
  });

  runBoss(id, L);
  scrollTo(0, 0);
}

/* ================= Boss 战：逐题推进 ================= */
function runBoss(id, L){
  const box = $("#qbox"), total = L.quiz.length;
  let idx = 0, killed = 0, perfect = true;

  function hp(){
    $("#hp").style.width = (100 - killed/total*100) + "%";
    $("#hp-txt").textContent = (total - killed) + " / " + total;
  }

  function ask(){
    if(idx >= total){ victory(); return; }
    const q = L.quiz[idx];
    const card = document.createElement("div");
    card.className = "block quiz";
    card.style.animationDelay = "0s";
    card.innerHTML = `
      <div class="q-text">第 ${idx+1} / ${total} 题 · ${q.q}</div>
      <div class="opts">${q.opts.map((o, i) =>
        `<button class="opt" data-i="${i}"><span class="key">${"ABCD"[i]}</span><span>${o}</span></button>`).join("")}</div>
      <div class="hold"></div>`;
    box.appendChild(card);

    card.querySelectorAll(".opt").forEach(btn => btn.onclick = () => {
      const pick = +btn.dataset.i, ok = pick === q.answer;
      card.querySelectorAll(".opt").forEach(b => {
        b.disabled = true;
        if(+b.dataset.i === q.answer) b.classList.add("right");
        else if(b === btn) b.classList.add("wrong");
      });

      const firstTime = !S.answeredOK(q.id);
      if(ok && firstTime) gainXP(XP_PER_Q, btn);
      S.markAnswer(q.id, ok);
      if(!ok) perfect = false;

      const ex = document.createElement("div");
      ex.className = "explain" + (ok ? "" : " bad");
      ex.innerHTML = `<span class="tag">${ok ? "✅ 命中！" : "❌ 差一点"}</span>${q.ex}`;
      card.querySelector(".hold").appendChild(ex);

      killed++; hp();
      idx++;
      const go = document.createElement("button");
      go.className = "primary";
      go.style.marginTop = "14px";
      go.textContent = idx >= total ? "结算战果 →" : "下一题 →";
      go.onclick = () => { go.remove(); ask(); };
      card.querySelector(".hold").appendChild(go);
      go.scrollIntoView({behavior:"smooth", block:"center"});
    });
    card.scrollIntoView({behavior:"smooth", block:"center"});
  }

  function victory(){
    const fresh = !S.isDone(id);
    if(fresh){
      S.finish(id);
      gainXP(L.xp, $("#boss"));
      confetti(120);
    }
    /* 徽章结算 */
    if(S.doneCount() >= 1) giveBadge("first_light");
    if(LEVEL_BADGE[id]) giveBadge(LEVEL_BADGE[id]);
    const w = WORLDS.find(x => x.nodes.includes(id));
    if(w && w.badge && w.nodes.every(n => S.isDone(n))) giveBadge(w.badge);
    if(perfect) giveBadge("perfect");
    if(S.doneCount() >= Math.ceil(ALL.length/2)) giveBadge("halfway");
    if(S.doneCount() >= ALL.length) giveBadge("all_clear");

    const card = document.createElement("div");
    card.className = "block b-aha";
    card.innerHTML = `
      <h3>🎉 关卡通过</h3>
      <p>Boss 已倒下。${fresh ? `通关奖励 <b>+${L.xp} XP</b> 已入账。` : `（这关之前已通过，通关奖励不重复发放）`}</p>
      <p style="color:var(--dim);font-size:13px">${perfect ? "🎯 全部一次答对，漂亮。" : "有答错的题？往上翻翻解析，比重做一遍有用。"}</p>`;
    box.appendChild(card);

    const nid = ALL[ALL.indexOf(id) + 1];
    const btn = $("#btn-next");
    btn.disabled = false;
    if(nid && LEVELS[nid]){
      btn.textContent = `下一关：${LEVELS[nid].title} →`;
      btn.onclick = () => location.hash = "#/lv/" + nid;
      $("#fin-info").innerHTML = `✅ 本关已通过 · 下一关已解锁`;
    }else{
      btn.textContent = "🗺️ 回到地图";
      btn.onclick = () => location.hash = "#/map";
      $("#fin-info").innerHTML = `✅ 已通关目前<b>全部</b>已上线的关卡`;
    }
    card.scrollIntoView({behavior:"smooth", block:"center"});
  }

  hp(); ask();
}

/* ================= 路由 ================= */
function route(){
  const m = location.hash.match(/^#\/lv\/(.+)$/);
  if(m) renderLesson(m[1]);
  else renderMap();
}
addEventListener("hashchange", route);
$("#btn-map").onclick = () => location.hash = "#/map";
$(".logo").onclick = () => location.hash = "#/map";

syncHUD();
route();
