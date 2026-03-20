import { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import './Estudio.css';

const METODOS = [
  { id: 'feynman',   emoji: '🧠', nombre: 'Feynman',             desc: 'Explica el tema como si fuera a un niño de 10 años.',    placeholder: '¿Qué tema quieres explicar?',       instruccion: 'Escribe el tema y explícalo con tus propias palabras, sin tecnicismos. Si te trabas, ¡ahí está el hueco!', campo: 'Tema a explicar',     resultado: 'Tu explicación simple:' },
  { id: 'activo',    emoji: '✍️', nombre: 'Recuerdo activo',      desc: 'Lee, cierra el libro y escribe todo lo que recuerdas.', placeholder: '¿Qué acabas de estudiar?',           instruccion: 'Cierra tus apuntes y escribe TODO lo que recuerdas sin mirar. Luego compara.',                              campo: 'Tema estudiado',      resultado: 'Escribe todo lo que recuerdas:' },
  { id: 'cornell',   emoji: '📓', nombre: 'Notas Cornell',        desc: 'Apuntes a la derecha, preguntas clave a la izquierda.', placeholder: '¿Sobre qué tema?',                  instruccion: 'Escribe apuntes principales, luego preguntas clave, y finalmente un resumen de 2-3 líneas.',               campo: 'Tema',                resultado: 'Apuntes | Preguntas | Resumen:' },
  { id: 'espaciado', emoji: '📅', nombre: 'Repetición espaciada', desc: 'Repasa el tema a los 1, 3, 7 y 21 días.',               placeholder: '¿Qué aprendiste hoy?',              instruccion: 'Registra lo que aprendiste. Recuerda repasarlo mañana, en 3, 7 y 21 días.',                                 campo: 'Lo que aprendí hoy', resultado: 'Resumen para repasar después:' },
  { id: 'mindmap',   emoji: '🗺️', nombre: 'Mapa mental',          desc: 'Conecta ideas desde un concepto central.',              placeholder: '¿Cuál es el concepto central?',     instruccion: 'Escribe el concepto central y conecta ideas. Usa → para las conexiones.',                                   campo: 'Concepto central',    resultado: 'Ideas conectadas (usa →):' },
  { id: 'pomo_met',  emoji: '🍅', nombre: 'Objetivo Pomodoro',    desc: '25 min de enfoque total en UNA sola tarea.',            placeholder: '¿En qué te enfocarás estos 25 min?',instruccion: 'Define exactamente qué harás. Una sola tarea, sin multitasking.',                                             campo: 'Mi objetivo',         resultado: '¿Qué logré al terminar?' },
];

function ls(key, fb) { try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } }
function lss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const todayKey = () => new Date().toISOString().split('T')[0];

function Pomodoro({ addXP }) {
  const MODOS = { enfoque: 25 * 60, descanso: 5 * 60, largo: 15 * 60 };
  const [modo, setModo] = useState('enfoque');
  const [segundos, setSegundos] = useState(MODOS.enfoque);
  const [corriendo, setCorriendo] = useState(false);
  const [ciclos, setCiclos] = useState(() => ls('pomodoro-ciclos-' + todayKey(), 0));
  const ref = useRef(null);

  useEffect(() => {
    if (corriendo) {
      ref.current = setInterval(() => {
        setSegundos(s => {
          if (s <= 1) {
            clearInterval(ref.current); setCorriendo(false);
            if (modo === 'enfoque') { addXP(20); setCiclos(c => { const n = c+1; lss('pomodoro-ciclos-'+todayKey(), n); return n; }); }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(ref.current);
  }, [corriendo, modo]);

  const cambiarModo = (m) => { clearInterval(ref.current); setCorriendo(false); setModo(m); setSegundos(MODOS[m]); };
  const min = String(Math.floor(segundos / 60)).padStart(2, '0');
  const seg = String(segundos % 60).padStart(2, '0');
  const pct = ((MODOS[modo] - segundos) / MODOS[modo]) * 100;
  const circunferencia = 2 * Math.PI * 54;

  return (
    <div className="pomodoro-card">
      <h3 className="pomo-titulo">🍅 Pomodoro</h3>
      <div className="pomo-circulo-wrap">
        <svg viewBox="0 0 120 120" width="140" height="140" style={{display:'block'}}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--bg2)" strokeWidth="6" />
          <circle cx="60" cy="60" r="54" fill="none" stroke="url(#pomoGrad)" strokeWidth="6"
            strokeDasharray={`${(pct/100)*circunferencia} ${circunferencia}`}
            strokeLinecap="round" transform="rotate(-90 60 60)" />
          <defs>
            <linearGradient id="pomoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c9a7f0" /><stop offset="100%" stopColor="#f5a7c7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="pomo-tiempo">
          <span className="pomo-clock">{min}:{seg}</span>
          <span className="pomo-modo-label">{modo === 'enfoque' ? 'ENFOCADO' : modo === 'descanso' ? 'DESCANSO' : 'DESCANSO LARGO'}</span>
        </div>
      </div>
      <div className="pomo-modos">
        {[['enfoque','🎯 Enfoque'],['descanso','☕ Descanso'],['largo','🛋️ Largo']].map(([m,l]) => (
          <button key={m} className={`pomo-modo-btn${modo===m?' active':''}`} onClick={() => cambiarModo(m)}>{l}</button>
        ))}
      </div>
      <div className="pomo-btns">
        <button className="btn-primary" onClick={() => setCorriendo(c => !c)}>{corriendo ? '⏸ Pausar' : '▶ Iniciar'}</button>
        <button className="btn-ghost" onClick={() => cambiarModo(modo)}>↺ Reiniciar</button>
      </div>
      <div className="pomo-info-row">
        <span className="pomo-ciclos">🔥 {ciclos} pomodoros hoy</span>
        <span className="pomo-xp-hint">+20 XP c/u</span>
      </div>
    </div>
  );
}

function ModalMetodo({ metodo, onClose }) {
  const [tema, setTema] = useState('');
  const [contenido, setContenido] = useState('');
  const [guardado, setGuardado] = useState(false);
  useEffect(() => { const p = ls(`metodo-${metodo.id}-${todayKey()}`, null); if (p) { setTema(p.tema||''); setContenido(p.contenido||''); } }, [metodo.id]);
  const guardar = () => { if (!contenido.trim()) return; lss(`metodo-${metodo.id}-${todayKey()}`, {tema, contenido}); setGuardado(true); setTimeout(() => setGuardado(false), 2000); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--metodo" onClick={e => e.stopPropagation()}>
        <div className="metodo-modal-header">
          <span className="metodo-modal-emoji">{metodo.emoji}</span>
          <div><h3 className="modal-titulo">{metodo.nombre}</h3><p className="metodo-modal-subdesc">{metodo.desc}</p></div>
        </div>
        <div className="metodo-instruccion">💡 {metodo.instruccion}</div>
        <label className="modal-label">{metodo.campo}</label>
        <input className="est-input" value={tema} onChange={e => setTema(e.target.value)} placeholder={metodo.placeholder} autoFocus />
        <label className="modal-label">{metodo.resultado}</label>
        <textarea className="est-notas est-notas--tall" value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Escribe aquí con libertad..." />
        <div className="modal-btns">
          <button className="btn-ghost" onClick={onClose}>Cerrar</button>
          <button className={`btn-primary${guardado?' btn-success':''}`} onClick={guardar}>{guardado ? '✅ ¡Guardado!' : '💾 Guardar'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Estudio() {
  const { addXP } = useStore();
  const [temas, setTemas] = useState(() => ls('estudio-temas', []));
  const [nuevoTema, setNuevoTema] = useState('');
  const [temaPrioridad, setTemaPrioridad] = useState('media');
  const agregarTema = () => { if (!nuevoTema.trim()) return; const t = {id:Date.now(),texto:nuevoTema,prioridad:temaPrioridad,done:false}; setTemas(p => { const n=[t,...p]; lss('estudio-temas',n); return n; }); setNuevoTema(''); addXP(3); };
  const toggleTema = (id) => setTemas(p => { const n=p.map(t => { if(t.id===id){if(!t.done)addXP(8);return{...t,done:!t.done};}return t;}); lss('estudio-temas',n); return n; });
  const eliminarTema = (id) => setTemas(p => { const n=p.filter(t=>t.id!==id); lss('estudio-temas',n); return n; });

  const [notas, setNotas] = useState(() => ls(`estudio-notas-${todayKey()}`, ''));
  useEffect(() => { const t = setTimeout(() => lss(`estudio-notas-${todayKey()}`, notas), 600); return () => clearTimeout(t); }, [notas]);

  const [recursos, setRecursos] = useState(() => ls('estudio-recursos', []));
  const [nuevoRec, setNuevoRec] = useState({titulo:'',url:'',tipo:'video'});
  const [modalRec, setModalRec] = useState(false);
  const agregarRecurso = () => { if(!nuevoRec.titulo.trim())return; const r={id:Date.now(),...nuevoRec}; const n=[...recursos,r]; setRecursos(n); lss('estudio-recursos',n); setModalRec(false); setNuevoRec({titulo:'',url:'',tipo:'video'}); addXP(5); };

  const [horas, setHoras] = useState(() => ls('estudio-horas', []));
  const [nuevaHora, setNuevaHora] = useState({materia:'',cantidad:1});
  const registrarHoras = () => { if(!nuevaHora.materia.trim())return; const e={id:Date.now(),fecha:todayKey(),...nuevaHora}; const n=[e,...horas].slice(0,30); setHoras(n); lss('estudio-horas',n); addXP(nuevaHora.cantidad*5); setNuevaHora({materia:'',cantidad:1}); };

  const totalHoy = horas.filter(h=>h.fecha===todayKey()).reduce((a,h)=>a+Number(h.cantidad),0);
  const totalSemana = (() => { const dias=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return d.toISOString().split('T')[0];}); return horas.filter(h=>dias.includes(h.fecha)).reduce((a,h)=>a+Number(h.cantidad),0); })();

  const [metodoActivo, setMetodoActivo] = useState(null);
  const TIPO_ICONS = {video:'🎬',articulo:'📄',curso:'🎓',libro:'📚',herramienta:'🛠️'};
  const PRIOR_COLORS = {alta:'#f5a7c7',media:'#f9e07a',baja:'#7adbd4'};

  return (
    <div className="estudio-wrap">
      <div className="estudio-stats">
        <div className="estat-chip">⏱️ <strong>{totalHoy}h</strong> hoy</div>
        <div className="estat-chip">📅 <strong>{totalSemana}h</strong> semana</div>
        <div className="estat-chip">📋 <strong>{temas.filter(t=>!t.done).length}</strong> pendientes</div>
        <div className="estat-chip">🔗 <strong>{recursos.length}</strong> recursos</div>
      </div>

      <div className="estudio-grid">
        <Pomodoro addXP={addXP} />

        <div className="estudio-card">
          <h3 className="seccion-titulo">📋 Temas a estudiar</h3>
          <div className="tema-add-row">
            <input className="est-input" value={nuevoTema} onChange={e=>setNuevoTema(e.target.value)} placeholder="ej. Funciones en JavaScript..." onKeyDown={e=>e.key==='Enter'&&agregarTema()} />
            <select className="est-select" value={temaPrioridad} onChange={e=>setTemaPrioridad(e.target.value)}>
              <option value="alta">🔴 Alta</option><option value="media">🟡 Media</option><option value="baja">🟢 Baja</option>
            </select>
            <button className="btn-primary" onClick={agregarTema}>+</button>
          </div>
          <div className="temas-lista">
            {temas.length===0 && <p className="lista-vacia">Sin temas. ¡Agrega uno! 📚</p>}
            {temas.map(t => (
              <div key={t.id} className={`tema-row${t.done?' tema-row--done':''}`}>
                <div className="tema-prior-dot" style={{background:PRIOR_COLORS[t.prioridad]}} />
                <span className="tema-texto" onClick={()=>toggleTema(t.id)}>{t.done?'✅':'⭕'} {t.texto}</span>
                <button className="del-btn" onClick={()=>eliminarTema(t.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="estudio-card">
          <h3 className="seccion-titulo">🧪 Métodos de estudio</h3>
          <p className="metodos-hint">Toca un método para practicarlo 👇</p>
          <div className="metodos-grid">
            {METODOS.map(m => (
              <button key={m.id} className="metodo-card" onClick={()=>setMetodoActivo(m)}>
                <span className="metodo-emoji">{m.emoji}</span>
                <div className="metodo-info"><p className="metodo-nombre">{m.nombre}</p><p className="metodo-desc">{m.desc}</p></div>
                <span className="metodo-arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="estudio-card">
          <h3 className="seccion-titulo">📝 Notas de hoy</h3>
          <textarea className="est-notas" value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Escribe tus apuntes... Se guarda automáticamente 💾" />
          <span className="notas-hint">Guardado automático ✓ · {todayKey()}</span>
        </div>

        <div className="estudio-card">
          <h3 className="seccion-titulo">🔗 Recursos guardados</h3>
          <button className="btn-primary" onClick={()=>setModalRec(true)}>+ Agregar recurso</button>
          <div className="recursos-lista">
            {recursos.length===0 && <p className="lista-vacia">Sin recursos aún 🔗</p>}
            {recursos.map(r => (
              <div key={r.id} className="recurso-row">
                <span className="recurso-tipo">{TIPO_ICONS[r.tipo]||'📎'}</span>
                <div className="recurso-info"><p className="recurso-titulo">{r.titulo}</p>{r.url&&<a className="recurso-url" href={r.url} target="_blank" rel="noopener noreferrer">{r.url.slice(0,40)}...</a>}</div>
                <button className="del-btn" onClick={()=>{const n=recursos.filter(x=>x.id!==r.id);setRecursos(n);lss('estudio-recursos',n);}}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="estudio-card">
          <h3 className="seccion-titulo">⏱️ Registro de horas</h3>
          <div className="horas-add-row">
            <input className="est-input" value={nuevaHora.materia} onChange={e=>setNuevaHora({...nuevaHora,materia:e.target.value})} placeholder="Materia / tema..." onKeyDown={e=>e.key==='Enter'&&registrarHoras()} />
            <select className="est-select est-select--sm" value={nuevaHora.cantidad} onChange={e=>setNuevaHora({...nuevaHora,cantidad:e.target.value})}>
              {[0.5,1,1.5,2,2.5,3,4].map(h=><option key={h} value={h}>{h}h</option>)}
            </select>
            <button className="btn-primary" onClick={registrarHoras}>+</button>
          </div>
          <div className="horas-lista">
            {horas.slice(0,8).map(h=>(
              <div key={h.id} className="hora-row">
                <span className="hora-fecha">{h.fecha===todayKey()?'Hoy':h.fecha}</span>
                <span className="hora-materia">{h.materia}</span>
                <span className="hora-cant">{h.cantidad}h</span>
              </div>
            ))}
            {horas.length===0 && <p className="lista-vacia">Sin registros ⏱️</p>}
          </div>
        </div>
      </div>

      {metodoActivo && <ModalMetodo metodo={metodoActivo} onClose={()=>setMetodoActivo(null)} />}

      {modalRec && (
        <div className="modal-overlay" onClick={()=>setModalRec(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 className="modal-titulo">🔗 Nuevo recurso</h3>
            <label className="modal-label">Título</label>
            <input className="est-input" value={nuevoRec.titulo} onChange={e=>setNuevoRec({...nuevoRec,titulo:e.target.value})} placeholder="ej. Curso de React..." autoFocus />
            <label className="modal-label">URL (opcional)</label>
            <input className="est-input" value={nuevoRec.url} onChange={e=>setNuevoRec({...nuevoRec,url:e.target.value})} placeholder="https://..." />
            <label className="modal-label">Tipo</label>
            <select className="est-select" value={nuevoRec.tipo} onChange={e=>setNuevoRec({...nuevoRec,tipo:e.target.value})}>
              <option value="video">🎬 Video</option><option value="articulo">📄 Artículo</option>
              <option value="curso">🎓 Curso</option><option value="libro">📚 Libro</option><option value="herramienta">🛠️ Herramienta</option>
            </select>
            <div className="modal-btns">
              <button className="btn-ghost" onClick={()=>setModalRec(false)}>Cancelar</button>
              <button className="btn-primary" onClick={agregarRecurso} disabled={!nuevoRec.titulo.trim()}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}