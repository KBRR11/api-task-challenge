// test/mocks/firebase.mock.ts
// Utilidad para mockear Firebase en todos los tests

export const mockTimestamp = {
    toDate: jest.fn().mockReturnValue(new Date('2023-01-01T10:00:00Z')),
    seconds: 1672567200,
    nanoseconds: 0,
    valueOf: jest.fn(),
    toJSON: jest.fn().mockReturnValue({ seconds: 1672567200, nanoseconds: 0 }),
    toMillis: jest.fn().mockReturnValue(1672567200000),
  };
  
  // Mock para Firestore
  export const mockFirestore = {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }),
      where: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          get: jest.fn(),
        }),
        get: jest.fn(),
      }),
      add: jest.fn(),
    }),
  };
  
  // Configuración de mocks para los módulos de Firebase
  export const setupFirebaseMocks = () => {
    // Mock para firebase-admin/app
    jest.mock('firebase-admin/app', () => ({
      initializeApp: jest.fn(),
      applicationDefault: jest.fn(),
      getApps: jest.fn(() => [{ name: 'mock-app' }]),
    }));
  
    // Mock para firebase-admin/firestore
    jest.mock('firebase-admin/firestore', () => ({
      Timestamp: {
        now: jest.fn().mockReturnValue(mockTimestamp),
        fromDate: jest.fn().mockReturnValue(mockTimestamp)
      },
      getFirestore: jest.fn().mockReturnValue(mockFirestore),
    }));
    
    // Mockear firebase.ts directamente
    jest.mock('../../src/utils/firebase', () => ({
      db: mockFirestore,
      checkFirestoreConnection: jest.fn().mockResolvedValue(true),
    }), { virtual: true });
  };