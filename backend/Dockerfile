# syntax=docker/dockerfile:1
FROM ruby:3.2.2-slim

ENV LANG=C.UTF-8 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_JOBS=4 \
    BUNDLE_RETRY=3 \
    RAILS_LOG_TO_STDOUT=true \
    PORT=3000

# System deps: postgres client lib + build essentials for native gems + tini for proper signal handling.
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        build-essential \
        libpq-dev \
        postgresql-client \
        tini \
        curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache gems separately from app code so a code change does not invalidate the bundle install layer.
COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

# Entrypoint waits for postgres, runs db:prepare (create + migrate + seed if empty), then execs the CMD.
ENTRYPOINT ["/usr/bin/tini", "--", "bin/docker-entrypoint"]

EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
