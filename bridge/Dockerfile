FROM node:20-slim

RUN npx -y trustgate-mcp-server --version 2>/dev/null || true
RUN npx -y bitget-mcp-server --version 2>/dev/null || true

WORKDIR /app
COPY package.json .
RUN npm install

COPY server.mjs .

ENV PORT=7860
EXPOSE 7860

CMD ["node", "server.mjs"]