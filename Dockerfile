###################
# BUILD FOR PRODUCTION
###################
FROM node:18-alpine AS base

RUN npm i -g pnpm ts-node

###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM base AS development

WORKDIR /usr/src/app

# Copy only package.json and pnpm lock for installation
COPY --chown=node:node package.json ./

RUN pnpm install 

# Copy the rest of the application files
COPY --chown=node:node . .

RUN mkdir -p /usr/src/app/logs && chown -R node:node /usr/src/app/logs

RUN cp .env.example .env

RUN pnpm build

# RUN chmod -R 777 /usr/src/app/
# Use the node user from the image (instead of the root user)
USER node

CMD ["pnpm", "start:prod"]
