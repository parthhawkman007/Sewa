import { MessageSquareMore, SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppData } from '../../context/AppDataContext';
import styles from './ChatDock.module.css';

export default function ChatDock() {
  const {
    chatOpen,
    setChatOpen,
    chatThreads,
    activeThreadId,
    setActiveThreadId,
    chatMessages,
    postMessage,
  } = useAppData();
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    await postMessage(message);
    setMessage('');
  };

  return (
    <>
      <button type="button" className={styles.fab} onClick={() => setChatOpen((current) => !current)}>
        <MessageSquareMore size={18} />
        Chat
      </button>
      <AnimatePresence>
        {chatOpen ? (
          <motion.section className={styles.panel} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
            <div className={styles.header}>
              <div>
                <p className="section-eyebrow">Chat system</p>
                <h3>Role-based messages</h3>
              </div>
            </div>
            <div className={styles.threadTabs}>
              {chatThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  className={`${styles.threadButton} ${activeThreadId === thread.id ? styles.active : ''}`}
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  {thread.title}
                </button>
              ))}
            </div>
            <div className={styles.messages}>
              {chatMessages.map((item) => (
                <article key={item.id} className={styles.message}>
                  <strong>{item.senderName}</strong>
                  <p>{item.text}</p>
                  <span>{item.time}</span>
                </article>
              ))}
            </div>
            <div className={styles.composer}>
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message" />
              <button type="button" onClick={handleSend}>
                <SendHorizontal size={16} />
              </button>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
}
