const mockPoolQuery = jest.fn();
const mockPoolConnect = jest.fn();
const mockPoolEnd = jest.fn();
const mockPoolOn = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: mockPoolQuery,
    connect: mockPoolConnect,
    end: mockPoolEnd,
    on: mockPoolOn,
  })),
}));

describe('database config', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('queries through the pool', async () => {
    process.env.NODE_ENV = 'test';
    const module = await import('../../src/config/database');
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ ok: true }], rowCount: 1 });

    const result = await module.query('SELECT 1');

    expect(result.rows).toEqual([{ ok: true }]);
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT 1', undefined);
  });

  it('returns a client from getClient', async () => {
    process.env.NODE_ENV = 'test';
    const client = { release: jest.fn() };
    mockPoolConnect.mockResolvedValueOnce(client);
    const module = await import('../../src/config/database');

    const result = await module.getClient();

    expect(result).toBe(client);
  });

  it('closes the pool', async () => {
    process.env.NODE_ENV = 'test';
    const module = await import('../../src/config/database');

    await module.closeDatabase();

    expect(mockPoolEnd).toHaveBeenCalled();
  });
});
