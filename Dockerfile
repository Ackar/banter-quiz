FROM node:latest as frontend-build

WORKDIR /app

COPY . .

WORKDIR /app/frontend

RUN npm install
RUN npm run build

FROM golang:1.21-alpine as go-build

WORKDIR /app

COPY backend/go.mod backend/go.sum backend/
RUN cd backend && go mod download
COPY . .

WORKDIR /app/backend

COPY --from=frontend-build /app/frontend/dist /app/backend/frontend_dist

RUN go build

FROM golang:1.21-alpine as runner

COPY --from=go-build /app/backend/backend /app

CMD ["/app"]