// Aumentar el timeout para todas las pruebas
jest.setTimeout(10000);

// Mockear directamente el módulo firebase.ts
jest.mock("../src/utils/firebase", () => {
  const mockDb = {
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

  return {
    db: mockDb,
    checkFirestoreConnection: jest.fn().mockResolvedValue(true),
  };
}, {virtual: true});

// Mock para firebase-admin/app
jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
  applicationDefault: jest.fn(),
  getApps: jest.fn(() => [{name: "mock-app"}]),
}));

// Mock para firebase-admin/firestore
jest.mock("firebase-admin/firestore", () => {
  const mockTimestamp = {
    toDate: jest.fn().mockReturnValue(new Date("2023-01-01T10:00:00Z")),
    seconds: 1672567200,
    nanoseconds: 0,
    valueOf: jest.fn(),
    toJSON: jest.fn().mockReturnValue({seconds: 1672567200, nanoseconds: 0}),
    toMillis: jest.fn().mockReturnValue(1672567200000),
  };

  return {
    Timestamp: {
      now: jest.fn().mockReturnValue(mockTimestamp),
      fromDate: jest.fn().mockReturnValue(mockTimestamp),
    },
    getFirestore: jest.fn().mockReturnValue({}),
  };
});

// Mock de uuid
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mocked-uuid"),
}));

// Silenciar mensajes de consola durante las pruebas
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};
