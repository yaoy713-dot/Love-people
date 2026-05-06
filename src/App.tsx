import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useContacts } from './hooks/useContacts';
import { useCallLogs } from './hooks/useCallLogs';
import { useTopics } from './hooks/useTopics';
import { useMemos } from './hooks/useMemos';
import { useDashboard } from './hooks/useDashboard';
import { addContact } from './firebase/firestore';
import { computeStreak } from './lib/priority';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { ContactsView } from './views/ContactsView';
import { ContactDetailView } from './views/ContactDetailView';
import { HistoryView } from './views/HistoryView';
import { AddContactSheet } from './views/AddContactSheet';
import { Nav } from './components/Nav';
import type { ActiveView, Profile, Frequency } from './types';

export default function App() {
  const { user, loading, signIn } = useAuth();
  const { contacts, ready } = useContacts(user?.uid ?? null);
  const { callLogs, callNotes } = useCallLogs(user?.uid ?? null);
  const topics = useTopics(user?.uid ?? null);
  const memos = useMemos(user?.uid ?? null);

  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [activeProfile, setActiveProfile] = useState<Profile>('personal');
  const [detailContactId, setDetailContactId] = useState<string | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);

  const profileContacts = contacts.filter((c) => (c.profile ?? 'personal') === activeProfile);
  const dashboard = useDashboard(user?.uid ?? '', profileContacts, callLogs);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-stone-50"><div className="text-stone-400 text-sm">Loading…</div></div>;
  }
  if (!user) return <LoginView onSignIn={signIn} />;
  if (!ready) {
    return <div className="flex items-center justify-center min-h-screen bg-stone-50"><div className="text-stone-400 text-sm">Setting up your contacts…</div></div>;
  }

  const detailContact = detailContactId ? contacts.find((c) => c.id === detailContactId) ?? null : null;
  const detailStreak = detailContact ? computeStreak(detailContact, callLogs) : 0;

  async function handleAddContact(name: string, frequency: Frequency, profile: Profile) {
    if (!user) return;
    await addContact(user.uid, {
      name, frequency, profile,
      createdAt: new Date().toISOString(),
    });
  }

  function navTo(view: ActiveView) {
    setDetailContactId(null);
    setActiveView(view);
  }

  const profileToggle = (
    <div className="flex bg-stone-100 rounded-xl p-0.5 shrink-0">
      {(['personal', 'work'] as Profile[]).map((p) => (
        <button
          key={p}
          onClick={() => setActiveProfile(p)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
            activeProfile === p ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
          }`}
        >
          {p === 'personal' ? '🤍 Personal' : '💼 Work'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      <div className="flex-1 overflow-hidden">
        {detailContact ? (
          <ContactDetailView
            contact={detailContact}
            callLogs={callLogs}
            callNotes={callNotes}
            topics={topics}
            memos={memos}
            streak={detailStreak}
            onBack={() => setDetailContactId(null)}
            onCompleted={dashboard.handleCompleted}
            onNoAnswer={dashboard.handleNoAnswer}
            onBusy={dashboard.handleBusy}
          />
        ) : activeView === 'home' ? (
          <HomeView
            cards={dashboard.cards}
            allContacts={profileContacts}
            topics={topics}
            onBusy={dashboard.handleBusy}
            onNoAnswer={dashboard.handleNoAnswer}
            onCompleted={dashboard.handleCompleted}
            onSelectContact={(id) => setDetailContactId(id)}
            profileToggle={profileToggle}
          />
        ) : activeView === 'contacts' ? (
          <ContactsView
            contacts={contacts}
            callLogs={callLogs}
            topics={topics}
            profile={activeProfile}
            onSelect={(id) => setDetailContactId(id)}
            onAdd={() => setShowAddContact(true)}
            profileToggle={profileToggle}
          />
        ) : (
          <HistoryView callLogs={callLogs} callNotes={callNotes} contacts={contacts} />
        )}
      </div>

      <Nav active={activeView} onChange={navTo} />

      {showAddContact && (
        <AddContactSheet
          defaultProfile={activeProfile}
          onSave={handleAddContact}
          onClose={() => setShowAddContact(false)}
        />
      )}
    </div>
  );
}
