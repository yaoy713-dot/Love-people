import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useContacts } from './hooks/useContacts';
import { useCallLogs } from './hooks/useCallLogs';
import { useDashboard } from './hooks/useDashboard';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { ContactsView } from './views/ContactsView';
import { ContactDetailView } from './views/ContactDetailView';
import { HistoryView } from './views/HistoryView';
import { Nav } from './components/Nav';
import type { ActiveView, CallNote } from './types';

type NoteFields = Omit<CallNote, 'id' | 'contactId' | 'callLogId' | 'date'>;

export default function App() {
  const { user, loading, signIn } = useAuth();
  const { contacts, ready } = useContacts(user?.uid ?? null);
  const { callLogs, callNotes } = useCallLogs(user?.uid ?? null);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [detailContactId, setDetailContactId] = useState<string | null>(null);

  const dashboard = useDashboard(user?.uid ?? '', contacts, callLogs);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="text-stone-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onSignIn={signIn} />;
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="text-stone-400 text-sm">Setting up your contacts…</div>
      </div>
    );
  }

  const detailContact = detailContactId
    ? contacts.find((c) => c.id === detailContactId) ?? null
    : null;

  async function handleCompleted(contactId: string, note?: NoteFields) {
    await dashboard.handleCompleted(contactId, note);
  }

  function handleNoAnswer(contactId: string) {
    dashboard.handleNoAnswer(contactId);
  }

  function handleBusy(contactId: string) {
    dashboard.handleBusy(contactId);
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      <div className="flex-1 overflow-hidden">
        {detailContact && activeView === 'contacts' ? (
          <ContactDetailView
            contact={detailContact}
            callLogs={callLogs}
            callNotes={callNotes}
            onBack={() => setDetailContactId(null)}
            onCompleted={handleCompleted}
            onNoAnswer={handleNoAnswer}
            onBusy={handleBusy}
          />
        ) : activeView === 'home' ? (
          <HomeView
            cards={dashboard.cards}
            inWindow={dashboard.inWindow}
            upcomingNames={dashboard.upcomingNames}
            allContacts={contacts}
            onBusy={handleBusy}
            onNoAnswer={handleNoAnswer}
            onCompleted={handleCompleted}
            onSelectContact={(id) => { setDetailContactId(id); setActiveView('contacts'); }}
          />
        ) : activeView === 'contacts' ? (
          <ContactsView
            contacts={contacts}
            callLogs={callLogs}
            onSelect={(id) => setDetailContactId(id)}
          />
        ) : (
          <HistoryView
            callLogs={callLogs}
            callNotes={callNotes}
            contacts={contacts}
          />
        )}
      </div>

      <Nav
        active={activeView}
        onChange={(v) => { setDetailContactId(null); setActiveView(v); }}
      />
    </div>
  );
}
