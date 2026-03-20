import { useEffect, useState } from 'react';
import useStore from './store/useStore';
import Dashboard from './tabs/Dashboard';
import Horario from './tabs/Horario';
import Metas from './tabs/Metas';
import Habitos from './tabs/Habitos';
import Roadmap from './tabs/Roadmap';
import Estudio from './tabs/Estudio';
import Tecnologia from './tabs/Tecnologia';
import Portafolio from './tabs/Portafolio';
import Estadisticas from './tabs/Estadisticas';
import Diario from './tabs/Diario';
import Herramientas from './tabs/Herramientas';
import Ejercicio from './tabs/Ejercicio';
import Streams from './tabs/Streams';

const TABS = [
  'Dashboard', 'Horario', 'Metas', 'Hábitos', 'Roadmap',
  'Estudio', 'Tecnología', 'Portafolio', 'Estadísticas',
  'Diario', 'Herramientas', 'Ejercicio', 'Streams',
];

const TAB_ICONS = {
  Dashboard: '🏠', Horario: '📅', Metas: '🎯', Hábitos: '✅',
  Roadmap: '🗺️', Estudio: '📚', Tecnología: '💻', Portafolio: '🌐',
  Estadísticas: '📊', Diario: '📓', Herramientas: '🛠️',
  Ejercicio: '🏋️', Streams: '🎮',
};

const Placeholder = ({ name }) => (
  <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚧</div>
    <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}>
      {name} — próximamente
    </p>
  </div>
);

function renderTab(tab) {
  if (tab === 'Dashboard') return <Dashboard />;
  if (tab === 'Horario') return <Horario />;
  if (tab === 'Metas') return <Metas />;
  if (tab === 'Hábitos') return <Habitos />;
  if (tab === 'Roadmap') return <Roadmap />;
  if (tab === 'Estudio') return <Estudio />;
  if (tab === 'Tecnología') return <Tecnologia />;
  if (tab === 'Portafolio') return <Portafolio />;
  if (tab === 'Estadísticas') return <Estadisticas />;
  if (tab === 'Diario') return <Diario />;
  if (tab === 'Herramientas') return <Herramientas />;
  if (tab === 'Ejercicio') return <Ejercicio />;
  if (tab === 'Streams') return <Streams />;
  return <Placeholder name={tab} />;
  
}

export default function App() {
  const {
    xp, streak,
    activeTab, setActiveTab,
    darkMode, toggleDarkMode, applyDarkMode,
    checkAndUpdateStreak,
  } = useStore();

  const XP_PER_LEVEL = 500;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpCurrent = xp % XP_PER_LEVEL;
  const xpPercent = (xpCurrent / XP_PER_LEVEL) * 100;

  const [clock, setClock] = useState('');
  useEffect(() => {
    const fmt = () => {
    const n = new Date();
    let h = n.getHours();
    const m = String(n.getMinutes()).padStart(2, '0');
    const s = String(n.getSeconds()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m}:${s} ${ampm}`;
};
    setClock(fmt());
    const id = setInterval(() => setClock(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    applyDarkMode();
    checkAndUpdateStreak();
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="gem" onClick={() => setActiveTab('Dashboard')}>💎</div>
          <div className="header-info">
            <h1>Santiago's Dashboard</h1>
            <div className="tagline">tu universo personal ✨</div>
          </div>
        </div>
        <div className="header-right">
          <span className="clock">{clock}</span>
          {streak > 0 && <span className="streak-chip">🔥 {streak} días</span>}
          <button className="theme-btn" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="xp-bar-wrap">
          <span className="level-badge">Nv. {level}</span>
          <div className="xp-bar-bg">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
          <span className="xp-count">{xpCurrent} / {XP_PER_LEVEL} XP</span>
        </div>
      </header>

      <nav className="tabs-bar">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_ICONS[tab]} {tab}
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {renderTab(activeTab)}
      </main>
    </>
  );
}