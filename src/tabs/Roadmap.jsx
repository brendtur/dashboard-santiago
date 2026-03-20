import { useState } from 'react';
import useStore from '../store/useStore';
import './Roadmap.css';

const AREAS_DEFAULT = [
  {
    id: 'ingles',
    emoji: '🌍',
    titulo: 'Inglés',
    descripcion: 'Camino de A1 hasta B2 para cumplir con el requisito de BYU',
    color: '#a7c7f5',
    pasos: [
      { id: 1, texto: 'Nivel A1 — Vocabulario básico y saludos', done: true },
      { id: 2, texto: 'Nivel A2 — Tiempos verbales simples', done: true },
      { id: 3, texto: 'Nivel B1 — Conversación fluida básica', done: false },
      { id: 4, texto: 'Duolingo streak 90 días', done: false },
      { id: 5, texto: 'Examen oficial B1 (certificado)', done: false },
      { id: 6, texto: 'Nivel B2 — Comprensión avanzada', done: false },
      { id: 7, texto: 'Examen oficial B2 (certificado)', done: false },
    ],
  },
  {
    id: 'programacion',
    emoji: '💻',
    titulo: 'Programación & Portfolio',
    descripcion: 'Construir habilidades técnicas y un portfolio que impresione a BYU',
    color: '#c9a7f0',
    pasos: [
      { id: 1, texto: 'Fundamentos de HTML & CSS', done: true },
      { id: 2, texto: 'JavaScript básico', done: true },
      { id: 3, texto: 'React — componentes y hooks', done: false },
      { id: 4, texto: 'Primer proyecto personal completo', done: false },
      { id: 5, texto: 'GitHub con al menos 10 proyectos', done: false },
      { id: 6, texto: 'Portfolio web publicado', done: false },
      { id: 7, texto: 'Proyecto destacado (app real)', done: false },
    ],
  },
  {
    id: 'byu',
    emoji: '🎓',
    titulo: 'Aplicación a BYU',
    descripcion: 'Todo lo necesario para aplicar y ser admitido en BYU',
    color: '#f9e07a',
    pasos: [
      { id: 1, texto: 'Investigar requisitos de admisión', done: false },
      { id: 2, texto: 'Contactar oficina de admisiones internacionales', done: false },
      { id: 3, texto: 'Preparar documentos académicos', done: false },
      { id: 4, texto: 'Carta de motivación escrita', done: false },
      { id: 5, texto: 'Cartas de recomendación conseguidas', done: false },
      { id: 6, texto: 'Aplicación enviada', done: false },
      { id: 7, texto: '¡Admisión recibida! 🎉', done: false },
    ],
  },
  {
    id: 'salud',
    emoji: '🏋️',
    titulo: 'Salud & Hábitos',
    descripcion: 'Construir una base sólida de salud física y mental',
    color: '#7adbd4',
    pasos: [
      { id: 1, texto: 'Establecer rutina de sueño (10pm - 6am)', done: false },
      { id: 2, texto: 'Ejercicio 3 veces por semana por 1 mes', done: false },
      { id: 3, texto: 'Tomar 8 vasos de agua diarios por 30 días', done: false },
      { id: 4, texto: 'Ejercicio 5 veces por semana por 1 mes', done: false },
      { id: 5, texto: 'Meditar 10 min diarios por 21 días', done: false },
      { id: 6, texto: 'Mantener todos los hábitos por 3 meses', done: false },
    ],
  },
];

const LS_KEY = 'roadmap-areas';
function cargar() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || AREAS_DEFAULT; }
  catch { return AREAS_DEFAULT; }
}
function guardar(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function calcProgreso(pasos) {
  if (!pasos.length) return 0;
  return Math.round((pasos.filter(p => p.done).length / pasos.length) * 100);
}

export default function Roadmap() {
  const { addXP } = useStore();
  const [areas, setAreas] = useState(cargar);
  const [expandida, setExpandida] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [areaEditando, setAreaEditando] = useState(null);
  const [nuevoPaso, setNuevoPaso] = useState('');

  const totalPasos = areas.reduce((acc, a) => acc + a.pasos.length, 0);
  const pasosDone = areas.reduce((acc, a) => acc + a.pasos.filter(p => p.done).length, 0);
  const progresoTotal = totalPasos ? Math.round((pasosDone / totalPasos) * 100) : 0;

  const togglePaso = (areaId, pasoId) => {
    const nuevas = areas.map(a => {
      if (a.id !== areaId) return a;
      const pasos = a.pasos.map(p => {
        if (p.id !== pasoId) return p;
        if (!p.done) addXP(15);
        return { ...p, done: !p.done };
      });
      return { ...a, pasos };
    });
    setAreas(nuevas);
    guardar(nuevas);
  };

  const abrirEditar = (area) => {
    setAreaEditando({ ...area, pasos: [...area.pasos] });
    setNuevoPaso('');
    setModalEditar(true);
  };

  const agregarPaso = () => {
    if (!nuevoPaso.trim()) return;
    const paso = { id: Date.now(), texto: nuevoPaso, done: false };
    setAreaEditando(a => ({ ...a, pasos: [...a.pasos, paso] }));
    setNuevoPaso('');
  };

  const eliminarPaso = (pasoId) => {
    setAreaEditando(a => ({ ...a, pasos: a.pasos.filter(p => p.id !== pasoId) }));
  };

  const guardarEdicion = () => {
    const nuevas = areas.map(a => a.id === areaEditando.id ? areaEditando : a);
    setAreas(nuevas);
    guardar(nuevas);
    setModalEditar(false);
  };

  return (
    <div className="roadmap-wrap">

      {/* ── Header global ── */}
      <div className="roadmap-header">
        <div className="roadmap-header__left">
          <h2 className="roadmap-titulo">🗺️ Roadmap a BYU</h2>
          <p className="roadmap-sub">Tu camino hacia la universidad de tus sueños</p>
        </div>
        <div className="roadmap-global">
          <div className="global-pct">{progresoTotal}%</div>
          <div className="global-label">progreso total</div>
          <div className="global-bar-bg">
            <div className="global-bar-fill" style={{ width: `${progresoTotal}%` }} />
          </div>
          <div className="global-sub">{pasosDone} / {totalPasos} pasos completados</div>
        </div>
      </div>

      {/* ── Tarjetas de áreas ── */}
      <div className="areas-grid">
        {areas.map(area => {
          const progreso = calcProgreso(area.pasos);
          const abierta = expandida === area.id;
          return (
            <div key={area.id} className="area-card" style={{ '--ac': area.color }}>
              {/* Top de la tarjeta */}
              <div className="area-card__top">
                <div className="area-emoji-wrap" style={{ background: area.color + '33' }}>
                  {area.emoji}
                </div>
                <div className="area-info">
                  <h3 className="area-titulo">{area.titulo}</h3>
                  <p className="area-desc">{area.descripcion}</p>
                </div>
                <button className="area-edit-btn" onClick={() => abrirEditar(area)}>✏️</button>
              </div>

              {/* Barra de progreso */}
              <div className="area-progreso-row">
                <div className="area-bar-bg">
                  <div className="area-bar-fill" style={{ width: `${progreso}%`, background: area.color }} />
                </div>
                <span className="area-pct" style={{ color: area.color }}>{progreso}%</span>
              </div>

              {/* Pasos preview (primeros 3) */}
              <div className="pasos-preview">
                {area.pasos.slice(0, abierta ? area.pasos.length : 3).map(paso => (
                  <label key={paso.id} className={`paso-item${paso.done ? ' paso-item--done' : ''}`}
                    onClick={() => togglePaso(area.id, paso.id)}>
                    <div className="paso-check" style={{
                      borderColor: area.color,
                      background: paso.done ? area.color : 'transparent'
                    }}>
                      {paso.done && <span>✓</span>}
                    </div>
                    <span className="paso-texto">{paso.texto}</span>
                    {paso.done && <span className="paso-xp">+15 XP</span>}
                  </label>
                ))}
              </div>

              {/* Ver más / menos */}
              {area.pasos.length > 3 && (
                <button className="ver-mas-btn" onClick={() => setExpandida(abierta ? null : area.id)}>
                  {abierta ? '▲ Ver menos' : `▼ Ver ${area.pasos.length - 3} pasos más`}
                </button>
              )}

              {/* Badge completado */}
              {progreso === 100 && (
                <div className="area-completada">🏆 ¡Área completada!</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Modal editar área ── */}
      {modalEditar && areaEditando && (
        <div className="modal-overlay" onClick={() => setModalEditar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">✏️ Editar — {areaEditando.titulo}</h3>

            <label className="modal-label">Pasos</label>
            <div className="pasos-edit-lista">
              {areaEditando.pasos.map(p => (
                <div key={p.id} className="paso-edit-item">
                  <span className={p.done ? 'paso-done-txt' : ''}>{p.done ? '✅' : '⭕'} {p.texto}</span>
                  <button className="paso-del" onClick={() => eliminarPaso(p.id)}>✕</button>
                </div>
              ))}
            </div>

            <label className="modal-label">Nuevo paso</label>
            <div className="paso-add-row">
              <input className="modal-input" value={nuevoPaso}
                onChange={e => setNuevoPaso(e.target.value)}
                placeholder="ej. Aprobar examen de vocabulario..."
                onKeyDown={e => e.key === 'Enter' && agregarPaso()} />
              <button className="btn-ghost" onClick={agregarPaso}>+ Agregar</button>
            </div>

            <div className="modal-btns">
              <button className="btn-ghost" onClick={() => setModalEditar(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarEdicion}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}