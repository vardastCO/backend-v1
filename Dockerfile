# BUILD FOR PRODUCTION
FROM node:18-alpine AS base

RUN npm i -g pnpm ts-node

###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM base AS development

WORKDIR /usr/src/app

# Copy only package.json and pnpm lock for installation
COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN pnpm install

# Copy the rest of the application files
COPY --chown=node:node . .

RUN cp .env.example .env

RUN pnpm build

# Use the node user from the image (instead of the root user)
USER node

###################
# PRODUCTION IMAGE
###################

FROM base AS production

WORKDIR /usr/src/app

# Copy only package.json and pnpm lock for installation
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install pnpm and PM2 globally
RUN npm install -g pnpm pm2

RUN pnpm install

# Copy the compiled application files
COPY --chown=node:node --from=development /usr/src/app/dist /usr/src/app/dist

# Use the node user from the image (instead of the root user)
USER node

# Expose the port your app will run on
EXPOSE 3080

# Use PM2 to start the application in production
CMD ["pm2-runtime", "start", "pnpm", "--", "start:prod", "-i", "10"]
