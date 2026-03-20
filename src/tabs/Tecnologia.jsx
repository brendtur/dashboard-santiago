import { useState } from 'react';
import useStore from '../store/useStore';
import './Tecnologia.css';

// ── Roadmap desde matemáticas hasta IA ──────────────────────────────────────
const ROADMAP_IA = [
  {
    fase: 'Fase 1', titulo: 'Fundamentos matemáticos', emoji: '📐', color: '#a7c7f5',
    pasos: [
      'Aritmética y álgebra básica',
      'Funciones y gráficas',
      'Álgebra lineal (vectores, matrices)',
      'Cálculo diferencial e integral',
      'Probabilidad y estadística básica',
    ]
  },
  {
    fase: 'Fase 2', titulo: 'Física & Electricidad', emoji: '⚡', color: '#f9e07a',
    pasos: [
      'Conceptos básicos de electricidad (voltaje, corriente, resistencia)',
      'Ley de Ohm y circuitos simples',
      'Electromagnetismo básico',
      'Física computacional — simulaciones',
      'Electrónica digital (bits, compuertas lógicas)',
    ]
  },
  {
    fase: 'Fase 3', titulo: 'Programación', emoji: '💻', color: '#c9a7f0',
    pasos: [
      'Python básico (variables, loops, funciones)',
      'Python avanzado (clases, módulos)',
      'Estructuras de datos y algoritmos',
      'NumPy y Pandas para datos',
      'Visualización con Matplotlib',
    ]
  },
  {
    fase: 'Fase 4', titulo: 'Machine Learning', emoji: '🤖', color: '#7adbd4',
    pasos: [
      'Regresión lineal y logística',
      'Árboles de decisión y Random Forests',
      'Evaluación de modelos (precisión, F1)',
      'scikit-learn — librería de ML',
      'Proyecto de ML completo',
    ]
  },
  {
    fase: 'Fase 5', titulo: 'Deep Learning & IA', emoji: '🧠', color: '#f5a7c7',
    pasos: [
      'Redes neuronales artificiales',
      'TensorFlow o PyTorch básico',
      'Convolutional Neural Networks (imágenes)',
      'Transformers y LLMs (como GPT)',
      'Entender cómo funciona Claude / ChatGPT',
      'Crear tu primer modelo de IA',
    ]
  },
];

// ── Tecnologías por defecto ──────────────────────────────────────────────────
const TECHS_DEFAULT = [
  { id: 1, nombre: 'HTML & CSS', emoji: '🌐', nivel: 60, color: '#a7c7f5' },
  { id: 2, nombre: 'JavaScript', emoji: '⚡', nivel: 35, color: '#f9e07a' },
  { id: 3, nombre: 'React',      emoji: '⚛️', nivel: 20, color: '#7adbd4' },
  { id: 4, nombre: 'Python',     emoji: '🐍', nivel: 10, color: '#c9a7f0' },
  { id: 5, nombre: 'Git',        emoji: '🔧', nivel: 25, color: '#f5a7c7' },
];

const PROYECTOS_DEFAULT = [
  { id: 1, nombre: 'Santiago\'s Dashboard', desc: 'Dashboard personal con React + Zustand', estado: 'activo', progreso: 40, link: '', color: '#c9a7f0' },
];

function ls(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function lss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export default function Tecnologia() {
  const { addXP } = useStore();
  const [seccion, setSeccion] = useState('stack');
  const [techs, setTechs] = useState(() => ls('tecno-stack', TECHS_DEFAULT));
  const [proyectos, setProyectos] = useState(() => ls('tecno-proyectos', PROYECTOS_DEFAULT));
  const [recursos, setRecursos] = useState(() => ls('tecno-recursos', []));
  const [roadmapIA, setRoadmapIA] = useState(() => ls('tecno-roadmap-ia', ROADMAP_IA));

  // Modal tech
  const [modalTech, setModalTech] = useState(false);
  const [formTech, setFormTech] = useState({ nombre: '', emoji: '💡', nivel: 0, color: '#c9a7f0' });

  // Modal proyecto
  const [modalProy, setModalProy] = useState(false);
  const [formProy, setFormProy] = useState({ nombre: '', desc: '', estado: 'activo', progreso: 0, link: '', color: '#c9a7f0' });
  const [editPrId, setEditPrId] = useState(null);

  // Modal recurso
  const [modalRec, setModalRec] = useState(false);
  const [formRec, setFormRec] = useState({ titulo: '', url: '', tipo: 'curso' });

  const agregarTech = () => {
    if (!formTech.nombre.trim()) return;
    const n = [...techs, { id: Date.now(), ...formTech }];
    setTechs(n); lss('tecno-stack', n);
    setModalTech(false); setFormTech({ nombre: '', emoji: '💡', nivel: 0, color: '#c9a7f0' });
    addXP(5);
  };

  const updateNivel = (id, nivel) => {
    const n = techs.map(t => t.id === id ? { ...t, nivel } : t);
    setTechs(n); lss('tecno-stack', n);
  };

  const guardarProy = () => {
    if (!formProy.nombre.trim()) return;
    let n;
    if (editPrId) n = proyectos.map(p => p.id === editPrId ? { ...formProy, id: editPrId } : p);
    else { n = [...proyectos, { id: Date.now(), ...formProy }]; addXP(10); }
    setProyectos(n); lss('tecno-proyectos', n);
    setModalProy(false); setEditPrId(null);
    setFormProy({ nombre: '', desc: '', estado: 'activo', progreso: 0, link: '', color: '#c9a7f0' });
  };

  const agregarRec = () => {
    if (!formRec.titulo.trim()) return;
    const n = [...recursos, { id: Date.now(), ...formRec }];
    setRecursos(n); lss('tecno-recursos', n);
    setModalRec(false); setFormRec({ titulo: '', url: '', tipo: 'curso' }); addXP(5);
  };

  const togglePasoIA = (faseIdx, pasoIdx) => {
    const nuevo = roadmapIA.map((fase, fi) => {
      if (fi !== faseIdx) return fase;
      const pasosObj = (fase.pasosObj || fase.pasos.map((p, i) => ({ texto: p, done: false, id: i })));
      const updated = pasosObj.map((p, pi) => pi === pasoIdx ? { ...p, done: !p.done } : p);
      if (!pasosObj[pasoIdx].done) addXP(12);
      return { ...fase, pasosObj: updated };
    });
    setRoadmapIA(nuevo); lss('tecno-roadmap-ia', nuevo);
  };

  const ESTADO_COLORS = { activo: '#7adbd4', pausado: '#f9e07a', completado: '#c9a7f0' };
  const TIPO_ICONS = { curso: '🎓', video: '🎬', articulo: '📄', libro: '📚', herramienta: '🛠️' };

  const SECCIONES = [
    { id: 'stack', label: '🛠️ Mi Stack' },
    { id: 'proyectos', label: '🚀 Proyectos' },
    { id: 'recursos', label: '🔗 Recursos' },
    { id: 'roadmap', label: '🧠 Roadmap IA' },
  ];

  return (
    <div className="tecno-wrap">

      {/* Header */}
      <div className="tecno-header">
        <h2 className="tecno-titulo">💻 Tecnología</h2>
        <div className="tecno-tabs">
          {SECCIONES.map(s => (
            <button key={s.id} className={`tecno-tab${seccion === s.id ? ' active' : ''}`}
              onClick={() => setSeccion(s.id)}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* ── Mi Stack ── */}
      {seccion === 'stack' && (
        <div className="tecno-seccion">
          <button className="btn-primary" onClick={() => setModalTech(true)}>+ Agregar tecnología</button>
          <div className="stack-grid">
            {techs.map(t => (
              <div key={t.id} className="tech-card" style={{ '--tc': t.color }}>
                <div className="tech-top">
                  <span className="tech-emoji">{t.emoji}</span>
                  <span className="tech-nombre">{t.nombre}</span>
                  <span className="tech-pct" style={{ color: t.color }}>{t.nivel}%</span>
                </div>
                <div className="tech-bar-bg">
                  <div className="tech-bar-fill" style={{ width: `${t.nivel}%`, background: t.color }} />
                </div>
                <input type="range" min="0" max="100" value={t.nivel}
                  onChange={e => updateNivel(t.id, Number(e.target.value))}
                  className="tech-slider" style={{ '--sc': t.color }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Proyectos ── */}
      {seccion === 'proyectos' && (
        <div className="tecno-seccion">
          <button className="btn-primary" onClick={() => { setFormProy({ nombre: '', desc: '', estado: 'activo', progreso: 0, link: '', color: '#c9a7f0' }); setEditPrId(null); setModalProy(true); }}>+ Nuevo proyecto</button>
          <div className="proyectos-grid">
            {proyectos.map(p => (
              <div key={p.id} className="proy-card" style={{ '--pc': p.color }}>
                <div className="proy-top">
                  <span className="proy-estado" style={{ background: ESTADO_COLORS[p.estado] + '33', color: ESTADO_COLORS[p.estado] }}>
                    {p.estado}
                  </span>
                  <button className="edit-btn" onClick={() => { setFormProy({ ...p }); setEditPrId(p.id); setModalProy(true); }}>✏️</button>
                </div>
                <h3 className="proy-nombre">{p.nombre}</h3>
                <p className="proy-desc">{p.desc}</p>
                <div className="proy-bar-row">
                  <div className="proy-bar-bg"><div className="proy-bar-fill" style={{ width: `${p.progreso}%`, background: p.color }} /></div>
                  <span className="proy-pct">{p.progreso}%</span>
                </div>
                {p.link && <a className="proy-link" href={p.link} target="_blank" rel="noopener noreferrer">🔗 Ver proyecto</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recursos ── */}
      {seccion === 'recursos' && (
        <div className="tecno-seccion">
          <button className="btn-primary" onClick={() => setModalRec(true)}>+ Agregar recurso</button>
          <div className="recursos-lista">
            {recursos.length === 0 && <p className="lista-vacia">Sin recursos aún. ¡Guarda uno! 🔗</p>}
            {recursos.map(r => (
              <div key={r.id} className="recurso-row">
                <span className="rec-tipo">{TIPO_ICONS[r.tipo]}</span>
                <div className="rec-info">
                  <p className="rec-titulo">{r.titulo}</p>
                  {r.url && <a className="rec-url" href={r.url} target="_blank" rel="noopener noreferrer">{r.url.slice(0, 50)}</a>}
                </div>
                <button className="del-btn" onClick={() => { const n = recursos.filter(x => x.id !== r.id); setRecursos(n); lss('tecno-recursos', n); }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Roadmap IA ── */}
      {seccion === 'roadmap' && (
        <div className="tecno-seccion">
          <div className="roadmap-ia-intro">
            <p>🎯 Tu camino desde matemáticas básicas hasta entender y crear inteligencia artificial.</p>
          </div>
          <div className="fases-lista">
            {roadmapIA.map((fase, fi) => {
              const pasosObj = fase.pasosObj || fase.pasos.map((p, i) => ({ texto: p, done: false, id: i }));
              const done = pasosObj.filter(p => p.done).length;
              const pct = Math.round((done / pasosObj.length) * 100);
              return (
                <div key={fi} className="fase-card" style={{ '--fc': fase.color }}>
                  <div className="fase-header">
                    <span className="fase-emoji" style={{ background: fase.color + '33' }}>{fase.emoji}</span>
                    <div className="fase-info">
                      <span className="fase-num">{fase.fase}</span>
                      <h3 className="fase-titulo">{fase.titulo}</h3>
                    </div>
                    <div className="fase-pct-wrap">
                      <span className="fase-pct" style={{ color: fase.color }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="fase-bar-bg">
                    <div className="fase-bar-fill" style={{ width: `${pct}%`, background: fase.color }} />
                  </div>
                  <div className="fase-pasos">
                    {pasosObj.map((paso, pi) => (
                      <label key={pi} className={`fase-paso${paso.done ? ' fase-paso--done' : ''}`}
                        onClick={() => togglePasoIA(fi, pi)}>
                        <div className="fase-check" style={{ borderColor: fase.color, background: paso.done ? fase.color : 'transparent' }}>
                          {paso.done && '✓'}
                        </div>
                        <span>{paso.texto}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modales ── */}
      {modalTech && (
        <div className="modal-overlay" onClick={() => setModalTech(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">🛠️ Nueva tecnología</h3>
            <label className="modal-label">Nombre</label>
            <input className="est-input" value={formTech.nombre} onChange={e => setFormTech({ ...formTech, nombre: e.target.value })} placeholder="ej. TypeScript..." autoFocus />
            <label className="modal-label">Emoji</label>
            <div className="emoji-grid">
              {['💡','🐍','⚛️','🔧','📱','🗄️','☁️','🔐','📊','🎮','🤖','🌐'].map(em => (
                <button key={em} className={`emoji-btn${formTech.emoji === em ? ' active' : ''}`} onClick={() => setFormTech({ ...formTech, emoji: em })}>{em}</button>
              ))}
            </div>
            <label className="modal-label">Nivel actual: {formTech.nivel}%</label>
            <input type="range" min="0" max="100" value={formTech.nivel} onChange={e => setFormTech({ ...formTech, nivel: Number(e.target.value) })} style={{ width: '100%' }} />
            <div className="modal-btns">
              <button className="btn-ghost" onClick={() => setModalTech(false)}>Cancelar</button>
              <button className="btn-primary" onClick={agregarTech} disabled={!formTech.nombre.trim()}>+ Agregar</button>
            </div>
          </div>
        </div>
      )}

      {modalProy && (
        <div className="modal-overlay" onClick={() => setModalProy(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">{editPrId ? '✏️ Editar proyecto' : '🚀 Nuevo proyecto'}</h3>
            <label className="modal-label">Nombre</label>
            <input className="est-input" value={formProy.nombre} onChange={e => setFormProy({ ...formProy, nombre: e.target.value })} placeholder="ej. App de clima..." autoFocus />
            <label className="modal-label">Descripción</label>
            <input className="est-input" value={formProy.desc} onChange={e => setFormProy({ ...formProy, desc: e.target.value })} placeholder="¿Qué hace este proyecto?" />
            <label className="modal-label">Link (opcional)</label>
            <input className="est-input" value={formProy.link} onChange={e => setFormProy({ ...formProy, link: e.target.value })} placeholder="https://github.com/..." />
            <div className="modal-row">
              <div>
                <label className="modal-label">Estado</label>
                <select className="est-select" value={formProy.estado} onChange={e => setFormProy({ ...formProy, estado: e.target.value })}>
                  <option value="activo">🟢 Activo</option>
                  <option value="pausado">🟡 Pausado</option>
                  <option value="completado">✅ Completado</option>
                </select>
              </div>
              <div>
                <label className="modal-label">Progreso: {formProy.progreso}%</label>
                <input type="range" min="0" max="100" value={formProy.progreso} onChange={e => setFormProy({ ...formProy, progreso: Number(e.target.value) })} style={{ width: '100%', marginTop: '8px' }} />
              </div>
            </div>
            <div className="modal-btns">
              {editPrId && <button className="btn-danger" onClick={() => { const n = proyectos.filter(p => p.id !== editPrId); setProyectos(n); lss('tecno-proyectos', n); setModalProy(false); }}>🗑️ Eliminar</button>}
              <button className="btn-ghost" onClick={() => setModalProy(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarProy} disabled={!formProy.nombre.trim()}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {modalRec && (
        <div className="modal-overlay" onClick={() => setModalRec(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">🔗 Nuevo recurso</h3>
            <label className="modal-label">Título</label>
            <input className="est-input" value={formRec.titulo} onChange={e => setFormRec({ ...formRec, titulo: e.target.value })} placeholder="ej. Curso de Python en Coursera..." autoFocus />
            <label className="modal-label">URL</label>
            <input className="est-input" value={formRec.url} onChange={e => setFormRec({ ...formRec, url: e.target.value })} placeholder="https://..." />
            <label className="modal-label">Tipo</label>
            <select className="est-select" value={formRec.tipo} onChange={e => setFormRec({ ...formRec, tipo: e.target.value })}>
              <option value="curso">🎓 Curso</option>
              <option value="video">🎬 Video</option>
              <option value="articulo">📄 Artículo</option>
              <option value="libro">📚 Libro</option>
              <option value="herramienta">🛠️ Herramienta</option>
            </select>
            <div className="modal-btns">
              <button className="btn-ghost" onClick={() => setModalRec(false)}>Cancelar</button>
              <button className="btn-primary" onClick={agregarRec} disabled={!formRec.titulo.trim()}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}