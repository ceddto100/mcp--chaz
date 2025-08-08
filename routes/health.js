async function healthRoutes(server, options) {
  server.get('/', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}

export default healthRoutes;
