FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/data
EXPOSE 8787
CMD ["npm", "start"]
