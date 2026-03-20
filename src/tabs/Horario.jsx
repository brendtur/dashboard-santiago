import { useState } from 'react';
import useStore from '../store/useStore';
import './Horario.css';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS = Array.from({ length: 18 }, (_, i) => i + 6);

const TIPOS = [
  { id: 'clases',    label: 'Clases',        emoji: '🏫', color: '#a7c7f5' },
  { id: 'estudio',   label: 'Estudio',       emoji: '📚', color: '#c9a7f0' },
  { id: 'ejercicio', label: 'Ejercicio',     emoji: '🏋️', color: '#7adbd4' },
  { id: 'ocio',      label: 'Ocio',          emoji: '🎮', color: '#f9e07a' },
  { id: 'habitos',   label: 'Hábitos fijos', emoji: '😴', color: '#f5a7c7' },
];

function horaLabel(h) {
  return h < 12 ? `${h}:00 am` : h === 12 ? '12:00 pm' : `${h - 12}:00 pm`;
}

function getDiaIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

const STORAGE_KEY = 'horario-bloques';
function cargarBloques() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function guardarBloques(b) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}

const BLOQUE_VACIO = {
  dia: 0, horaInicio: 7, horaFin: 8,
  tipo: 'estudio', titulo: '',
};

export default function Horario() {
  const { addXP } = useStore();
  const [vista, setVista] = useState('semana');
  const [diaSeleccionado, setDiaSeleccionado] = useState(getDiaIndex());
  const [bloques, setBloques] = useState(cargarBloques);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLOQUE_VACIO);
  const [editId, setEditId] = useState(null);

  const getTipo = (id) => TIPOS.find(t => t.id === id) || TIPOS[0];

  const guardar = () => {
    if (!form.titulo.trim()) return;
    let nuevos;
    if (editId !== null) {
      nuevos = bloques.map(b => b.id === editId ? { ...form, id: editId } : b);
    } else {
      nuevos = [...bloques, { ...form, id: Date.now() }];
      addXP(8);
    }
    setBloques(nuevos);
    guardarBloques(nuevos);
    setModal(false);
    setForm(BLOQUE_VACIO);
    setEditId(null);
  };

  const eliminar = (id) => {
    const nuevos = bloques.filter(b => b.id !== id);
    setBloques(nuevos);
    guardarBloques(nuevos);
    setModal(false);
    setEditId(null);
  };

  const abrirNuevo = (dia, hora) => {
    setForm({ ...BLOQUE_VACIO, dia, horaInicio: hora, horaFin: hora + 1 });
    setEditId(null);
    setModal(true);
  };

  const abrirEditar = (b) => {
    setForm({ ...b });
    setEditId(b.id);
    setModal(true);
  };

  // ── Vista Semanal ────────────────────────────────────────
  const VistaSemanal = () => (
    <div className="semana-wrap">
      <div className="semana-grid">
        {/* Esquina vacía */}
        <div className="semana-esquina" />
        {/* Headers de días */}
        {DIAS.map((dia, diaIdx) => (
          <div
            key={dia}
            className={`dia-header${diaIdx === getDiaIndex() ? ' dia-header--hoy' : ''}`}
            onClick={() => { setDiaSeleccionado(diaIdx); setVista('dia'); }}
          >
            <span className="dia-nombre">{dia.slice(0, 3)}</span>
            {diaIdx === getDiaIndex() && <span className="hoy-badge">Hoy</span>}
          </div>
        ))}
        {/* Filas por hora */}
        {HORAS.map(h => (
          <div key={h} style={{ display: 'contents' }}>
            <div className="hora-slot">{horaLabel(h)}</div>
            {DIAS.map((dia, diaIdx) => {
              const bloque = bloques.find(b => b.dia === diaIdx && b.horaInicio === h);
              const ocupado = bloques.some(b => b.dia === diaIdx && h > b.horaInicio && h < b.horaFin);
              if (ocupado) return <div key={`${diaIdx}-${h}`} className="celda celda--ocupada" />;
              return (
                <div
                  key={`${diaIdx}-${h}`}
                  className="celda"
                  style={bloque ? {
                    background: getTipo(bloque.tipo).color + '33',
                    borderLeft: `3px solid ${getTipo(bloque.tipo).color}`,
                  } : {}}
                  onClick={() => bloque ? abrirEditar(bloque) : abrirNuevo(diaIdx, h)}
                >
                  {bloque && (
                    <div className="bloque-mini">
                      <span>{getTipo(bloque.tipo).emoji}</span>
                      <span className="bloque-mini__titulo">{bloque.titulo}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Vista Diaria ─────────────────────────────────────────
  const VistaDiaria = () => {
    const bloquesDia = bloques.filter(b => b.dia === diaSeleccionado);
    return (
      <div className="dia-wrap">
        <div className="dia-nav">
          {DIAS.map((d, i) => (
            <button
              key={d}
              className={`dia-nav-btn${diaSeleccionado === i ? ' active' : ''}${i === getDiaIndex() ? ' hoy' : ''}`}
              onClick={() => setDiaSeleccionado(i)}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
        <div className="dia-timeline">
          {HORAS.map(h => {
            const bloque = bloquesDia.find(b => b.horaInicio === h);
            const ocupado = bloquesDia.some(b => h > b.horaInicio && h < b.horaFin);
            return (
              <div key={h} className="timeline-fila">
                <span className="timeline-hora">{horaLabel(h)}</span>
                <div
                  className={`timeline-celda${bloque ? ' timeline-celda--ocupada' : ''}`}
                  style={bloque ? {
                    background: getTipo(bloque.tipo).color + '22',
                    borderLeft: `4px solid ${getTipo(bloque.tipo).color}`
                  } : {}}
                  onClick={() => !ocupado && (bloque ? abrirEditar(bloque) : abrirNuevo(diaSeleccionado, h))}
                >
                  {bloque && (
                    <div className="timeline-bloque">
                      <span className="timeline-emoji">{getTipo(bloque.tipo).emoji}</span>
                      <div>
                        <p className="timeline-titulo">{bloque.titulo}</p>
                        <p className="timeline-tiempo">{horaLabel(bloque.horaInicio)} → {horaLabel(bloque.horaFin)}</p>
                      </div>
                      <button className="timeline-edit" onClick={e => { e.stopPropagation(); abrirEditar(bloque); }}>✏️</button>
                    </div>
                  )}
                  {!bloque && !ocupado && <span className="timeline-vacio">+ agregar</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Modal ────────────────────────────────────────────────
  const Modal = () => (
    <div className="modal-overlay" onClick={() => setModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-titulo">{editId ? '✏️ Editar bloque' : '+ Nuevo bloque'}</h3>

        <label className="modal-label">Título</label>
        <input
          className="modal-input"
          value={form.titulo}
          onChange={e => setForm({ ...form, titulo: e.target.value })}
          placeholder="ej. Matemáticas, Gym, Netflix..."
          autoFocus
          onKeyDown={e => e.key === 'Enter' && guardar()}
        />

        <label className="modal-label">Tipo</label>
        <div className="tipo-grid">
          {TIPOS.map(t => (
            <button
              key={t.id}
              className={`tipo-btn${form.tipo === t.id ? ' active' : ''}`}
              style={{ '--tc': t.color }}
              onClick={() => setForm({ ...form, tipo: t.id })}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <label className="modal-label">Día</label>
        <select className="modal-select" value={form.dia} onChange={e => setForm({ ...form, dia: Number(e.target.value) })}>
          {DIAS.map((d, i) => <option key={d} value={i}>{d}</option>)}
        </select>

        <div className="modal-row">
          <div>
            <label className="modal-label">Desde</label>
            <select className="modal-select" value={form.horaInicio} onChange={e => setForm({ ...form, horaInicio: Number(e.target.value) })}>
              {HORAS.map(h => <option key={h} value={h}>{horaLabel(h)}</option>)}
            </select>
          </div>
          <div>
            <label className="modal-label">Hasta</label>
            <select className="modal-select" value={form.horaFin} onChange={e => setForm({ ...form, horaFin: Number(e.target.value) })}>
              {HORAS.filter(h => h > form.horaInicio).map(h => <option key={h} value={h}>{horaLabel(h)}</option>)}
            </select>
          </div>
        </div>

        <div className="modal-btns">
          {editId && <button className="btn-danger" onClick={() => eliminar(editId)}>🗑️ Eliminar</button>}
          <button className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn-primary" onClick={guardar} disabled={!form.titulo.trim()}>
            {editId ? 'Guardar cambios' : '+ Agregar'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="horario-wrap">
      <div className="horario-header">
        <h2 className="horario-titulo">📅 Mi Horario</h2>
        <div className="vista-toggle">
          <button className={`vista-btn${vista === 'semana' ? ' active' : ''}`} onClick={() => setVista('semana')}>Semana</button>
          <button className={`vista-btn${vista === 'dia' ? ' active' : ''}`} onClick={() => setVista('dia')}>Día</button>
        </div>
        <button className="btn-primary" onClick={() => abrirNuevo(diaSeleccionado, 8)}>+ Nuevo bloque</button>
      </div>

      {vista === 'semana' ? <VistaSemanal /> : <VistaDiaria />}
      {modal && <Modal />}
    </div>
  );
}