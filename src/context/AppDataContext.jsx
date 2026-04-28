import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { getChatMessages, sendChatMessage } from '../services/chatService';
import { markNotificationRead } from '../services/notificationService';

const AppDataContext = createContext({
  activeTasks: [],
  allIssues: [],
  notifications: [],
});

export function AppDataProvider({ children }) {
  const auth = useAuth();
  const user = auth?.user;
  const [activeTasks, setActiveTasks] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatThreads, setChatThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Firestore Listeners
  useEffect(() => {
    if (!user) return;

    // 1. Listen for Notifications
    const qNotif = query(
      collection(db, 'notifications'),
      where('role', 'in', ['all', user.role]),
      orderBy('createdAt', 'desc')
    );
    const unsubNotif = onSnapshot(qNotif, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Listen for Chat Threads
    const qThreads = query(
      collection(db, 'chat_threads'),
      where('participants', 'array-contains', user.role)
    );
    const unsubThreads = onSnapshot(qThreads, (snapshot) => {
      const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatThreads(threads);
      if (threads.length > 0 && !activeThreadId) {
        setActiveThreadId(threads[0].id);
      }
    });

    // 3. Listen for Tasks (Role specific)
    const qTasks = query(collection(db, 'tasks'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveTasks(
        user.role === 'volunteer'
          ? taskData.filter((task) => task.volunteerId === user.id || task.volunteerName === user.name || task.status === 'queued')
          : taskData
      );
    });

    // 4. Listen for All Issues
    const qIssues = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
    const unsubIssues = onSnapshot(qIssues, (snapshot) => {
      setAllIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubNotif();
      unsubThreads();
      unsubTasks();
      unsubIssues();
    };
  }, [user]);

  // Messages listener
  useEffect(() => {
    if (!activeThreadId) return;
    
    // Based on backend repository update logic, it's a nested array in 'chat_threads'
    const unsubThreadDoc = onSnapshot(doc(db, 'chat_threads', activeThreadId), (snapshot) => {
       if (snapshot.exists()) {
         setChatMessages(snapshot.data().messages || []);
       }
    });

    return () => unsubThreadDoc();
  }, [activeThreadId]);

  const readNotification = async (id) => {
    await markNotificationRead(id);
  };

  const postMessage = async (text) => {
    if (!user || !activeThreadId || !text.trim()) return;
    await sendChatMessage({
      threadId: activeThreadId,
      senderRole: user.role,
      senderName: user.name,
      text,
    });
  };

  const value = useMemo(
    () => ({
      activeTasks,
      setActiveTasks,
      allIssues,
      notifications,
      notificationPanelOpen,
      setNotificationPanelOpen,
      readNotification,
      chatOpen,
      setChatOpen,
      chatThreads,
      activeThreadId,
      setActiveThreadId,
      chatMessages,
      postMessage,
    }),
    [activeTasks, allIssues, notifications, notificationPanelOpen, chatOpen, chatThreads, activeThreadId, chatMessages],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  return useContext(AppDataContext);
}
