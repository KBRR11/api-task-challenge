import * as functions from 'firebase-functions';
import app from './main'; // este es tu archivo que contiene el Express app

// Exportar la app Express como una función HTTP
export const apiV1 = functions.https.onRequest(app);