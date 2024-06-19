###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:20-alpine AS development

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node


###################
# BUILD FOR PRODUCTION
###################
FROM node:20-alpine AS build
WORKDIR /app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

USER node

###################
# RUN PRODUCTION
###################
FROM node:20-alpine AS production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/.env ./.env

CMD ["node", "dist/main.js"]
