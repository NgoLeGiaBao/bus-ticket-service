FROM kong/kong-gateway:3.4
COPY kong.yml /usr/local/kong/declarative/kong.yml
ENV KONG_DATABASE=off
ENV KONG_DECLARATIVE_CONFIG=/usr/local/kong/declarative/kong.yml
