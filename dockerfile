FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 5000

COPY . .

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["npm", "start"]
