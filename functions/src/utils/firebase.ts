import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

//? Inicializar Firebase Admin si aún no está inicializado
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

//* Obtener instancia de Firestore
export const db = getFirestore();

// Función auxiliar para verificar la conexión a Firestore
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    // Intenta realizar una operación simple para verificar la conexión
    const testCollection = db.collection('_test_connection');
    const testDoc = testCollection.doc('test');
    await testDoc.set({ timestamp: new Date().toISOString() });
    await testDoc.delete();
    return true;
  } catch (error) {
    console.error('Error al conectar con Firestore:', error);
    return false;
  }
};

// Exportar para uso en la aplicación
export default {
  db,
  checkFirestoreConnection
};