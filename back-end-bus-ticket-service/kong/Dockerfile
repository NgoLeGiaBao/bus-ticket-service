FROM kong/kong-gateway:3.4

# Install any required dependencies
USER root
RUN apk add --no-cache <any-required-packages>
USER kong

# Copy custom plugins (if any)
COPY ./plugins /usr/local/kong/plugins/

# Copy declarative configuration
COPY kong.yml /usr/local/kong/declarative/kong.yml

# Set environment variables
ENV KONG_DATABASE=off \
    KONG_DECLARATIVE_CONFIG=/usr/local/kong/declarative/kong.yml \
    KONG_PROXY_LISTEN=0.0.0.0:8000 \
    KONG_ADMIN_LISTEN=0.0.0.0:8001 \
    KONG_PLUGINS=bundled,<your-custom-plugins> \
    KONG_NGINX_DAEMON=off

# Verify the configuration during build
RUN kong config parse /usr/local/kong/declarative/kong.yml