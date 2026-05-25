jest.mock('axios', () => {
  const handlers = {
    request: [],
    response: []
  };

  const mockAxiosInstance = {
    interceptors: {
      request: {
        use: jest.fn((fn) => { handlers.request.push(fn); })
      },
      response: {
        use: jest.fn((successFn, errorFn) => { handlers.response.push({ successFn, errorFn }); })
      }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    _handlers: handlers
  };

  return {
    create: jest.fn(() => mockAxiosInstance),
    __mockInstance: mockAxiosInstance
  };
});

describe('httpClient', () => {
  let localStorageMock;
  let mockInstance;

  beforeEach(() => {
    jest.resetModules();

    localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value; }),
        removeItem: jest.fn((key) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; })
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
  });

  function loadHttpClient() {
    const mod = require('./httpClient');
    const axiosMod = require('axios');
    mockInstance = axiosMod.__mockInstance;
    return mod.default;
  }

  describe('dado a configuração base', () => {
    it('deve criar instância com baseURL, headers e timeout', () => {
      loadHttpClient();
      const axiosMod = require('axios');

      expect(axiosMod.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
    });
  });

  describe('dado o request interceptor', () => {
    it('deve injetar Authorization header quando token existe', () => {
      loadHttpClient();
      const requestHandler = mockInstance._handlers.request[0];

      localStorageMock.getItem.mockReturnValue('meu-token-123');
      const config = { headers: {} };

      const result = requestHandler(config);

      expect(result.headers.Authorization).toBe('Bearer meu-token-123');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('não deve injetar Authorization header quando token não existe', () => {
      loadHttpClient();
      const requestHandler = mockInstance._handlers.request[0];

      localStorageMock.getItem.mockReturnValue(null);
      const config = { headers: {} };

      const result = requestHandler(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('dado o response interceptor', () => {
    it('deve retornar response em caso de sucesso', () => {
      loadHttpClient();
      const { successFn } = mockInstance._handlers.response[0];

      const response = { data: { success: true } };
      expect(successFn(response)).toEqual(response);
    });

    it('deve limpar localStorage quando receber 401', async () => {
      loadHttpClient();
      const { errorFn } = mockInstance._handlers.response[0];

      const error = { response: { status: 401 } };

      await expect(errorFn(error)).rejects.toEqual(error);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('não deve limpar localStorage para outros erros HTTP', async () => {
      loadHttpClient();
      const { errorFn } = mockInstance._handlers.response[0];

      const error = { response: { status: 500 } };

      await expect(errorFn(error)).rejects.toEqual(error);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('deve rejeitar o erro para propagação', async () => {
      loadHttpClient();
      const { errorFn } = mockInstance._handlers.response[0];

      const error = { response: { status: 403 } };

      await expect(errorFn(error)).rejects.toEqual(error);
    });

    it('não deve quebrar quando error não tem response (network error)', async () => {
      loadHttpClient();
      const { errorFn } = mockInstance._handlers.response[0];

      const error = { message: 'Network Error' };

      await expect(errorFn(error)).rejects.toEqual(error);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });
});