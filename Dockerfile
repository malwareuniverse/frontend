FROM docker.io/node:26-alpine AS build
WORKDIR /app
COPY .env /app/.env

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . /app
RUN npm run build

# production environment
FROM docker.io/nginx:1.31.1-alpine-slim
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]