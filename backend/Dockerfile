FROM node:20-alpine

# Install Java (required by Liquibase) and curl
RUN apk add --no-cache openjdk17-jre curl bash

# Install Liquibase
ENV LIQUIBASE_VERSION=4.27.0
RUN mkdir -p /usr/local/liquibase && \
    curl -sSL https://github.com/liquibase/liquibase/releases/download/v${LIQUIBASE_VERSION}/liquibase-${LIQUIBASE_VERSION}.tar.gz \
    | tar -xz -C /usr/local/liquibase && \
    ln -s /usr/local/liquibase/liquibase /usr/local/bin/liquibase

# Install PostgreSQL JDBC driver
RUN mkdir -p /usr/local/liquibase/lib && \
    curl -sSL https://jdbc.postgresql.org/download/postgresql-42.7.3.jar \
    -o /usr/local/liquibase/lib/postgresql.jar

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 4000

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
