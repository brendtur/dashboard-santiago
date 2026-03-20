import { useState } from 'react';
import useStore from '../store/useStore';
import './Habitos.css';

const HABITOS_DEFAULT = [
  { id: 'agua',       emoji: '💧', label: 'Tomar agua',        color: '#7adbd4' },
  { id: 'ejercicio',  emoji: '🏋️', label: 'Ejercicio',         color: '#f5a7c7' },
  { id: 'ingles',     emoji: '🌍', label: 'Estudiar inglés',   color: '#a7c7f5' },
  { id: 'leer',       emoji: '📖', label: 'Leer',              color: '#c9a7f0' },
  { id: 'meditar',    emoji: '🧘', label: 'Meditar',           color: '#f9e07a' },
  { id: 'dormir',     emoji: '😴', label: 'Dormir a tiempo',   color: '#f5a7c7' },
  { id: 'codigo',     emoji: '💻', label: 'Programar',         color: '#c9a7f0' },
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getHoy() {
  return new Date().toISOString().split('T')[0];
}

function getDiasRecientes(n = 7) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().split('T')[0];
  });
}

function getDiaSemanaIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

const LS_REGISTROS = 'habitos-registros';
const LS_HABITOS   = 'habitos-lista';

function cargarRegistros() {
  try { return JSON.parse(localStorage.getItem(LS_REGISTROS)) || {}; }
  catch { return {}; }
}
function guardarRegistros(r) {
  localStorage.setItem(LS_REGISTROS, JSON.stringify(r));
}
function cargarHabitos() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_HABITOS));
    return saved || HABITOS_DEFAULT;
  } catch { return HABITOS_DEFAULT; }
}
function guardarHabitosList(h) {
  localStorage.setItem(LS_HABITOS, JSON.stringify(h));
}

function calcRacha(habitoId, registros) {
  let racha = 0;
  const hoy = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (registros[key]?.[habitoId]) racha++;
    else break;
  }
  return racha;
}

export default function Habitos() {
  const { addXP } = useStore();
  const [vista, setVista] = useState('hoy');
  const [registros, setRegistros] = useState(cargarRegistros);
  const [habitos, setHabitos] = useState(cargarHabitos);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoForm, setNuevoForm] = useState({ label: '', emoji: '⭐', color: '#c9a7f0' });

  const hoy = getHoy();
  const diasRecientes = getDiasRecientes(7);
  const diaHoyIdx = getDiaSemanaIndex();

  const toggleHabito = (habitoId, fecha = hoy) => {
    const prev = registros[fecha]?.[habitoId] || false;
    const nuevos = {
      ...registros,
      [fecha]: { ...(registros[fecha] || {}), [habitoId]: !prev },
    };
    setRegistros(nuevos);
    guardarRegistros(nuevos);
    if (!prev) addXP(10);
  };

  const hecho = (habitoId, fecha = hoy) => registros[fecha]?.[habitoId] || false;

  const completadosHoy = habitos.filter(h => hecho(h.id)).length;
  const totalHoy = habitos.length;
  const porcentajeHoy = totalHoy ? Math.round((completadosHoy / totalHoy) * 100) : 0;

  const agregarHabito = () => {
    if (!nuevoForm.label.trim()) return;
    const nuevo = { id: `custom-${Date.now()}`, ...nuevoForm };
    const nuevos = [...habitos, nuevo];
    setHabitos(nuevos);
    guardarHabitosList(nuevos);
    setModalNuevo(false);
    setNuevoForm({ label: '', emoji: '⭐', color: '#c9a7f0' });
    addXP(5);
  };

  const eliminarHabito = (id) => {
    const nuevos = habitos.filter(h => h.id !== id);
    setHabitos(nuevos);
    guardarHabitosList(nuevos);
  };

  // ── Vista Hoy ────────────────────────────────────────────
  const VistaHoy = () => (
    <div className="hoy-wrap">
      {/* Resumen del día */}
      <div className="resumen-dia">
        <div className="resumen-dia__info">
          <h3 className="resumen-dia__titulo">Hoy — {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <p className="resumen-dia__sub">{completadosHoy} de {totalHoy} hábitos completados</p>
        </div>
        <div className="resumen-dia__circulo">
          <svg viewBox="0 0 44 44" className="circulo-svg">
            <circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg2)" strokeWidth="4" />
            <circle cx="22" cy="22" r="18" fill="none" stroke="url(#grad)" strokeWidth="4"
              strokeDasharray={`${porcentajeHoy * 1.131} 113.1`} strokeLinecap="round"
              transform="rotate(-90 22 22)" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c9a7f0" />
                <stop offset="100%" stopColor="#f5a7c7" />
              </linearGradient>
            </defs>
          </svg>
          <span className="circulo-pct">{porcentajeHoy}%</span>
        </div>
      </div>

      {/* Lista de hábitos */}
      <div className="habitos-lista">
        {habitos.map(h => {
          const done = hecho(h.id);
          const racha = calcRacha(h.id, registros);
          return (
            <div key={h.id} className={`habito-row${done ? ' habito-row--done' : ''}`}
              style={{ '--hc': h.color }} onClick={() => toggleHabito(h.id)}>
              <div className="habito-check" style={{ borderColor: h.color, background: done ? h.color : 'transparent' }}>
                {done && <span>✓</span>}
              </div>
              <span className="habito-emoji">{h.emoji}</span>
              <div className="habito-info">
                <span className="habito-label">{h.label}</span>
                {racha > 0 && <span className="habito-racha">🔥 {racha} día{racha > 1 ? 's' : ''}</span>}
              </div>
              {done && <span className="habito-xp">+10 XP</span>}
            </div>
          );
        })}
        <button className="agregar-habito-btn" onClick={() => setModalNuevo(true)}>
          + Agregar hábito
        </button>
      </div>

      {porcentajeHoy === 100 && (
        <div className="all-done-banner">
          🎉 ¡Completaste todos tus hábitos de hoy! ¡Increíble! 🏆
        </div>
      )}
    </div>
  );

  // ── Vista Semana ─────────────────────────────────────────
  const VistaSemana = () => (
    <div className="semana-habitos">
      <div className="semana-tabla">
        {/* Header días */}
        <div className="sh-esquina" />
        {diasRecientes.map((fecha, i) => (
          <div key={fecha} className={`sh-dia-header${i === diaHoyIdx ? ' sh-dia-header--hoy' : ''}`}>
            <span className="sh-dia-nombre">{DIAS_SEMANA[i]}</span>
            {i === diaHoyIdx && <span className="sh-hoy-dot" />}
          </div>
        ))}

        {/* Filas por hábito */}
        {habitos.map(h => (
          <div key={h.id} style={{ display: 'contents' }}>
            <div className="sh-habito-label">
              <span>{h.emoji}</span>
              <span className="sh-label-texto">{h.label}</span>
              <span className="sh-racha-mini">🔥{calcRacha(h.id, registros)}</span>
            </div>
            {diasRecientes.map((fecha, i) => {
              const done = hecho(h.id, fecha);
              const esFuturo = fecha > hoy;
              return (
                <div key={fecha}
                  className={`sh-celda${done ? ' sh-celda--done' : ''}${esFuturo ? ' sh-celda--futuro' : ''}`}
                  style={done ? { background: h.color + '44', borderColor: h.color } : {}}
                  onClick={() => !esFuturo && toggleHabito(h.id, fecha)}
                >
                  {done ? '✓' : esFuturo ? '' : '·'}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="habitos-wrap">
      {/* Header */}
      <div className="habitos-header">
        <h2 className="habitos-titulo">✅ Mis Hábitos</h2>
        <div className="vista-toggle">
          <button className={`vista-btn${vista === 'hoy' ? ' active' : ''}`} onClick={() => setVista('hoy')}>Hoy</button>
          <button className={`vista-btn${vista === 'semana' ? ' active' : ''}`} onClick={() => setVista('semana')}>Semana</button>
        </div>
        <button className="btn-primary" onClick={() => setModalNuevo(true)}>+ Nuevo hábito</button>
      </div>

      {vista === 'hoy' ? <VistaHoy /> : <VistaSemana />}

      {/* Modal nuevo hábito */}
      {modalNuevo && (
        <div className="modal-overlay" onClick={() => setModalNuevo(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">✨ Nuevo hábito</h3>

            <label className="modal-label">Nombre</label>
            <input className="modal-input" value={nuevoForm.label}
              onChange={e => setNuevoForm({ ...nuevoForm, label: e.target.value })}
              placeholder="ej. Meditar 10 min..." autoFocus
              onKeyDown={e => e.key === 'Enter' && agregarHabito()} />

            <label className="modal-label">Emoji</label>
            <div className="emoji-grid">
              {['⭐','🎯','📝','🎵','🧹','💊','🥗','🚿','📱','🙏','🏃','🎨','☀️','🌙','💪'].map(em => (
                <button key={em} className={`emoji-btn${nuevoForm.emoji === em ? ' active' : ''}`}
                  onClick={() => setNuevoForm({ ...nuevoForm, emoji: em })}>{em}</button>
              ))}
            </div>

            <label className="modal-label">Color</label>
            <div className="color-grid">
              {['#c9a7f0','#f5a7c7','#7adbd4','#a7c7f5','#f9e07a','#ffb347','#98d4a3','#ff8fab'].map(col => (
                <button key={col} className={`color-btn${nuevoForm.color === col ? ' active' : ''}`}
                  style={{ background: col }} onClick={() => setNuevoForm({ ...nuevoForm, color: col })} />
              ))}
            </div>

            <div className="modal-btns">
              <button className="btn-ghost" onClick={() => setModalNuevo(false)}>Cancelar</button>
              <button className="btn-primary" onClick={agregarHabito} disabled={!nuevoForm.label.trim()}>
                + Crear hábito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}