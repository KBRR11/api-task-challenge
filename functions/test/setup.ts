// Aumentar el timeout para todas las pruebas
jest.setTimeout(10000);

// Mockear directamente firebase.ts
jest.mock("../src/utils/firebase", () => {
  return {
    db: {
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
    },
    checkFirestoreConnection: jest.fn().mockResolvedValue(true),
  };
});

// Mockear firebase-admin/firestore
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
    getFirestore: jest.fn(),
  };
});

// Mockear uuid
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mocked-uuid"),
}));

// Silenciar logs durante las pruebas
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};