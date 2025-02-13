import { useState, useEffect } from 'react';

export function useDatabase() {
  const [currentSession, setCurrentSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLatestSession = async () => {
    try {
      const response = await fetch('/api/sessions/latest');
      if (!response.ok) throw new Error('Failed to fetch session');
      const session = await response.json();
      
      setCurrentSession(session);
      setParticipants(JSON.parse(session?.people || '[]'));
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = async (name) => {
    try {
      if (!currentSession) return;
      
      const updatedPeople = [...participants, name];
      console.log('updatedPeople:', updatedPeople);
      const response = await fetch(`/api/sessions/${currentSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ people: updatedPeople }),
      });

      if (!response.ok) throw new Error('Failed to update participants: ' + response.statusText);
      const result = await response.json();
      setParticipants(result.people);
    } catch (err) {
      console.error('Error adding participant:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchLatestSession();
  }, []);

  return { currentSession, participants, loading, error, addParticipant };
}