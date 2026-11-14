FROM node:17.9.1-alpine3.15
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]