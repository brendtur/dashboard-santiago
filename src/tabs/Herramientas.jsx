import { useState, useEffect, useRef } from 'react';
import './Herramientas.css';

function ls(k, fb) { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } }
function lss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// ── Cronómetro ───────────────────────────────────────────────────────────────
function Cronometro() {
  const [ms, setMs] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [laps, setLaps] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    if (corriendo) ref.current = setInterval(() => setMs(m => m + 10), 10);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [corriendo]);

  const fmt = (ms) => {
    const m = Math.floor(ms / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const c = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${m}:${s}.${c}`;
  };

  const reset = () => { setCorriendo(false); setMs(0); setLaps([]); };
  const lap = () => { if (corriendo) setLaps(l => [...l, ms]); };

  return (
    <div className="herr-card">
      <h3 className="herr-titulo">⏱️ Cronómetro</h3>
      <div className="crono-display">{fmt(ms)}</div>
      <div className="crono-btns">
        <button className="btn-primary" onClick={() => setCorriendo(c => !c)}>{corriendo ? '⏸ Pausar' : '▶ Iniciar'}</button>
        <button className="btn-ghost" onClick={lap}>🚩 Vuelta</button>
        <button className="btn-ghost" onClick={reset}>↺ Reset</button>
      </div>
      {laps.length > 0 && (
        <div className="crono-laps">
          {laps.map((l, i) => <div key={i} className="crono-lap">Vuelta {i+1}: <strong>{fmt(l)}</strong></div>)}
        </div>
      )}
    </div>
  );
}

// ── Calculadora ──────────────────────────────────────────────────────────────
function Calculadora() {
  const [display, setDisplay] = useState('0');
  const [expr, setExpr] = useState('');

  const press = (val) => {
    if (val === 'C') { setDisplay('0'); setExpr(''); return; }
    if (val === '=') {
      try {
        const result = Function('"use strict"; return (' + expr + display + ')')();
        setDisplay(String(parseFloat(result.toFixed(10))));
        setExpr('');
      } catch { setDisplay('Error'); setExpr(''); }
      return;
    }
    if (['+','-','×','÷','%'].includes(val)) {
      setExpr(expr + display + (val === '×' ? '*' : val === '÷' ? '/' : val));
      setDisplay('0');
      return;
    }
    if (val === '.' && display.includes('.')) return;
    setDisplay(display === '0' && val !== '.' ? val : display + val);
  };

  const BTNS = [['C','%','÷'],['7','8','9','×'],['4','5','6','-'],['1','2','3','+'],['.','0','=']];

  return (
    <div className="herr-card">
      <h3 className="herr-titulo">🔢 Calculadora</h3>
      <div className="calc-expr">{expr || ' '}</div>
      <div className="calc-display">{display}</div>
      <div className="calc-grid">
        {BTNS.flat().map((b, i) => (
          <button key={i} className={`calc-btn${b==='='?' calc-btn--eq':''}`} onClick={() => press(b)}>{b}</button>
        ))}
      </div>
    </div>
  );
}

// ── Conversor COP/USD ────────────────────────────────────────────────────────
function Conversor() {
  const [cop, setCop] = useState('');
  const [usd, setUsd] = useState('');
  const [tasa, setTasa] = useState(() => ls('conv-tasa', 4000));
  const [editTasa, setEditTasa] = useState(false);
  const [tasaTemp, setTasaTemp] = useState(tasa);

  const copToUsd = (v) => { setCop(v); setUsd(v ? (parseFloat(v) / tasa).toFixed(2) : ''); };
  const usdToCop = (v) => { setUsd(v); setCop(v ? (parseFloat(v) * tasa).toFixed(0) : ''); };
  const guardarTasa = () => { setTasa(Number(tasaTemp)); lss('conv-tasa', Number(tasaTemp)); setEditTasa(false); };

  return (
    <div className="herr-card">
      <h3 className="herr-titulo">💱 Conversor COP ↔ USD</h3>
      <div className="conv-tasa-row">
        {editTasa ? (
          <>
            <input className="conv-input-sm" value={tasaTemp} onChange={e => setTasaTemp(e.target.value)} type="number" />
            <button className="btn-primary" onClick={guardarTasa}>Guardar</button>
          </>
        ) : (
          <>
            <span className="conv-tasa-txt">1 USD = {tasa.toLocaleString()} COP</span>
            <button className="btn-ghost conv-edit-btn" onClick={() => { setTasaTemp(tasa); setEditTasa(true); }}>✏️ Editar tasa</button>
          </>
        )}
      </div>
      <div className="conv-inputs">
        <div className="conv-field">
          <label className="conv-label">🇨🇴 Pesos (COP)</label>
          <input className="conv-input" value={cop} onChange={e => copToUsd(e.target.value)} type="number" placeholder="0" />
        </div>
        <span className="conv-flecha">⇄</span>
        <div className="conv-field">
          <label className="conv-label">🇺🇸 Dólares (USD)</label>
          <input className="conv-input" value={usd} onChange={e => usdToCop(e.target.value)} type="number" placeholder="0" />
        </div>
      </div>
    </div>
  );
}

// ── Buscador ─────────────────────────────────────────────────────────────────
function Buscador() {
  const [query, setQuery] = useState('');
  const [motor, setMotor] = useState('google');

  const motores = {
    google:  q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    youtube: q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    github:  q => `https://github.com/search?q=${encodeURIComponent(q)}`,
    mdn:     q => `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(q)}`,
  };

  const buscar = () => { if (query.trim()) window.open(motores[motor](query), '_blank'); };

  return (
    <div className="herr-card">
      <h3 className="herr-titulo">🔍 Buscador rápido</h3>
      <div className="bus-motores">
        {Object.keys(motores).map(m => (
          <button key={m} className={`bus-motor-btn${motor===m?' active':''}`} onClick={() => setMotor(m)}>
            {m === 'google' ? '🌐' : m === 'youtube' ? '📺' : m === 'github' ? '💻' : '📖'} {m}
          </button>
        ))}
      </div>
      <div className="bus-row">
        <input className="bus-input" value={query} onChange={e => setQuery(e.target.value)}
          placeholder={`Buscar en ${motor}...`} onKeyDown={e => e.key === 'Enter' && buscar()} autoFocus />
        <button className="btn-primary" onClick={buscar}>Buscar →</button>
      </div>
    </div>
  );
}

// ── To-do rápido ─────────────────────────────────────────────────────────────
function TodoRapido() {
  const [todos, setTodos] = useState(() => ls('herr-todos', []));
  const [nuevo, setNuevo] = useState('');

  const agregar = () => {
    if (!nuevo.trim()) return;
    const n = [{ id: Date.now(), texto: nuevo, done: false }, ...todos];
    setTodos(n); lss('herr-todos', n); setNuevo('');
  };
  const toggle = (id) => { const n = todos.map(t => t.id===id?{...t,done:!t.done}:t); setTodos(n); lss('herr-todos',n); };
  const eliminar = (id) => { const n = todos.filter(t => t.id!==id); setTodos(n); lss('herr-todos',n); };
  const limpiarDone = () => { const n = todos.filter(t => !t.done); setTodos(n); lss('herr-todos',n); };

  return (
    <div className="herr-card">
      <h3 className="herr-titulo">✅ To-do rápido</h3>
      <div className="todo-add-row">
        <input className="bus-input" value={nuevo} onChange={e => setNuevo(e.target.value)}
          placeholder="Tarea rápida..." onKeyDown={e => e.key==='Enter'&&agregar()} />
        <button className="btn-primary" onClick={agregar}>+</button>
      </div>
      <div className="todo-lista">
        {todos.length === 0 && <p className="lista-vacia">Sin tareas 🎉</p>}
        {todos.map(t => (
          <div key={t.id} className={`todo-row${t.done?' todo-row--done':''}`}>
            <span className="todo-check" onClick={() => toggle(t.id)}>{t.done?'✅':'⭕'}</span>
            <span className="todo-texto">{t.texto}</span>
            <button className="del-btn" onClick={() => eliminar(t.id)}>✕</button>
          </div>
        ))}
      </div>
      {todos.some(t => t.done) && (
        <button className="btn-ghost" onClick={limpiarDone}>🗑️ Limpiar completadas</button>
      )}
    </div>
  );
}

// ── Generador de contraseñas ─────────────────────────────────────────────────
function GenPassword() {
  const [longitud, setLongitud] = useState(16);
  const [opciones, setOpciones] = useState({ mayus: true, minus: true, nums: true, simbolos: false });
  const [password, setPassword] = useState('');
  const [copiado, setCopiado] = useState(false);

  const generar = () => {
    let chars = '';
    if (opciones.mayus) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (opciones.minus) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (opciones.nums) chars += '0123456789';
    if (opciones.simbolos) chars += '!@#$%^&*()_+-=[]{}';
    if (!chars) return;
    let pwd = '';
    for (let i = 0; i < longitud; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
  };

  const copiar = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="herr-card">
      <h3 className="herr-titulo">🔐 Generador de contraseñas</h3>
      <div className="pwd-opciones">
        {[['mayus','A-Z'],['minus','a-z'],['nums','0-9'],['simbolos','!@#']].map(([k,l]) => (
          <label key={k} className="pwd-opcion">
            <input type="checkbox" checked={opciones[k]} onChange={e => setOpciones({...opciones,[k]:e.target.checked})} />
            {l}
          </label>
        ))}
      </div>
      <div className="pwd-longitud-row">
        <span className="pwd-long-label">Longitud: {longitud}</span>
        <input type="range" min="8" max="32" value={longitud} onChange={e => setLongitud(Number(e.target.value))} style={{flex:1,accentColor:'var(--lila)'}} />
      </div>
      <button className="btn-primary" onClick={generar}>⚡ Generar</button>
      {password && (
        <div className="pwd-result">
          <code className="pwd-code">{password}</code>
          <button className={`btn-ghost pwd-copy${copiado?' copiado':''}`} onClick={copiar}>{copiado?'✅ Copiado':'📋 Copiar'}</button>
        </div>
      )}
    </div>
  );
}

// ── Principal ────────────────────────────────────────────────────────────────
export default function Herramientas() {
  return (
    <div className="herr-wrap">
      <h2 className="herr-titulo-main">🛠️ Herramientas</h2>
      <div className="herr-grid">
        <Buscador />
        <TodoRapido />
        <Conversor />
        <Cronometro />
        <Calculadora />
        <GenPassword />
      </div>
    </div>
  );
}