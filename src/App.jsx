import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase, ADMIN_CODE } from "./supabase.js";
import {
  SCHEDULE, TYPES, ROLES, STATUS, RSVP, parseDT, fmtDate, daysBetween,
} from "./schedule.js";

const LS_ME = "medexpo:me";
const LS_ADMIN = "medexpo:admin";

// ————— هوية المستخدم (محفوظة محلياً) —————
function loadMe() {
  try { return JSON.parse(localStorage.getItem(LS_ME)) || null; } catch { return null; }
}

export default function App() {
  const [me, setMe] = useState(loadMe());
  const [now, setNow] = useState(new Date());
  const [tab, setTab] = useState("events");
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(LS_ADMIN) === "1");

  const [rsvps, setRsvps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [anns, setAnns] = useState([]);
  const [connected, setConnected] = useState(!!supabase);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  // تحميل + اشتراك لحظي
  useEffect(() => {
    if (!supabase) { setConnected(false); return; }
    let alive = true;
    const fetchAll = async () => {
      const [r, t, a] = await Promise.all([
        supabase.from("rsvps").select("*"),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      if (r.data) setRsvps(r.data);
      if (t.data) setTasks(t.data);
      if (a.data) setAnns(a.data);
      setConnected(!r.error);
    };
    fetchAll();
    const ch = supabase
      .channel("realtime-hub")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, fetchAll)
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, []);

  if (!me) return <Onboarding onDone={(m) => { localStorage.setItem(LS_ME, JSON.stringify(m)); setMe(m); }} />;

  const next = useMemo(() => SCHEDULE.map(e => ({ ...e, dt: parseDT(e.date, e.start) }))
    .filter(e => e.dt >= now).sort((a, b) => a.dt - b.dt)[0] || null, [now]);

  const myOpen = tasks.filter(t => t.owner_role === me.role && t.status !== "done").length;

  return (
    <div className="app" dir="rtl">
      <header className="hdr">
        <div className="brand">
          <span className="pulse" />
          <div>
            <h1>مركز فريق المعرض</h1>
            <p>{me.name} · {me.role}</p>
          </div>
        </div>
        {next && <Countdown next={next} now={now} />}
      </header>

      {!connected && <div className="offline">غير متصل بالخادم — تأكد من إعداد Supabase. الجدول يعمل، لكن الحضور والمهام تحتاج اتصالاً.</div>}

      <nav className="tabs">
        <button className={tab === "events" ? "on" : ""} onClick={() => setTab("events")}>الفعاليات</button>
        <button className={tab === "tasks" ? "on" : ""} onClick={() => setTab("tasks")}>
          مهامي {myOpen > 0 && <em>{myOpen}</em>}
        </button>
        <button className={tab === "news" ? "on" : ""} onClick={() => setTab("news")}>الإعلانات</button>
        {isAdmin && <button className={tab === "admin" ? "on" : ""} onClick={() => setTab("admin")}>المتابعة</button>}
      </nav>

      <main>
        {tab === "events" && <Events now={now} me={me} rsvps={rsvps} />}
        {tab === "tasks" && <MyTasks me={me} tasks={tasks} now={now} />}
        {tab === "news" && <News me={me} anns={anns} isAdmin={isAdmin} />}
        {tab === "admin" && isAdmin && <Admin rsvps={rsvps} tasks={tasks} now={now} />}
      </main>

      <footer className="foot">
        {!isAdmin && <AdminUnlock onUnlock={() => { localStorage.setItem(LS_ADMIN, "1"); setIsAdmin(true); setTab("admin"); }} />}
        {isAdmin && <span className="ok">● وضع المتابعة مُفعّل</span>}
        <button className="link" onClick={() => { localStorage.removeItem(LS_ME); setMe(null); }}>تغيير الهوية</button>
      </footer>
    </div>
  );
}

// ————————————————————————————————————————————————
function Countdown({ next, now }) {
  const ms = parseDT(next.date, next.start) - now;
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return (
    <div className="cd" style={{ "--c": TYPES[next.type].dot }}>
      <span className="cd-label">القادم · {next.label}</span>
      <div className="cd-nums"><b>{d}</b><i>يوم</i><b>{h}</b><i>ساعة</i><b>{m}</b><i>د</i></div>
      <span className="cd-when">{fmtDate(next.date)} · {next.start}–{next.end}</span>
    </div>
  );
}

// ————————————————————————————————————————————————
function Onboarding({ onDone }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  return (
    <div className="app onb" dir="rtl">
      <div className="onb-card">
        <span className="pulse big" />
        <h1>مركز فريق المعرض الطبي</h1>
        <p className="sub">عرّف نفسك مرة واحدة لتأكيد حضورك ومتابعة مهامك.</p>
        <label className="flabel">اسمك</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم الكامل" />
        <label className="flabel">دورك</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="primary" disabled={!name.trim()} onClick={() => onDone({ name: name.trim(), role })}>
          دخول
        </button>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————
function Events({ now, me, rsvps }) {
  const events = SCHEDULE.map(e => ({ ...e, dt: parseDT(e.date, e.start), endDt: parseDT(e.date, e.end) }));
  const setRsvp = async (event_id, status) => {
    if (!supabase) return;
    await supabase.from("rsvps").upsert(
      { event_id, name: me.name, role: me.role, status, updated_at: new Date().toISOString() },
      { onConflict: "event_id,name" }
    );
  };

  return (
    <div className="tl">
      {events.map((e, i) => {
        const t = TYPES[e.type];
        const past = e.endDt < now;
        const dleft = daysBetween(now, e.dt);
        const mine = rsvps.find(r => r.event_id === e.id && r.name === me.name);
        const going = rsvps.filter(r => r.event_id === e.id && r.status === "going");
        return (
          <div key={i} className={`tl-row ${past ? "past" : ""}`}>
            <span className="tl-node" style={{ background: t.dot }} />
            <div className="tl-card">
              <div className="tl-top">
                <span className="badge" style={{ background: t.soft, color: t.dot }}>{t.ar}</span>
                {!past && dleft >= 0 && <span className="dleft">{dleft === 0 ? "اليوم" : `بعد ${dleft} يوم`}</span>}
              </div>
              <b className="tl-title">{e.label}</b>
              <span className="tl-meta">{fmtDate(e.date)} · {e.start}–{e.end}</span>

              {!past && (
                <div className="rsvp-row">
                  {Object.entries(RSVP).map(([k, v]) => (
                    <button key={k} className={`rsvp ${mine?.status === k ? "on" : ""}`}
                      style={mine?.status === k ? { background: v.color, borderColor: v.color, color: "#06231f" } : {}}
                      onClick={() => setRsvp(e.id, k)} disabled={!supabase}>{v.ar}</button>
                  ))}
                  <span className="going-count">{going.length} حاضر</span>
                </div>
              )}
              {going.length > 0 && (
                <details className="who"><summary>من سيحضر</summary>
                  <div className="who-list">{going.map(g => <span key={g.id || g.name}>{g.name}</span>)}</div>
                </details>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ————————————————————————————————————————————————
function MyTasks({ me, tasks, now }) {
  const mine = tasks.filter(t => t.owner_role === me.role);
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const setStatus = async (id, status) => { if (supabase) await supabase.from("tasks").update({ status }).eq("id", id); };
  const urgency = (t) => {
    if (t.status === "done" || !t.deadline) return "none";
    const d = daysBetween(today0, parseDT(t.deadline));
    return d < 0 ? "over" : d <= 7 ? "soon" : "none";
  };
  const sorted = [...mine].sort((a, b) => {
    const rank = x => x.status === "done" ? 3 : urgency(x) === "over" ? 0 : urgency(x) === "soon" ? 1 : 2;
    return rank(a) - rank(b) || (a.deadline || "9999").localeCompare(b.deadline || "9999");
  });
  if (sorted.length === 0) return <p className="empty">لا مهام موكلة إليك بعد. ستظهر هنا فور إسنادها.</p>;
  return (
    <ul className="alist">
      {sorted.map(t => {
        const u = urgency(t);
        return (
          <li key={t.id} className={`acard ${t.status === "done" ? "done" : ""} u-${u}`}>
            <div className="acard-main">
              <span className="atask">{t.title}</span>
              {t.deadline && <span className={`adl u-${u}`}>{u === "over" ? "متأخر · " : u === "soon" ? "قريب · " : ""}{fmtDate(t.deadline)}</span>}
            </div>
            <select value={t.status} onChange={e => setStatus(t.id, e.target.value)} style={{ color: STATUS[t.status].color }}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.ar}</option>)}
            </select>
          </li>
        );
      })}
    </ul>
  );
}

// ————————————————————————————————————————————————
function News({ me, anns, isAdmin }) {
  const [body, setBody] = useState("");
  const post = async () => {
    if (!body.trim() || !supabase) return;
    await supabase.from("announcements").insert({ body: body.trim(), author: me.name });
    setBody("");
  };
  return (
    <div className="news">
      {isAdmin && (
        <div className="post">
          <textarea rows={2} value={body} onChange={e => setBody(e.target.value)} placeholder="اكتب إعلاناً للفريق…" />
          <button className="primary" onClick={post} disabled={!body.trim()}>نشر</button>
        </div>
      )}
      {anns.length === 0 && <p className="empty">لا إعلانات بعد.</p>}
      {anns.map(a => (
        <div key={a.id} className="ann">
          <p>{a.body}</p>
          <span className="ann-meta">{a.author} · {new Date(a.created_at).toLocaleString("ar")}</span>
        </div>
      ))}
    </div>
  );
}

// ————————————————————————————————————————————————
function Admin({ rsvps, tasks, now }) {
  const [owner, setOwner] = useState(ROLES[0]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const add = async () => {
    if (!title.trim() || !supabase) return;
    await supabase.from("tasks").insert({ owner_role: owner, title: title.trim(), deadline: deadline || null, status: "todo" });
    setTitle(""); setDeadline("");
  };
  const del = async (id) => { if (supabase) await supabase.from("tasks").delete().eq("id", id); };

  const upcoming = SCHEDULE.map(e => ({ ...e, dt: parseDT(e.date, e.start) })).filter(e => e.dt >= now).slice(0, 4);
  const open = tasks.filter(t => t.status !== "done");
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overdue = open.filter(t => t.deadline && daysBetween(today0, parseDT(t.deadline)) < 0);

  return (
    <div className="admin">
      <div className="stats">
        <div className="stat"><b>{open.length}</b><span>مهمة مفتوحة</span></div>
        <div className="stat warn"><b>{overdue.length}</b><span>متأخرة</span></div>
        <div className="stat"><b>{new Set(rsvps.map(r => r.name)).size}</b><span>عضو فاعل</span></div>
      </div>

      <h3 className="sec">حضور الفعاليات القادمة</h3>
      {upcoming.map(e => {
        const g = rsvps.filter(r => r.event_id === e.id && r.status === "going");
        const m = rsvps.filter(r => r.event_id === e.id && r.status === "maybe");
        return (
          <div key={e.id} className="att-row">
            <span className="att-label">{e.label}<i>{fmtDate(e.date)}</i></span>
            <span className="att-nums"><b style={{ color: RSVP.going.color }}>{g.length}</b> حاضر · <b style={{ color: RSVP.maybe.color }}>{m.length}</b> ربما</span>
          </div>
        );
      })}

      <h3 className="sec">إسناد مهمة</h3>
      <div className="add">
        <select value={owner} onChange={e => setOwner(e.target.value)}>
          {ROLES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <input className="task-in" placeholder="المهمة…" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        <button className="add-btn" onClick={add}>إسناد</button>
      </div>

      <h3 className="sec">كل المهام المفتوحة</h3>
      {open.length === 0 && <p className="empty">لا مهام مفتوحة.</p>}
      <ul className="alist">
        {open.map(t => {
          const u = t.deadline && daysBetween(today0, parseDT(t.deadline)) < 0 ? "over" : "none";
          return (
            <li key={t.id} className={`acard u-${u}`}>
              <div className="acard-main">
                <span className="aowner">{t.owner_role}</span>
                <span className="atask">{t.title}</span>
                {t.deadline && <span className={`adl u-${u}`}>{u === "over" ? "متأخر · " : ""}{fmtDate(t.deadline)}</span>}
              </div>
              <button className="del" onClick={() => del(t.id)}>✕</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ————————————————————————————————————————————————
function AdminUnlock({ onUnlock }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  if (!open) return <button className="link" onClick={() => setOpen(true)}>وضع المتابعة</button>;
  return (
    <span className="unlock">
      <input type="password" value={code} onChange={e => setCode(e.target.value)} placeholder="كود المتابعة" />
      <button className="link" onClick={() => code === ADMIN_CODE ? onUnlock() : alert("كود غير صحيح")}>فتح</button>
    </span>
  );
}
