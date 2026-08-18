/* ===== 存档 / 等级 / 徽章 ===== */
const RANKS = [
  {lv:1,  need:0,    icon:"🥚", name:"电子学徒",   desc:"你连电都还没摸到，但勇气可嘉。"},
  {lv:2,  need:100,  icon:"🔌", name:"见习焊工",   desc:"你知道 0 和 1 到底是什么了。"},
  {lv:3,  need:280,  icon:"🚪", name:"逻辑门卫",   desc:"用几个开关，你造出了会思考的电路。"},
  {lv:4,  need:520,  icon:"🔢", name:"二进制术士", desc:"负数、小数在你眼里都是一串比特。"},
  {lv:5,  need:820,  icon:"🧠", name:"CPU工程师",  desc:"你亲手拼出了一颗会跳动的心脏。"},
  {lv:6,  need:1180, icon:"📜", name:"指令铸造师", desc:"你会说 CPU 的母语了。"},
  {lv:7,  need:1580, icon:"⚙️", name:"编译炼金术士",desc:"人话变机器话，你看穿了这层魔法。"},
  {lv:8,  need:2020, icon:"🎭", name:"内存驯兽师", desc:"栈、堆、指针，尽在掌握。"},
  {lv:9,  need:2480, icon:"🚀", name:"性能猎手",   desc:"缓存与流水线，是你的加速器。"},
  {lv:10, need:2900, icon:"🏰", name:"系统领主",   desc:"你理解了操作系统的骗术。"},
  {lv:11, need:3250, icon:"👑", name:"体系结构大师",desc:"从沙子到程序，全线贯通。"}
];

const BADGES = [
  {id:"first_light", icon:"💡", name:"第一次通电",  hint:"完成第 1 关"},
  {id:"gate_master", icon:"🚪", name:"门的主人",    hint:"通关世界2"},
  {id:"twos_comp",   icon:"➖", name:"负数收服者",  hint:"搞懂补码"},
  {id:"float_god",   icon:"🎈", name:"浮点驯服",    hint:"搞懂 IEEE754"},
  {id:"cpu_built",   icon:"🧠", name:"我造了CPU",   hint:"通关世界4"},
  {id:"first_run",   icon:"▶️", name:"它跑起来了",  hint:"单步执行迷你CPU"},
  {id:"stack_walk",  icon:"🥞", name:"栈行者",      hint:"看懂函数调用栈"},
  {id:"cache_hit",   icon:"⚡", name:"缓存命中",    hint:"通关缓存关"},
  {id:"perfect",     icon:"🎯", name:"一击必中",    hint:"某关全部一次答对"},
  {id:"halfway",     icon:"🗺️", name:"半程英雄",    hint:"完成一半关卡"},
  {id:"all_clear",   icon:"👑", name:"全线贯通",    hint:"通关全部关卡"}
];

const KEY = "cpuquest.save.v1";
const DEF = {xp:0, done:{}, badges:{}, answered:{}, perfect:{}};

const S = {
  d: DEF,
  load(){
    try{
      const r = localStorage.getItem(KEY);
      if(r) this.d = Object.assign({}, DEF, JSON.parse(r));
    }catch(e){ this.d = Object.assign({},DEF); }
    for(const k of ["done","badges","answered","perfect"]) this.d[k] = this.d[k]||{};
    return this;
  },
  save(){ try{ localStorage.setItem(KEY, JSON.stringify(this.d)); }catch(e){} },
  reset(){ this.d = JSON.parse(JSON.stringify(DEF)); this.save(); },

  rank(xp = this.d.xp){
    let r = RANKS[0];
    for(const x of RANKS) if(xp >= x.need) r = x;
    return r;
  },
  nextRank(xp = this.d.xp){ return RANKS.find(x => x.need > xp) || null; },

  addXP(n){
    const before = this.rank().lv;
    this.d.xp += n;
    this.save();
    const after = this.rank();
    return after.lv > before ? after : null;   // 返回新等级（若升级）
  },
  isDone(id){ return !!this.d.done[id]; },
  finish(id){ this.d.done[id] = Date.now(); this.save(); },
  doneCount(){ return Object.keys(this.d.done).length; },

  grant(id){
    if(this.d.badges[id]) return null;
    this.d.badges[id] = Date.now(); this.save();
    return BADGES.find(b => b.id === id) || null;
  },
  hasBadge(id){ return !!this.d.badges[id]; },
  badgeCount(){ return Object.keys(this.d.badges).length; },

  // 记录某题是否已答对过（防刷 XP）
  answeredOK(qid){ return this.d.answered[qid] === 1; },
  markAnswer(qid, ok){
    if(this.d.answered[qid] === 1) return;
    this.d.answered[qid] = ok ? 1 : 0;
    this.save();
  }
};
S.load();
