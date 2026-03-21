import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, QueryConstraint } from 'firebase/firestore';

export function useFirestore<T>(path: string, ...queryConstraints: QueryConstraint[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) return;
    const q = query(collection(db, path), ...queryConstraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T)));
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path]);

  const addDocument = async (docData: any) => {
    return await addDoc(collection(db, path), docData);
  };

  const updateDocument = async (id: string, docData: any) => {
    return await updateDoc(doc(db, path, id), docData);
  };

  const deleteDocument = async (id: string) => {
    return await deleteDoc(doc(db, path, id));
  };

  return { data, loading, error, addDocument, updateDocument, deleteDocument };
}
