ARG RUBY_VERSION=2.7.6
FROM ruby:$RUBY_VERSION-slim as base

# Rack app lives here
WORKDIR /app

# Update gems and bundler
# rubygems 3.5 requires ruby 3 so we need to use 3.4
RUN gem update --system 3.4 --no-document && \
    gem install -N bundler


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libpq-dev

# Install application gems
COPY Gemfile* .
RUN bundle install


# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y postgresql-client && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Run and own the application files as a non-root user for security
RUN useradd ruby --home /app --shell /bin/bash
USER ruby:ruby

# Copy built artifacts: gems, application
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build --chown=ruby:ruby /app /app

# Copy application code
COPY --chown=ruby:ruby . .

# Start the server
EXPOSE 8080
CMD ["bundle", "exec", "rackup", "--host", "0.0.0.0", "--port", "8080"]
