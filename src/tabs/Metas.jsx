import { useState } from 'react';
import useStore from '../store/useStore';
import './Metas.css';

const CATEGORIAS = [
  { id: 'academico',  label: 'Académico',      emoji: '📚', color: '#a7c7f5' },
  { id: 'idiomas',    label: 'Idiomas',         emoji: '🌍', color: '#7adbd4' },
  { id: 'tecnologia', label: 'Tecnología',      emoji: '💻', color: '#c9a7f0' },
  { id: 'salud',      label: 'Salud',           emoji: '🏋️', color: '#f5a7c7' },
  { id: 'byu',        label: 'BYU',             emoji: '🎓', color: '#f9e07a' },
];

const PLAZOS = [
  { id: 'corto', label: 'Corto plazo', sub: 'semanas' },
  { id: 'largo', label: 'Largo plazo', sub: 'meses / años' },
];

const STORAGE_KEY = 'metas-data';
function cargarMetas() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function guardarMetas(m) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
}

const META_VACIA = {
  titulo: '', categoria: 'academico', plazo: 'corto',
  descripcion: '', subtareas: [], fecha: '',
};

function calcProgreso(subtareas) {
  if (!subtareas.length) return 0;
  return Math.round((subtareas.filter(s => s.done).length / subtareas.length) * 100);
}

export default function Metas() {
  const { addXP } = useStore();
  const [metas, setMetas] = useState(cargarMetas);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(META_VACIA);
  const [editId, setEditId] = useState(null);
  const [nuevaSub, setNuevaSub] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPlazo, setFiltroPlazo] = useState('todos');

  const getCat = (id) => CATEGORIAS.find(c => c.id === id) || CATEGORIAS[0];

  const guardar = () => {
    if (!form.titulo.trim()) return;
    let nuevas;
    if (editId !== null) {
      nuevas = metas.map(m => m.id === editId ? { ...form, id: editId } : m);
    } else {
      nuevas = [...metas, { ...form, id: Date.now() }];
      addXP(10);
    }
    setMetas(nuevas);
    guardarMetas(nuevas);
    setModal(false);
    setForm(META_VACIA);
    setEditId(null);
    setNuevaSub('');
  };

  const eliminar = (id) => {
    const nuevas = metas.filter(m => m.id !== id);
    setMetas(nuevas);
    guardarMetas(nuevas);
    setModal(false);
    setEditId(null);
  };

  const abrirNueva = () => {
    setForm(META_VACIA);
    setEditId(null);
    setNuevaSub('');
    setModal(true);
  };

  const abrirEditar = (m) => {
    setForm({ ...m, subtareas: [...m.subtareas] });
    setEditId(m.id);
    setNuevaSub('');
    setModal(true);
  };

  const agregarSub = () => {
    if (!nuevaSub.trim()) return;
    setForm(f => ({ ...f, subtareas: [...f.subtareas, { id: Date.now(), texto: nuevaSub, done: false }] }));
    setNuevaSub('');
  };

  const toggleSubForm = (subId) => {
    setForm(f => ({ ...f, subtareas: f.subtareas.map(s => s.id === subId ? { ...s, done: !s.done } : s) }));
  };

  const eliminarSub = (subId) => {
    setForm(f => ({ ...f, subtareas: f.subtareas.filter(s => s.id !== subId) }));
  };

  // Toggle subtarea directamente en la lista (sin abrir modal)
  const toggleSubDirecto = (metaId, subId) => {
    const nuevas = metas.map(m => {
      if (m.id !== metaId) return m;
      const subs = m.subtareas.map(s => s.id === subId ? { ...s, done: !s.done } : s);
      const meta = { ...m, subtareas: subs };
      // XP si se completa una subtarea
      const antes = m.subtareas.find(s => s.id === subId);
      if (antes && !antes.done) addXP(5);
      // XP bonus si se completa la meta entera
      if (subs.every(s => s.done) && subs.length > 0) addXP(20);
      return meta;
    });
    setMetas(nuevas);
    guardarMetas(nuevas);
  };

  const metasFiltradas = metas.filter(m => {
    const okCat = filtroCategoria === 'todas' || m.categoria === filtroCategoria;
    const okPlazo = filtroPlazo === 'todos' || m.plazo === filtroPlazo;
    return okCat && okPlazo;
  });

  const metasCorto = metasFiltradas.filter(m => m.plazo === 'corto');
  const metasLargo = metasFiltradas.filter(m => m.plazo === 'largo');

  const MetaCard = ({ meta }) => {
    const cat = getCat(meta.categoria);
    const progreso = calcProgreso(meta.subtareas);
    const completada = progreso === 100;
    return (
      <div className={`meta-card${completada ? ' meta-card--done' : ''}`} style={{ '--mc': cat.color }}>
        <div className="meta-card__top">
          <span className="meta-cat-badge" style={{ background: cat.color + '33', color: cat.color }}>
            {cat.emoji} {cat.label}
          </span>
          {meta.fecha && <span className="meta-fecha">📅 {meta.fecha}</span>}
          <button className="meta-edit-btn" onClick={() => abrirEditar(meta)}>✏️</button>
        </div>
        <h3 className={`meta-titulo${completada ? ' meta-titulo--done' : ''}`}>{meta.titulo}</h3>
        {meta.descripcion && <p className="meta-desc">{meta.descripcion}</p>}

        {meta.subtareas.length > 0 && (
          <>
            <div className="meta-progreso-row">
              <div className="meta-progreso-bg">
                <div className="meta-progreso-fill" style={{ width: `${progreso}%`, background: cat.color }} />
              </div>
              <span className="meta-progreso-pct">{progreso}%</span>
            </div>
            <div className="meta-subs">
              {meta.subtareas.map(s => (
                <label key={s.id} className={`sub-item${s.done ? ' sub-item--done' : ''}`}>
                  <input type="checkbox" checked={s.done} onChange={() => toggleSubDirecto(meta.id, s.id)} />
                  <span>{s.texto}</span>
                </label>
              ))}
            </div>
          </>
        )}
        {completada && <div className="meta-completada-badge">🏆 ¡Meta completada!</div>}
      </div>
    );
  };

  const SeccionMetas = ({ titulo, icono, lista }) => (
    <div className="seccion">
      <div className="seccion-header">
        <span className="seccion-icono">{icono}</span>
        <h2 className="seccion-titulo">{titulo}</h2>
        <span className="seccion-count">{lista.length}</span>
      </div>
      {lista.length === 0 ? (
        <div className="seccion-vacia">
          <p>No hay metas aquí todavía.</p>
          <button className="btn-primary" onClick={abrirNueva}>+ Agregar meta</button>
        </div>
      ) : (
        <div className="metas-grid">
          {lista.map(m => <MetaCard key={m.id} meta={m} />)}
        </div>
      )}
    </div>
  );

  return (
    <div className="metas-wrap">

      {/* ── Header ── */}
      <div className="metas-header">
        <h2 className="metas-titulo">🎯 Mis Metas</h2>
        <div className="metas-stats">
          <span className="stat-chip">📋 {metas.length} total</span>
          <span className="stat-chip">✅ {metas.filter(m => calcProgreso(m.subtareas) === 100).length} completadas</span>
        </div>
        <button className="btn-primary" onClick={abrirNueva}>+ Nueva meta</button>
      </div>

      {/* ── Filtros ── */}
      <div className="filtros-bar">
        <div className="filtros-grupo">
          <button className={`filtro-btn${filtroCategoria === 'todas' ? ' active' : ''}`} onClick={() => setFiltroCategoria('todas')}>Todas</button>
          {CATEGORIAS.map(c => (
            <button key={c.id} className={`filtro-btn${filtroCategoria === c.id ? ' active' : ''}`}
              style={{ '--fc': c.color }} onClick={() => setFiltroCategoria(c.id)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <div className="filtros-grupo">
          <button className={`filtro-btn${filtroPlazo === 'todos' ? ' active' : ''}`} onClick={() => setFiltroPlazo('todos')}>Todos</button>
          <button className={`filtro-btn${filtroPlazo === 'corto' ? ' active' : ''}`} onClick={() => setFiltroPlazo('corto')}>⚡ Corto plazo</button>
          <button className={`filtro-btn${filtroPlazo === 'largo' ? ' active' : ''}`} onClick={() => setFiltroPlazo('largo')}>🌟 Largo plazo</button>
        </div>
      </div>

      {/* ── Secciones ── */}
      {(filtroPlazo === 'todos' || filtroPlazo === 'corto') && (
        <SeccionMetas titulo="Corto plazo" icono="⚡" lista={metasCorto} />
      )}
      {(filtroPlazo === 'todos' || filtroPlazo === 'largo') && (
        <SeccionMetas titulo="Largo plazo" icono="🌟" lista={metasLargo} />
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-titulo">{editId ? '✏️ Editar meta' : '🎯 Nueva meta'}</h3>

            <label className="modal-label">Título</label>
            <input className="modal-input" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
              placeholder="ej. Alcanzar B2 en inglés..." autoFocus onKeyDown={e => e.key === 'Enter' && guardar()} />

            <label className="modal-label">Descripción (opcional)</label>
            <textarea className="modal-textarea" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              placeholder="¿Por qué es importante esta meta?" rows={2} />

            <div className="modal-row">
              <div>
                <label className="modal-label">Categoría</label>
                <select className="modal-select" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="modal-label">Plazo</label>
                <select className="modal-select" value={form.plazo} onChange={e => setForm({ ...form, plazo: e.target.value })}>
                  {PLAZOS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <label className="modal-label">Fecha límite (opcional)</label>
            <input className="modal-input" type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />

            <label className="modal-label">Subtareas</label>
            <div className="sub-lista-form">
              {form.subtareas.map(s => (
                <div key={s.id} className="sub-form-item">
                  <input type="checkbox" checked={s.done} onChange={() => toggleSubForm(s.id)} />
                  <span className={s.done ? 'sub-done' : ''}>{s.texto}</span>
                  <button className="sub-del" onClick={() => eliminarSub(s.id)}>✕</button>
                </div>
              ))}
            </div>
            <div className="sub-add-row">
              <input className="modal-input" value={nuevaSub} onChange={e => setNuevaSub(e.target.value)}
                placeholder="+ Nueva subtarea..." onKeyDown={e => e.key === 'Enter' && agregarSub()} />
              <button className="btn-ghost" onClick={agregarSub}>Agregar</button>
            </div>

            <div className="modal-btns">
              {editId && <button className="btn-danger" onClick={() => eliminar(editId)}>🗑️ Eliminar</button>}
              <button className="btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardar} disabled={!form.titulo.trim()}>
                {editId ? 'Guardar cambios' : '+ Crear meta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}