import { useState } from 'react';
import useStore from '../store/useStore';
import './Ejercicio.css';

function ls(k, fb) { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } }
function lss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const todayKey = () => new Date().toISOString().split('T')[0];

const RUTINA = {
  1: { // Lunes
    tipo: 'Fuerza 💪',
    color: '#c9a7f0',
    ejercicios: [
      { nombre: 'Sentadillas', series: 3, reps: 12, desc: 'Piernas a 90°, espalda recta' },
      { nombre: 'Press de pecho', series: 3, reps: 10, desc: 'Con mancuernas o barra' },
      { nombre: 'Peso muerto', series: 3, reps: 8, desc: 'Espalda recta, empuje de caderas' },
      { nombre: 'Remo con barra', series: 3, reps: 10, desc: 'Torso inclinado, codos al cuerpo' },
      { nombre: 'Press militar', series: 3, reps: 10, desc: 'Hombros, empuje vertical' },
      { nombre: 'Curl de bíceps', series: 3, reps: 12, desc: 'Codos fijos, contracción completa' },
    ]
  },
  3: { // Miércoles
    tipo: 'Elasticidad 🧘',
    color: '#7adbd4',
    ejercicios: [
      { nombre: 'Estiramiento de cuádriceps', series: 2, reps: 30, desc: '30 segundos cada pierna' },
      { nombre: 'Estiramiento de isquiotibiales', series: 2, reps: 30, desc: 'Inclínate hacia adelante lentamente' },
      { nombre: 'Estiramiento de hombros', series: 2, reps: 30, desc: 'Brazo cruzado al pecho' },
      { nombre: 'Postura del gato-vaca', series: 3, reps: 10, desc: 'Movilidad de columna' },
      { nombre: 'Estiramiento de cadera', series: 2, reps: 30, desc: 'Posición de mariposa' },
      { nombre: 'Yoga — Guerrero I', series: 2, reps: 30, desc: '30 segundos cada lado' },
    ]
  },
  5: { // Viernes
    tipo: 'Bajar de peso 🔥',
    color: '#f5a7c7',
    ejercicios: [
      { nombre: 'Burpees', series: 3, reps: 15, desc: 'Ritmo moderado, mantén forma' },
      { nombre: 'Saltos de tijera', series: 3, reps: 30, desc: 'Jumping jacks, 30 repeticiones' },
      { nombre: 'Mountain climbers', series: 3, reps: 20, desc: 'Rodillas al pecho alternando' },
      { nombre: 'Sentadillas con salto', series: 3, reps: 12, desc: 'Explosivo al subir' },
      { nombre: 'Plancha', series: 3, reps: 45, desc: '45 segundos, core apretado' },
      { nombre: 'Trote en el lugar', series: 3, reps: 60, desc: '60 segundos de cardio' },
    ]
  }
};

const DIAS_NOMBRE = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function getDiaHoy() { return new Date().getDay(); }

const SECCIONES = [
  { id: 'rutina',    label: '🏋️ Rutina' },
  { id: 'contador',  label: '🔢 Contador' },
  { id: 'peso',      label: '⚖️ Peso' },
  { id: 'historial', label: '📊 Historial' },
];

export default function Ejercicio() {
  const { addXP } = useStore();
  const [seccion, setSeccion] = useState('rutina');
  const diaHoy = getDiaHoy();

  // Completar ejercicios
  const [completados, setCompletados] = useState(() => ls(`ejercicio-completados-${todayKey()}`, {}));
  const toggleEjercicio = (nombre) => {
    const nuevo = { ...completados, [nombre]: !completados[nombre] };
    setCompletados(nuevo);
    lss(`ejercicio-completados-${todayKey()}`, nuevo);
    if (!completados[nombre]) addXP(8);
  };

  // Contador de reps
  const [contNombre, setContNombre] = useState('');
  const [series, setSeries] = useState([]);
  const [repsActuales, setRepsActuales] = useState(0);

  const agregarSerie = () => {
    if (repsActuales <= 0) return;
    const n = [...series, repsActuales];
    setSeries(n); setRepsActuales(0);
  };

  const guardarConteo = () => {
    if (!contNombre.trim() || series.length === 0) return;
    const hist = ls('ejercicio-historial', []);
    const entry = { fecha: todayKey(), ejercicio: contNombre, series, total: series.reduce((a,b)=>a+b,0) };
    lss('ejercicio-historial', [entry, ...hist].slice(0, 50));
    setSeries([]); setRepsActuales(0); setContNombre('');
    addXP(10);
    alert(`✅ ¡Guardado! ${entry.total} reps totales en ${series.length} series`);
  };

  // Peso
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState(() => ls('ejercicio-altura', ''));
  const registros = ls('ejercicio-peso', []);

  const guardarPeso = () => {
    if (!peso) return;
    const n = [{ fecha: todayKey(), peso: Number(peso) }, ...registros].slice(0, 60);
    lss('ejercicio-peso', n); setPeso(''); addXP(5);
    if (altura) lss('ejercicio-altura', altura);
    window.location.reload();
  };

  const imc = () => {
    const ultimo = registros[0]?.peso;
    const alt = Number(altura) / 100;
    if (!ultimo || !alt) return null;
    const val = (ultimo / (alt * alt)).toFixed(1);
    let cat = val < 18.5 ? 'Bajo peso' : val < 25 ? 'Normal ✅' : val < 30 ? 'Sobrepeso' : 'Obesidad';
    return { val, cat };
  };

  // Historial
  const historial = ls('ejercicio-historial', []);
  const pesoHist = ls('ejercicio-peso', []);

  const rutinaHoy = RUTINA[diaHoy];

  return (
    <div className="ej-wrap">
      <div className="ej-header">
        <div>
          <h2 className="ej-titulo">🏋️ Ejercicio</h2>
          {rutinaHoy ? (
            <p className="ej-sub">Hoy: <strong style={{color: rutinaHoy.color}}>{rutinaHoy.tipo}</strong></p>
          ) : (
            <p className="ej-sub">Hoy es día de descanso 😴 — ¡recupérate bien!</p>
          )}
        </div>
        <div className="ej-tabs">
          {SECCIONES.map(s => (
            <button key={s.id} className={`ej-tab${seccion===s.id?' active':''}`} onClick={() => setSeccion(s.id)}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* ── Rutina ── */}
      {seccion === 'rutina' && (
        <div className="ej-seccion">
          {/* Calendario semanal */}
          <div className="semana-chips">
            {[1,2,3,4,5,6,0].map(d => (
              <div key={d} className={`dia-chip${d===diaHoy?' dia-chip--hoy':''}${RUTINA[d]?' dia-chip--activo':''}`}
                style={RUTINA[d]?{'--dc':RUTINA[d].color}:{}}>
                <span className="dia-chip-nombre">{DIAS_NOMBRE[d]}</span>
                {RUTINA[d] && <span className="dia-chip-tipo">{RUTINA[d].tipo.split(' ')[0]}</span>}
                {!RUTINA[d] && <span className="dia-chip-tipo">😴</span>}
              </div>
            ))}
          </div>

          {/* Rutina del día */}
          {rutinaHoy ? (
            <div className="rutina-card" style={{'--rc': rutinaHoy.color}}>
              <div className="rutina-header">
                <h3 className="rutina-titulo">{rutinaHoy.tipo}</h3>
                <span className="rutina-progreso">
                  {rutinaHoy.ejercicios.filter(e => completados[e.nombre]).length}/{rutinaHoy.ejercicios.length} ✅
                </span>
              </div>
              <div className="ejercicios-lista">
                {rutinaHoy.ejercicios.map(e => (
                  <div key={e.nombre} className={`ejercicio-row${completados[e.nombre]?' ejercicio-row--done':''}`}
                    onClick={() => toggleEjercicio(e.nombre)}>
                    <div className="ej-check" style={{borderColor: rutinaHoy.color, background: completados[e.nombre]?rutinaHoy.color:'transparent'}}>
                      {completados[e.nombre] && '✓'}
                    </div>
                    <div className="ej-info">
                      <p className="ej-nombre">{e.nombre}</p>
                      <p className="ej-detalle">{e.series} series × {e.reps} {e.nombre.includes('Plancha')||e.nombre.includes('Trote')||e.nombre.includes('Estiramiento')||e.nombre.includes('Yoga')||e.nombre.includes('Guerrero') ? 'seg' : 'reps'} — {e.desc}</p>
                    </div>
                    {completados[e.nombre] && <span className="ej-xp">+8 XP</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="descanso-card">
              <p>😴 Día de descanso</p>
              <p>Tu entrenamiento es: Lunes 💪 · Miércoles 🧘 · Viernes 🔥</p>
            </div>
          )}

          {/* Otras rutinas */}
          <div className="otras-rutinas">
            <h3 className="otras-titulo">📅 Todas las rutinas</h3>
            {Object.entries(RUTINA).map(([dia, r]) => (
              <div key={dia} className="otra-rutina" style={{'--or': r.color}}>
                <div className="otra-rutina-header">
                  <span className="otra-dia">{DIAS_NOMBRE[Number(dia)]}</span>
                  <span className="otra-tipo">{r.tipo}</span>
                </div>
                <p className="otra-lista">{r.ejercicios.map(e=>e.nombre).join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Contador ── */}
      {seccion === 'contador' && (
        <div className="ej-seccion">
          <div className="contador-card">
            <h3 className="contador-titulo">🔢 Contador de series y reps</h3>
            <input className="ej-input" value={contNombre} onChange={e => setContNombre(e.target.value)}
              placeholder="Nombre del ejercicio..." />
            <div className="contador-display">
              <button className="cont-btn cont-btn--minus" onClick={() => setRepsActuales(r => Math.max(0, r-1))}>−</button>
              <div className="cont-numero">{repsActuales}</div>
              <button className="cont-btn cont-btn--plus" onClick={() => setRepsActuales(r => r+1)}>+</button>
            </div>
            <p className="cont-hint">Ajusta las reps y presiona "Agregar serie"</p>
            <div className="cont-series-row">
              <button className="btn-primary" onClick={agregarSerie} disabled={repsActuales===0}>+ Agregar serie</button>
              {series.length > 0 && <button className="btn-ghost" onClick={() => setSeries(s => s.slice(0,-1))}>↩ Deshacer</button>}
            </div>
            {series.length > 0 && (
              <div className="cont-series-lista">
                {series.map((s, i) => (
                  <span key={i} className="cont-serie-chip">Serie {i+1}: {s} reps</span>
                ))}
                <div className="cont-total">Total: <strong>{series.reduce((a,b)=>a+b,0)} reps</strong> en {series.length} series</div>
              </div>
            )}
            {series.length > 0 && contNombre && (
              <button className="btn-primary" onClick={guardarConteo}>💾 Guardar entrenamiento</button>
            )}
          </div>
        </div>
      )}

      {/* ── Peso ── */}
      {seccion === 'peso' && (
        <div className="ej-seccion">
          <div className="peso-card">
            <h3 className="peso-titulo">⚖️ Registro de peso</h3>
            <div className="peso-form">
              <div className="peso-field">
                <label className="peso-label">Peso actual (kg)</label>
                <input className="ej-input" value={peso} onChange={e => setPeso(e.target.value)} type="number" placeholder="ej. 70.5" />
              </div>
              <div className="peso-field">
                <label className="peso-label">Altura (cm)</label>
                <input className="ej-input" value={altura} onChange={e => setAltura(e.target.value)} type="number" placeholder="ej. 175" />
              </div>
            </div>
            <button className="btn-primary" onClick={guardarPeso} disabled={!peso}>+ Registrar</button>

            {registros.length > 0 && (
              <div className="peso-stats">
                <div className="peso-stat">
                  <span className="peso-stat-val">{registros[0].peso} kg</span>
                  <span className="peso-stat-label">Peso actual</span>
                </div>
                {registros.length > 1 && (
                  <div className="peso-stat">
                    <span className="peso-stat-val" style={{color: registros[0].peso < registros[1].peso ? 'var(--teal)' : 'var(--rosa)'}}>
                      {registros[0].peso < registros[1].peso ? '↓' : '↑'} {Math.abs(registros[0].peso - registros[1].peso).toFixed(1)} kg
                    </span>
                    <span className="peso-stat-label">vs anterior</span>
                  </div>
                )}
                {imc() && (
                  <div className="peso-stat">
                    <span className="peso-stat-val">{imc().val}</span>
                    <span className="peso-stat-label">IMC — {imc().cat}</span>
                  </div>
                )}
              </div>
            )}

            <div className="peso-historial">
              {pesoHist.slice(0, 10).map((r, i) => (
                <div key={i} className="peso-hist-row">
                  <span className="peso-hist-fecha">{r.fecha}</span>
                  <span className="peso-hist-val">{r.peso} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Historial ── */}
      {seccion === 'historial' && (
        <div className="ej-seccion">
          {historial.length === 0 && (
            <div className="ej-vacio">
              <p>📊 Aún no hay entrenamientos registrados.</p>
              <p>¡Completa tu primera sesión!</p>
            </div>
          )}
          <div className="hist-lista">
            {historial.map((h, i) => (
              <div key={i} className="hist-row">
                <span className="hist-fecha">{h.fecha}</span>
                <span className="hist-ejercicio">{h.ejercicio}</span>
                <span className="hist-series">{h.series.length} series</span>
                <span className="hist-total">{h.total} reps</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}