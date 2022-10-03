FROM node:10
 
ENV DEBUG="notes:*,messages:*" 
ENV SEQUELIZE_CONNECT="models/sequelize-docker-sql.yaml" 
ENV NOTES_MODEL="sequelize" 
ENV USER_SERVICE_URL="http://userauth:3333" 
ENV PORT="3000" 
ENV NOTES_SESSIONS_DIR="/sessions"

RUN mkdir -p /notesapp /notesapp/partials /notesapp/public /notesapp/routes /notesapp/views

COPY models/*.mjs models/sequelize-docker-sql.yaml /notesapp/models/
COPY partials/ /notesapp/partials/
COPY public/ /notesapp/public/
COPY routes/ /notesapp/routes/
COPY views/ /notesapp/views/
COPY app.mjs package.json /notesapp/

WORKDIR /notesapp

RUN apt-get update -y \
    && apt-get -y install curl python build-essential git ca-certificates sqlite3 \
    && npm install --unsafe-perm

VOLUME /sessions 

EXPOSE 3000 

CMD node --experimental-modules ./app