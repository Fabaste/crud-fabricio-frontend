# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=24.14.1

FROM node:${NODE_VERSION}-alpine

# 1. Creamos la carpeta de la app y le damos los permisos al usuario node de antemano
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

    # [NUEVO 2.5]: Corregimos el dueño de los node_modules que npm ci acaba de crear como root
RUN chown -R node:node /usr/src/app/node_modules

# 3. Copiamos los archivos PRIMERO asignándole los permisos correctos al usuario 'node'
COPY --chown=node:node . .

# [NUEVO 3.5]: Aseguramos que TODA la carpeta final pertenezca a node antes de cambiar de usuario
RUN chown -R node:node /usr/src/app

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 5173

# Run the application.
CMD npx vite --host
