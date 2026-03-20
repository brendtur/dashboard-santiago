import { useState } from 'react';
import useStore from '../store/useStore';
import './Streams.css';

function ls(k, fb) { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } }
function lss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const todayKey = () => new Date().toISOString().split('T')[0];

const CATEGORIAS = ['Just Chatting','Gaming','Música','Programación en vivo','Estudio en vivo','Arte','Otro'];
const ESTADOS = [
  { id: 'planeado', label: '📅 Planeado', color: '#a7c7f5' },
  { id: 'en_vivo',  label: '🔴 En vivo',  color: '#f5a7c7' },
  { id: 'terminado',label: '✅ Terminado', color: '#7adbd4' },
];

const SECCIONES = [
  { id: 'dashboard', label: '🎮 Dashboard' },
  { id: 'streams',   label: '📺 Mis Streams' },
  { id: 'notas',     label: '📝 Notas' },
  { id: 'metas',     label: '🎯 Metas Kick' },
];

const TIPS_STREAMER = [
  'Sin cámara, tu voz y personalidad son tu marca. ¡Trabaja en eso! 🎙️',
  'Consistencia > cantidad. Mejor 2 streams semanales fijos que 5 irregulares.',
  'Interactúa con CADA comentario cuando seas pequeño. Cada viewer importa.',
  'Crea un horario fijo y publícalo en tu perfil de Kick.',
  'El título y la miniatura son lo primero que ven. Hazlos llamativos.',
  'Usa música libre de derechos para ambientar sin arriesgar el canal.',
  'Define tu nicho: ¿qué te hace único sin mostrar cara?',
];

export default function Streams() {
  const { addXP } = useStore();
  const [seccion, setSeccion] = useState('dashboard');

  // Stats
  const [stats, setStats] = useState(() => ls('kick-stats', {
    seguidores: 0, horas: 0, streams: 0, pico: 0
  }));
  const [editStats, setEditStats] = useState(false);
  const [statsTemp, setStatsTemp] = useState(stats);

  const guardarStats = () => { setStats(statsTemp); lss('kick-stats', statsTemp); setEditStats(false); addXP(5); };

  // Streams
  const [streamsList, setStreamsList] = useState(() => ls('kick-streams', []));
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ titulo: '', categoria: 'Gaming', fecha: todayKey(), duracion: '', estado: 'planeado', notas: '', viewers: 0 });

  const guardarStream = () => {
    if (!form.titulo.trim()) return;
    let n;
    if (editId) n = streamsList.map(s => s.id===editId ? {...form,id:editId} : s);
    else { n = [{...form, id:Date.now()}, ...streamsList]; addXP(15); }
    setStreamsList(n); lss('kick-streams', n);
    setModal(false); setEditId(null);
    setForm({ titulo:'',categoria:'Gaming',fecha:todayKey(),duracion:'',estado:'planeado',notas:'',viewers:0 });
  };

  const eliminarStream = (id) => { const n = streamsList.filter(s => s.id!==id); setStreamsList(n); lss('kick-streams',n); setModal(false); setEditId(null); };

  // Notas del streamer
  const [notas, setNotas] = useState(() => ls('kick-notas', ''));
  const [notasGuardadas, setNotasGuardadas] = useState(false);
  const guardarNotas = () => { lss('kick-notas', notas); setNotasGuardadas(true); setTimeout(()=>setNotasGuardadas(false),2000); addXP(3); };

  // Metas de Kick
  const [metas, setMetas] = useState(() => ls('kick-metas', [
    { id: 1, texto: 'Llegar a 100 seguidores', meta: 100, actual: 0, done: false },
    { id: 2, texto: 'Completar 10 streams', meta: 10, actual: 0, done: false },
    { id: 3, texto: 'Lograr 10 viewers simultáneos', meta: 10, actual: 0, done: false },
    { id: 4, texto: 'Streamear 50 horas totales', meta: 50, actual: 0, done: false },
  ]));

  const updateMeta = (id, actual) => {
    const n = metas.map(m => {
      if (m.id!==id) return m;
      const done = Number(actual) >= m.meta;
      if (done && !m.done) addXP(25);
      return {...m, actual:Number(actual), done};
    });
    setMetas(n); lss('kick-metas', n);
  };

  const tipDelDia = TIPS_STREAMER[new Date().getDay() % TIPS_STREAMER.length];
  const streamEnVivo = streamsList.find(s => s.estado==='en_vivo');
  const getEstado = (id) => ESTADOS.find(e => e.id===id);

  return (
    <div className="str-wrap">
      <div className="str-header">
        <div className="str-header-left">
          <div className="kick-badge">KICK</div>
          <div>
            <h2 className="str-titulo">Panel de Streamer</h2>
            <p className="str-sub">Sin cámara · Kick · Tu contenido, tu marca 🎙️</p>
          </div>
          {streamEnVivo && <div className="en-vivo-chip">🔴 EN VIVO: {streamEnVivo.titulo}</div>}
        </div>
        <div className="str-tabs">
          {SECCIONES.map(s => (
            <button key={s.id} className={`str-tab${seccion===s.id?' active':''}`} onClick={() => setSeccion(s.id)}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* ── Dashboard ── */}
      {seccion === 'dashboard' && (
        <div className="str-seccion">
          {/* Stats */}
          <div className="str-stats-grid">
            {[
              { key:'seguidores', label:'Seguidores', emoji:'👥', color:'var(--lila)' },
              { key:'streams',    label:'Streams',    emoji:'🎮', color:'var(--rosa)' },
              { key:'horas',      label:'Horas en vivo',emoji:'⏱️',color:'var(--teal)' },
              { key:'pico',       label:'Pico viewers', emoji:'📈', color:'var(--azul)' },
            ].map(s => (
              <div key={s.key} className="str-stat-card" style={{'--sc':s.color}}>
                <span className="str-stat-emoji">{s.emoji}</span>
                <span className="str-stat-val">{stats[s.key]}</span>
                <span className="str-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {!editStats ? (
            <button className="btn-ghost" onClick={() => { setStatsTemp(stats); setEditStats(true); }}>✏️ Actualizar estadísticas</button>
          ) : (
            <div className="stats-edit-card">
              <div className="stats-edit-grid">
                {['seguidores','streams','horas','pico'].map(k => (
                  <div key={k} className="stats-edit-field">
                    <label className="stats-edit-label">{k}</label>
                    <input className="str-input" type="number" value={statsTemp[k]}
                      onChange={e => setStatsTemp({...statsTemp,[k]:Number(e.target.value)})} />
                  </div>
                ))}
              </div>
              <div className="modal-btns">
                <button className="btn-ghost" onClick={() => setEditStats(false)}>Cancelar</button>
                <button className="btn-primary" onClick={guardarStats}>Guardar</button>
              </div>
            </div>
          )}

          {/* Tip del día */}
          <div className="tip-card">
            <span className="tip-icon">💡</span>
            <div>
              <p className="tip-titulo">Tip del día para streamers sin cámara:</p>
              <p className="tip-texto">{tipDelDia}</p>
            </div>
          </div>

          {/* Próximo stream */}
          {streamsList.filter(s=>s.estado==='planeado').length > 0 && (
            <div className="proximo-card">
              <h3 className="proximo-titulo">📅 Próximo stream planeado</h3>
              {streamsList.filter(s=>s.estado==='planeado').slice(0,2).map(s => (
                <div key={s.id} className="proximo-item">
                  <span className="proximo-cat">{s.categoria}</span>
                  <span className="proximo-nombre">{s.titulo}</span>
                  <span className="proximo-fecha">{s.fecha}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Streams ── */}
      {seccion === 'streams' && (
        <div className="str-seccion">
          <button className="btn-primary" onClick={() => { setForm({titulo:'',categoria:'Gaming',fecha:todayKey(),duracion:'',estado:'planeado',notas:'',viewers:0}); setEditId(null); setModal(true); }}>+ Nuevo stream</button>
          {streamsList.length === 0 && <div className="str-vacio"><p>🎮 Aún no tienes streams registrados.</p><p>¡Planea tu primer stream!</p></div>}
          <div className="streams-lista">
            {streamsList.map(s => {
              const est = getEstado(s.estado);
              return (
                <div key={s.id} className="stream-card">
                  <div className="stream-top">
                    <span className="stream-estado-chip" style={{background:est.color+'33',color:est.color}}>{est.label}</span>
                    <span className="stream-fecha">{s.fecha}</span>
                    <button className="edit-btn" onClick={() => { setForm({...s}); setEditId(s.id); setModal(true); }}>✏️</button>
                  </div>
                  <h3 className="stream-titulo">{s.titulo}</h3>
                  <div className="stream-meta">
                    <span className="stream-cat">🎮 {s.categoria}</span>
                    {s.duracion && <span className="stream-dur">⏱️ {s.duracion}</span>}
                    {s.viewers > 0 && <span className="stream-viewers">👥 {s.viewers} viewers</span>}
                  </div>
                  {s.notas && <p className="stream-notas">{s.notas}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Notas ── */}
      {seccion === 'notas' && (
        <div className="str-seccion">
          <div className="str-notas-card">
            <h3 className="str-notas-titulo">📝 Notas del streamer</h3>
            <p className="str-notas-hint">Ideas para streams, scripts, recordatorios, overlays pendientes...</p>
            <textarea className="str-textarea" value={notas} onChange={e=>setNotas(e.target.value)}
              placeholder="Ideas para el próximo stream, guiones, overlays que necesito, metas del canal..." rows={10} />
            <div className="str-notas-footer">
              <span className="str-notas-chars">{notas.length} caracteres</span>
              <button className={`btn-primary${notasGuardadas?' btn-success':''}`} onClick={guardarNotas}>
                {notasGuardadas ? '✅ Guardado' : '💾 Guardar notas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Metas Kick ── */}
      {seccion === 'metas' && (
        <div className="str-seccion">
          <div className="kick-metas-lista">
            {metas.map(m => {
              const pct = Math.min(100, Math.round((m.actual/m.meta)*100));
              return (
                <div key={m.id} className={`kick-meta-card${m.done?' kick-meta-card--done':''}`}>
                  <div className="km-top">
                    <span className="km-texto">{m.done?'🏆':''} {m.texto}</span>
                    <span className="km-pct">{pct}%</span>
                  </div>
                  <div className="km-bar-bg"><div className="km-bar-fill" style={{width:`${pct}%`}} /></div>
                  <div className="km-bottom">
                    <input className="km-input" type="number" value={m.actual} min="0" max={m.meta}
                      onChange={e=>updateMeta(m.id, e.target.value)} />
                    <span className="km-de">/ {m.meta}</span>
                    {m.done && <span className="km-done-badge">¡Meta lograda! +25 XP</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal stream */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 className="modal-titulo">{editId?'✏️ Editar stream':'🎮 Nuevo stream'}</h3>
            <label className="modal-label">Título del stream</label>
            <input className="str-input" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} placeholder="ej. Jugando Minecraft con subs..." autoFocus />
            <div className="modal-row">
              <div>
                <label className="modal-label">Categoría</label>
                <select className="str-select" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>
                  {CATEGORIAS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="modal-label">Estado</label>
                <select className="str-select" value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}>
                  {ESTADOS.map(e=><option key={e.id} value={e.id}>{e.label}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-row">
              <div>
                <label className="modal-label">Fecha</label>
                <input className="str-input" type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} />
              </div>
              <div>
                <label className="modal-label">Duración</label>
                <input className="str-input" value={form.duracion} onChange={e=>setForm({...form,duracion:e.target.value})} placeholder="ej. 2h 30min" />
              </div>
            </div>
            <label className="modal-label">Viewers pico</label>
            <input className="str-input" type="number" value={form.viewers} onChange={e=>setForm({...form,viewers:Number(e.target.value)})} placeholder="0" />
            <label className="modal-label">Notas</label>
            <textarea className="str-textarea str-textarea--sm" value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} placeholder="Ideas, cómo fue, qué mejorar..." rows={3} />
            <div className="modal-btns">
              {editId && <button className="btn-danger" onClick={()=>eliminarStream(editId)}>🗑️ Eliminar</button>}
              <button className="btn-ghost" onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarStream} disabled={!form.titulo.trim()}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}