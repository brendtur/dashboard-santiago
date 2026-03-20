import { useState } from 'react';
import useStore from '../store/useStore';
import './Diario.css';

function ls(k, fb) { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } }
function lss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

const todayKey = () => new Date().toISOString().split('T')[0];

const MOODS = [
  { emoji: '🤩', label: 'Épico' },
  { emoji: '😊', label: 'Bien' },
  { emoji: '😌', label: 'Tranquilo' },
  { emoji: '😐', label: 'Normal' },
  { emoji: '😴', label: 'Cansado' },
  { emoji: '😤', label: 'Frustrado' },
];

const REFLEXIONES_DEFAULT = [
  'Lo que no se mide, no mejora.',
  'Cada día es una oportunidad de ser mejor que ayer.',
  'El éxito es la suma de pequeños esfuerzos repetidos cada día.',
  'No tienes que ser perfecto para empezar, pero tienes que empezar para ser perfecto.',
  'Tu futuro es creado por lo que haces hoy, no mañana.',
];

const SECCIONES = [
  { id: 'hoy',         label: '📝 Hoy' },
  { id: 'historial',   label: '📚 Historial' },
  { id: 'reflexiones', label: '💭 Reflexiones' },
];

export default function Diario() {
  const { addXP } = useStore();
  const hoy = todayKey();
  const [seccion, setSeccion] = useState('hoy');

  // Entrada de hoy
  const [entrada, setEntrada] = useState(() => ls(`diario-entrada-${hoy}`, { texto: '', mood: null, guardado: false }));
  const [guardando, setGuardando] = useState(false);

  const guardarEntrada = () => {
    if (!entrada.texto.trim()) return;
    const nueva = { ...entrada, fecha: hoy, guardado: true };
    lss(`diario-entrada-${hoy}`, nueva);
    setEntrada(nueva);

    // Agregar al historial
    const hist = ls('diario-historial', []);
    const updated = [{ fecha: hoy, texto: entrada.texto, mood: entrada.mood }, ...hist.filter(h => h.fecha !== hoy)].slice(0, 60);
    lss('diario-historial', updated);

    setGuardando(true);
    addXP(10);
    setTimeout(() => setGuardando(false), 2000);
  };

  const setMood = (mood) => {
    const nueva = { ...entrada, mood };
    setEntrada(nueva);
    lss(`diario-entrada-${hoy}`, nueva);
  };

  // Historial
  const historial = ls('diario-historial', []);
  const [entradaAbierta, setEntradaAbierta] = useState(null);

  // Reflexiones
  const [reflexiones, setReflexiones] = useState(() => ls('diario-reflexiones', REFLEXIONES_DEFAULT));
  const [nuevaRef, setNuevaRef] = useState('');

  const agregarRef = () => {
    if (!nuevaRef.trim()) return;
    const n = [nuevaRef, ...reflexiones];
    setReflexiones(n); lss('diario-reflexiones', n);
    setNuevaRef(''); addXP(5);
  };

  const eliminarRef = (i) => {
    const n = reflexiones.filter((_, idx) => idx !== i);
    setReflexiones(n); lss('diario-reflexiones', n);
  };

  const fechaHumana = (fecha) => {
    const [y, m, d] = fecha.split('-');
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d} ${meses[Number(m)-1]} ${y}`;
  };

  return (
    <div className="diario-wrap">
      <div className="diario-header">
        <div>
          <h2 className="diario-titulo">📓 Mi Diario</h2>
          <p className="diario-fecha">{fechaHumana(hoy)}</p>
        </div>
        <div className="diario-tabs">
          {SECCIONES.map(s => (
            <button key={s.id} className={`diario-tab${seccion === s.id ? ' active' : ''}`} onClick={() => setSeccion(s.id)}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* ── Entrada de hoy ── */}
      {seccion === 'hoy' && (
        <div className="diario-seccion">
          {/* Mood */}
          <div className="diario-card">
            <h3 className="diario-card-titulo">🎭 ¿Cómo fue tu día?</h3>
            <div className="mood-fila">
              {MOODS.map(m => (
                <button key={m.label} className={`mood-btn${entrada.mood?.label === m.label ? ' active' : ''}`} onClick={() => setMood(m)}>
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>
            {entrada.mood && <p className="mood-seleccionado">Hoy te sentiste: <strong>{entrada.mood.emoji} {entrada.mood.label}</strong></p>}
          </div>

          {/* Texto */}
          <div className="diario-card">
            <h3 className="diario-card-titulo">✍️ Escribe sobre tu día</h3>
            <p className="diario-hint">¿Qué pasó hoy? ¿Qué aprendiste? ¿Qué fue difícil? ¿Qué te hizo feliz?</p>
            <textarea
              className="diario-textarea"
              value={entrada.texto}
              onChange={e => setEntrada(prev => ({ ...prev, texto: e.target.value }))}
              placeholder="Hoy fue un día especial porque..."
              rows={8}
            />
            <div className="diario-footer-row">
              <span className="diario-chars">{entrada.texto.length} caracteres</span>
              <button className={`btn-primary${guardando ? ' btn-success' : ''}`} onClick={guardarEntrada} disabled={!entrada.texto.trim()}>
                {guardando ? '✅ ¡Guardado! +10 XP' : entrada.guardado ? '💾 Actualizar' : '💾 Guardar entrada'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Historial ── */}
      {seccion === 'historial' && (
        <div className="diario-seccion">
          {historial.length === 0 && (
            <div className="diario-vacio">
              <p>📚 Aún no tienes entradas guardadas.</p>
              <p>¡Escribe tu primera entrada hoy!</p>
            </div>
          )}
          <div className="historial-lista">
            {historial.map((h, i) => (
              <div key={i} className="hist-item" onClick={() => setEntradaAbierta(entradaAbierta === i ? null : i)}>
                <div className="hist-top">
                  <div className="hist-left">
                    {h.mood && <span className="hist-mood">{h.mood.emoji}</span>}
                    <span className="hist-fecha">{fechaHumana(h.fecha)}</span>
                    {h.fecha === hoy && <span className="hist-hoy-badge">Hoy</span>}
                  </div>
                  <span className="hist-arrow">{entradaAbierta === i ? '▲' : '▼'}</span>
                </div>
                <p className="hist-preview">{h.texto.slice(0, 100)}{h.texto.length > 100 ? '...' : ''}</p>
                {entradaAbierta === i && (
                  <div className="hist-completo">
                    <p>{h.texto}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Reflexiones ── */}
      {seccion === 'reflexiones' && (
        <div className="diario-seccion">
          <div className="diario-card">
            <h3 className="diario-card-titulo">💭 Agregar reflexión o frase</h3>
            <div className="ref-add-row">
              <input className="diario-input" value={nuevaRef} onChange={e => setNuevaRef(e.target.value)}
                placeholder="Escribe una frase, reflexión o pensamiento..." onKeyDown={e => e.key === 'Enter' && agregarRef()} />
              <button className="btn-primary" onClick={agregarRef} disabled={!nuevaRef.trim()}>+</button>
            </div>
          </div>
          <div className="reflexiones-lista">
            {reflexiones.map((r, i) => (
              <div key={i} className="ref-card">
                <span className="ref-comilla">"</span>
                <p className="ref-texto">{r}</p>
                <button className="del-btn" onClick={() => eliminarRef(i)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}