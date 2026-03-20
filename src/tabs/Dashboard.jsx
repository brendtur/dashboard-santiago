import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import './Dashboard.css';

const FRASES = [
  "Cada línea de código que escribes hoy es un paso más cerca de BYU. 💜",
  "No necesitas perfección, necesitas consistencia. Tú puedes. 🚀",
  "El Santiago de mañana te agradece lo que haces ahora. ⭐",
  "Pequeños progresos diarios crean resultados extraordinarios. 🌱",
  "Tu historia apenas está comenzando. Escríbela con intención. ✨",
  "Dificultad + persistencia = crecimiento. Así de simple. 💪",
  "No compares tu capítulo 1 con el capítulo 20 de otros. 📖",
  "Cada bug resuelto, cada palabra aprendida, cuenta. 🛠️",
  "El inglés que estudias hoy abre puertas que aún no ves. 🌍",
  "Confía en el proceso. Los sueños grandes necesitan tiempo. ⏳",
  "Hoy es el día perfecto para ser 1% mejor. Solo 1%. 📈",
  "Tu disciplina de hoy es tu libertad de mañana. 🗝️",
  "BYU no es solo un sueño, es una dirección. Sigue avanzando. 🎓",
  "Lo que practicas te define más que lo que sabes. 🏆",
  "El esfuerzo silencioso de hoy será el orgullo ruidoso de mañana. 🎉",
  "Estudiar puede ser difícil, pero no estudiar es peor. 📚",
  "Cada commit, cada tarea, cada hábito — todos suman. ➕",
  "La versión más potente de ti ya existe. Encuéntrala. 🔮",
  "No pares cuando estés cansado, hay es donde mas necesitas tu ultimo esfurezo. 🏁",
  "Hoy tienes la oportunidad de ser exactamente quien quieres ser. 🌟",
];

const MOODS = [
  { emoji: '🤩', label: 'Épico', msg: '¡Día de MÁXIMO poder! Aprovecha cada segundo.' },
  { emoji: '😊', label: 'Bien', msg: 'Buen estado mental. Perfecta para estudiar en profundidad.' },
  { emoji: '😌', label: 'Tranquilo', msg: 'La calma es poder. Excelente para concentración sostenida.' },
  { emoji: '😐', label: 'Normal', msg: 'Días normales construyen carreras extraordinarias. Adelante.' },
  { emoji: '😴', label: 'Cansado', msg: 'Descansa cuando lo necesites. El descanso también es productividad.' },
  { emoji: '😤', label: 'Frustrado', msg: 'La frustración es señal de crecimiento. Respira y sigue.' },
];

const RESUMEN_ITEMS = [
  { icon: '📅', label: 'Horario', tab: 'Horario', color: 'var(--azul)' },
  { icon: '🎯', label: 'Metas', tab: 'Metas', color: 'var(--teal)' },
  { icon: '✅', label: 'Hábitos', tab: 'Hábitos', color: 'var(--rosa)' },
  { icon: '📚', label: 'Estudio', tab: 'Estudio', color: 'var(--lila)' },
  { icon: '🏋️', label: 'Ejercicio', tab: 'Ejercicio', color: 'var(--amarillo)' },
  { icon: '🗺️', label: 'Roadmap', tab: 'Roadmap', color: 'var(--lila)' },
];

const todayKey = () => new Date().toISOString().split('T')[0];
function lsGet(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function getFraseDelDia() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return FRASES[dayOfYear % FRASES.length];
}

export default function Dashboard() {
  const { addXP, setActiveTab } = useStore();

  const [mood, setMood] = useState(() => lsGet(`mood-${todayKey()}`, null));
  const handleMood = (m) => { setMood(m); lsSet(`mood-${todayKey()}`, m); addXP(5); };

  const [agua, setAgua] = useState(() => lsGet(`agua-${todayKey()}`, 0));
  const addAgua = () => {
    const next = Math.min(agua + 1, 8);
    setAgua(next); lsSet(`agua-${todayKey()}`, next);
    if (next === 8) addXP(20); else addXP(3);
  };

  const [foco, setFoco] = useState(() => lsGet(`foco-${todayKey()}`, ''));
  const [focoEdit, setFocoEdit] = useState(false);
  const [focoInput, setFocoInput] = useState('');
  const saveFoco = () => {
    setFoco(focoInput); lsSet(`foco-${todayKey()}`, focoInput);
    setFocoEdit(false); if (focoInput.trim()) addXP(10);
  };

  const [notas, setNotas] = useState(() => lsGet(`notas-${todayKey()}`, ''));
  useEffect(() => {
    const t = setTimeout(() => lsSet(`notas-${todayKey()}`, notas), 600);
    return () => clearTimeout(t);
  }, [notas]);

  const [logro, setLogro] = useState(() => lsGet(`logro-${todayKey()}`, ''));
  const [logroSaved, setLogroSaved] = useState(false);
  const saveLogro = () => {
    if (!logro.trim()) return;
    lsSet(`logro-${todayKey()}`, logro);
    const hist = lsGet('logros-historial', []);
    const updated = [{ fecha: todayKey(), texto: logro }, ...hist.filter(h => h.fecha !== todayKey())].slice(0, 3);
    lsSet('logros-historial', updated);
    setLogroSaved(true); addXP(15);
    setTimeout(() => setLogroSaved(false), 2500);
  };
  const logroHistorial = lsGet('logros-historial', []);

  return (
    <div className="dashboard-grid">

      <div className="d-card d-card--frase">
        <div className="d-card__icon">💬</div>
        <p className="frase-text">{getFraseDelDia()}</p>
        <span className="frase-label">Frase del día</span>
      </div>

      <div className="d-card">
        <h3 className="d-card__title">📋 Ir a...</h3>
        <div className="resumen-grid">
          {RESUMEN_ITEMS.map(item => (
            <button key={item.tab} className="resumen-btn" style={{ '--accent': item.color }} onClick={() => setActiveTab(item.tab)}>
              <span className="resumen-icon">{item.icon}</span>
              <span className="resumen-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="d-card">
        <h3 className="d-card__title">🎭 ¿Cómo te sientes hoy?</h3>
        <div className="mood-grid">
          {MOODS.map(m => (
            <button key={m.label} className={`mood-btn${mood?.label === m.label ? ' mood-btn--active' : ''}`} onClick={() => handleMood(m)}>
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          ))}
        </div>
        {mood && <p className="mood-msg">✨ {mood.msg}</p>}
      </div>

      <div className="d-card">
        <h3 className="d-card__title">💧 Hidratación</h3>
        <div className="agua-row">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className={`agua-vaso${i < agua ? ' agua-vaso--lleno' : ''}`}>💧</span>
          ))}
        </div>
        <p className="agua-count">{agua} / 8 vasos</p>
        <div className="agua-btns">
          <button className="btn-primary" onClick={addAgua} disabled={agua >= 8}>+ Agregar vaso</button>
          {agua > 0 && <button className="btn-ghost" onClick={() => { setAgua(0); lsSet(`agua-${todayKey()}`, 0); }}>Resetear</button>}
        </div>
        {agua >= 8 && <p className="agua-complete">🎉 ¡Meta cumplida! +20 XP</p>}
      </div>

      <div className="d-card">
        <h3 className="d-card__title">🎯 Enfoque del día</h3>
        {!focoEdit ? (
          <>
            {foco ? <p className="foco-text">"{foco}"</p> : <p className="foco-empty">¿Cuál es tu prioridad #1 de hoy?</p>}
            <button className="btn-primary mt-8" onClick={() => { setFocoInput(foco); setFocoEdit(true); }}>
              {foco ? '✏️ Editar' : '+ Definir enfoque'}
            </button>
          </>
        ) : (
          <div>
            <input className="foco-input" value={focoInput} onChange={e => setFocoInput(e.target.value)}
              placeholder="ej. Terminar módulo de React..." autoFocus onKeyDown={e => e.key === 'Enter' && saveFoco()} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button className="btn-primary" onClick={saveFoco}>Guardar</button>
              <button className="btn-ghost" onClick={() => setFocoEdit(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <div className="d-card d-card--byu" onClick={() => setActiveTab('Roadmap')}>
        <div className="byu-header">
          <span className="byu-icon">🎓</span>
          <div>
            <h3 className="byu-title">BYU Dream</h3>
            <p className="byu-sub">Haz clic para ver tu roadmap →</p>
          </div>
        </div>
        <div className="byu-bar-bg">
          <div className="byu-bar-fill" style={{ width: '12%' }} />
        </div>
        <div className="byu-footer">
          <span className="byu-pct">12% completado</span>
          <span>🌟</span>
        </div>
        <div className="byu-steps">
          {['Inglés B2', 'SAT 1350+', 'Portfolio', 'Finanzas', 'Aplicación'].map((step, i) => (
            <div key={step} className="byu-step">{i < 1 ? '✅' : '⭕'} {step}</div>
          ))}
        </div>
      </div>

      <div className="d-card">
        <h3 className="d-card__title">📝 Notas rápidas del día</h3>
        <textarea className="notas-textarea" value={notas} onChange={e => setNotas(e.target.value)}
          placeholder="Ideas, recordatorios... se guarda automáticamente 💾" />
        <span className="notas-hint">Guardado automático ✓</span>
      </div>

      <div className="d-card">
        <h3 className="d-card__title">🏆 Logro del día</h3>
        <input className="logro-input" value={logro} onChange={e => setLogro(e.target.value)}
          placeholder="¿Qué lograste hoy?" onKeyDown={e => e.key === 'Enter' && saveLogro()} />
        <button className={`btn-primary mt-8${logroSaved ? ' btn-success' : ''}`} onClick={saveLogro} disabled={!logro.trim()}>
          {logroSaved ? '✅ ¡Guardado! +15 XP' : '💾 Guardar logro'}
        </button>
        {logroHistorial.length > 0 && (
          <div className="logro-historial">
            <p className="logro-hist-title">Últimos logros:</p>
            {logroHistorial.map(h => (
              <div key={h.fecha} className="logro-hist-item">
                <span className="logro-hist-fecha">{h.fecha}</span>
                <span className="logro-hist-texto">{h.texto}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}