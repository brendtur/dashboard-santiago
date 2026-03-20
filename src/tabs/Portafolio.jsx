import { useState } from 'react';
import useStore from '../store/useStore';
import './Portafolio.css';

function ls(k, fb) { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } }
function lss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

const SKILLS_DEFAULT = [
  { id: 1, nombre: 'HTML & CSS', nivel: 60, emoji: '🌐' },
  { id: 2, nombre: 'JavaScript', nivel: 35, emoji: '⚡' },
  { id: 3, nombre: 'React',      nivel: 20, emoji: '⚛️' },
  { id: 4, nombre: 'Python',     nivel: 10, emoji: '🐍' },
  { id: 5, nombre: 'Git',        nivel: 25, emoji: '🔧' },
];

const SOBRE_MI_DEFAULT = 'Hola, soy Santiago 👋 Estudiante apasionado por la tecnología y el desarrollo web. Mi sueño es estudiar en BYU y convertirme en un desarrollador de software. Me encanta aprender, construir proyectos y crecer cada día.';

const SECCIONES = [
  { id: 'proyectos', label: '🚀 Proyectos' },
  { id: 'skills',    label: '🛠️ Skills' },
  { id: 'certs',     label: '🏆 Logros' },
  { id: 'sobre',     label: '👤 Sobre mí' },
];

export default function Portafolio() {
  const { addXP } = useStore();
  const [seccion, setSeccion] = useState('proyectos');

  // Proyectos
  const [proyectos, setProyectos] = useState(() => ls('port-proyectos', []));
  const [modalProy, setModalProy] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formProy, setFormProy] = useState({ nombre: '', desc: '', link: '', demo: '', tech: '', color: '#c9a7f0' });

  const guardarProy = () => {
    if (!formProy.nombre.trim()) return;
    let n;
    if (editId) n = proyectos.map(p => p.id === editId ? { ...formProy, id: editId } : p);
    else { n = [...proyectos, { ...formProy, id: Date.now() }]; addXP(15); }
    setProyectos(n); lss('port-proyectos', n);
    setModalProy(false); setEditId(null);
    setFormProy({ nombre: '', desc: '', link: '', demo: '', tech: '', color: '#c9a7f0' });
  };

  const eliminarProy = (id) => { const n = proyectos.filter(p => p.id !== id); setProyectos(n); lss('port-proyectos', n); setModalProy(false); setEditId(null); };

  // Skills
  const [skills, setSkills] = useState(() => ls('port-skills', SKILLS_DEFAULT));
  const [modalSkill, setModalSkill] = useState(false);
  const [formSkill, setFormSkill] = useState({ nombre: '', nivel: 50, emoji: '💡' });

  const guardarSkill = () => {
    if (!formSkill.nombre.trim()) return;
    const n = [...skills, { ...formSkill, id: Date.now() }];
    setSkills(n); lss('port-skills', n);
    setModalSkill(false); setFormSkill({ nombre: '', nivel: 50, emoji: '💡' }); addXP(5);
  };

  const updateSkill = (id, nivel) => { const n = skills.map(s => s.id === id ? { ...s, nivel } : s); setSkills(n); lss('port-skills', n); };
  const eliminarSkill = (id) => { const n = skills.filter(s => s.id !== id); setSkills(n); lss('port-skills', n); };

  // Certificados
  const [certs, setCerts] = useState(() => ls('port-certs', []));
  const [modalCert, setModalCert] = useState(false);
  const [formCert, setFormCert] = useState({ nombre: '', emisor: '', fecha: '', link: '' });

  const guardarCert = () => {
    if (!formCert.nombre.trim()) return;
    const n = [...certs, { ...formCert, id: Date.now() }];
    setCerts(n); lss('port-certs', n);
    setModalCert(false); setFormCert({ nombre: '', emisor: '', fecha: '', link: '' }); addXP(20);
  };

  const eliminarCert = (id) => { const n = certs.filter(c => c.id !== id); setCerts(n); lss('port-certs', n); };

  // Sobre mí
  const [sobreMi, setSobreMi] = useState(() => ls('port-sobre', SOBRE_MI_DEFAULT));
  const [editandoSobre, setEditandoSobre] = useState(false);
  const [sobreTemp, setSobreTemp] = useState(sobreMi);

  const guardarSobre = () => { setSobreMi(sobreTemp); lss('port-sobre', sobreTemp); setEditandoSobre(false); addXP(5); };

  const COLORES = ['#c9a7f0','#f5a7c7','#7adbd4','#a7c7f5','#f9e07a','#ffb347','#98d4a3'];

  return (
    <div className="port-wrap">
      <div className="port-header">
        <h2 className="port-titulo">🌐 Mi Portafolio</h2>
        <div className="port-tabs">
          {SECCIONES.map(s => (
            <button key={s.id} className={`port-tab${seccion === s.id ? ' active' : ''}`} onClick={() => setSeccion(s.id)}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* ── Proyectos ── */}
      {seccion === 'proyectos' && (
        <div className="port-seccion">
          <button className="btn-primary" onClick={() => { setFormProy({ nombre:'',desc:'',link:'',demo:'',tech:'',color:'#c9a7f0' }); setEditId(null); setModalProy(true); }}>+ Nuevo proyecto</button>
          {proyectos.length === 0 && (
            <div className="port-vacio">
              <p>🚀 Aún no tienes proyectos.</p>
              <p>¡Agrega tu primer proyecto y empieza a construir tu portafolio!</p>
            </div>
          )}
          <div className="proyectos-grid">
            {proyectos.map(p => (
              <div key={p.id} className="proy-card" style={{ '--pc': p.color }}>
                <div className="proy-color-bar" style={{ background: p.color }} />
                <div className="proy-body">
                  <div className="proy-top">
                    <h3 className="proy-nombre">{p.nombre}</h3>
                    <button className="edit-btn" onClick={() => { setFormProy({...p}); setEditId(p.id); setModalProy(true); }}>✏️</button>
                  </div>
                  <p className="proy-desc">{p.desc}</p>
                  {p.tech && (
                    <div className="proy-techs">
                      {p.tech.split(',').map((t,i) => <span key={i} className="tech-tag">{t.trim()}</span>)}
                    </div>
                  )}
                  <div className="proy-links">
                    {p.link && <a className="proy-link proy-link--code" href={p.link} target="_blank" rel="noopener noreferrer">💻 Código</a>}
                    {p.demo && <a className="proy-link proy-link--demo" href={p.demo} target="_blank" rel="noopener noreferrer">🌐 Demo</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Skills ── */}
      {seccion === 'skills' && (
        <div className="port-seccion">
          <button className="btn-primary" onClick={() => setModalSkill(true)}>+ Agregar skill</button>
          <div className="skills-grid">
            {skills.map(s => (
              <div key={s.id} className="skill-card">
                <div className="skill-top">
                  <span className="skill-emoji">{s.emoji}</span>
                  <span className="skill-nombre">{s.nombre}</span>
                  <span className="skill-pct">{s.nivel}%</span>
                  <button className="del-btn" onClick={() => eliminarSkill(s.id)}>✕</button>
                </div>
                <div className="skill-bar-bg">
                  <div className="skill-bar-fill" style={{ width: `${s.nivel}%` }} />
                </div>
                <input type="range" min="0" max="100" value={s.nivel}
                  onChange={e => updateSkill(s.id, Number(e.target.value))}
                  className="skill-slider" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Certificados ── */}
      {seccion === 'certs' && (
        <div className="port-seccion">
          <button className="btn-primary" onClick={() => setModalCert(true)}>+ Agregar logro</button>
          {certs.length === 0 && <div className="port-vacio"><p>🏆 Aún no tienes logros registrados.</p><p>¡Cada certificado y logro cuenta!</p></div>}
          <div className="certs-lista">
            {certs.map(c => (
              <div key={c.id} className="cert-card">
                <span className="cert-emoji">🏆</span>
                <div className="cert-info">
                  <p className="cert-nombre">{c.nombre}</p>
                  <p className="cert-emisor">{c.emisor}{c.fecha ? ` · ${c.fecha}` : ''}</p>
                </div>
                {c.link && <a className="cert-link" href={c.link} target="_blank" rel="noopener noreferrer">Ver →</a>}
                <button className="del-btn" onClick={() => eliminarCert(c.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sobre mí ── */}
      {seccion === 'sobre' && (
        <div className="port-seccion">
          <div className="sobre-card">
            <div className="sobre-avatar">S</div>
            <div className="sobre-info">
              <h2 className="sobre-nombre">Santiago Cepeda</h2>
              <p className="sobre-tag">🎓 Futuro estudiante de BYU · 💻 Developer in progress</p>
            </div>
          </div>
          {!editandoSobre ? (
            <div className="sobre-texto-wrap">
              <p className="sobre-texto">{sobreMi}</p>
              <button className="btn-ghost mt-10" onClick={() => { setSobreTemp(sobreMi); setEditandoSobre(true); }}>✏️ Editar</button>
            </div>
          ) : (
            <div className="sobre-edit">
              <textarea className="sobre-textarea" value={sobreTemp} onChange={e => setSobreTemp(e.target.value)} rows={5} />
              <div className="modal-btns">
                <button className="btn-ghost" onClick={() => setEditandoSobre(false)}>Cancelar</button>
                <button className="btn-primary" onClick={guardarSobre}>Guardar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal proyecto */}
      {modalProy && (
        <div className="modal-overlay" onClick={() => setModalProy(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">{editId ? '✏️ Editar proyecto' : '🚀 Nuevo proyecto'}</h3>
            <label className="modal-label">Nombre</label>
            <input className="est-input" value={formProy.nombre} onChange={e => setFormProy({...formProy,nombre:e.target.value})} placeholder="ej. Mi portfolio web..." autoFocus />
            <label className="modal-label">Descripción</label>
            <textarea className="est-notas" rows={2} value={formProy.desc} onChange={e => setFormProy({...formProy,desc:e.target.value})} placeholder="¿Qué hace este proyecto?" />
            <label className="modal-label">Tecnologías (separadas por coma)</label>
            <input className="est-input" value={formProy.tech} onChange={e => setFormProy({...formProy,tech:e.target.value})} placeholder="ej. React, CSS, Node.js" />
            <label className="modal-label">Link código (GitHub)</label>
            <input className="est-input" value={formProy.link} onChange={e => setFormProy({...formProy,link:e.target.value})} placeholder="https://github.com/..." />
            <label className="modal-label">Link demo (opcional)</label>
            <input className="est-input" value={formProy.demo} onChange={e => setFormProy({...formProy,demo:e.target.value})} placeholder="https://..." />
            <label className="modal-label">Color</label>
            <div className="color-grid">
              {COLORES.map(c => <button key={c} className={`color-btn${formProy.color===c?' active':''}`} style={{background:c}} onClick={() => setFormProy({...formProy,color:c})} />)}
            </div>
            <div className="modal-btns">
              {editId && <button className="btn-danger" onClick={() => eliminarProy(editId)}>🗑️ Eliminar</button>}
              <button className="btn-ghost" onClick={() => setModalProy(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarProy} disabled={!formProy.nombre.trim()}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal skill */}
      {modalSkill && (
        <div className="modal-overlay" onClick={() => setModalSkill(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">🛠️ Nueva skill</h3>
            <label className="modal-label">Nombre</label>
            <input className="est-input" value={formSkill.nombre} onChange={e => setFormSkill({...formSkill,nombre:e.target.value})} placeholder="ej. TypeScript..." autoFocus />
            <label className="modal-label">Emoji</label>
            <div className="emoji-grid">
              {['💡','🐍','⚛️','🔧','📱','☁️','🔐','📊','🎮','🤖','🌐','🗄️'].map(em => (
                <button key={em} className={`emoji-btn${formSkill.emoji===em?' active':''}`} onClick={() => setFormSkill({...formSkill,emoji:em})}>{em}</button>
              ))}
            </div>
            <label className="modal-label">Nivel: {formSkill.nivel}%</label>
            <input type="range" min="0" max="100" value={formSkill.nivel} onChange={e => setFormSkill({...formSkill,nivel:Number(e.target.value)})} style={{width:'100%'}} />
            <div className="modal-btns">
              <button className="btn-ghost" onClick={() => setModalSkill(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarSkill} disabled={!formSkill.nombre.trim()}>+ Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cert */}
      {modalCert && (
        <div className="modal-overlay" onClick={() => setModalCert(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">🏆 Nuevo logro</h3>
            <label className="modal-label">Nombre del logro</label>
            <input className="est-input" value={formCert.nombre} onChange={e => setFormCert({...formCert,nombre:e.target.value})} placeholder="ej. Certificado React..." autoFocus />
            <label className="modal-label">Emisor / plataforma</label>
            <input className="est-input" value={formCert.emisor} onChange={e => setFormCert({...formCert,emisor:e.target.value})} placeholder="ej. Coursera, freeCodeCamp..." />
            <label className="modal-label">Fecha (opcional)</label>
            <input className="est-input" type="date" value={formCert.fecha} onChange={e => setFormCert({...formCert,fecha:e.target.value})} />
            <label className="modal-label">Link (opcional)</label>
            <input className="est-input" value={formCert.link} onChange={e => setFormCert({...formCert,link:e.target.value})} placeholder="https://..." />
            <div className="modal-btns">
              <button className="btn-ghost" onClick={() => setModalCert(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarCert} disabled={!formCert.nombre.trim()}>+ Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}