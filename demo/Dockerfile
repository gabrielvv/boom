FROM nginx:stable

ARG API_BASE_URL
ARG API_TOKEN
ARG SENTRY_DSN

COPY index.html /usr/share/nginx/html/
RUN sed -i \
  -e "s/API_BASE_URL/$API_BASE_URL/" \
  -e "s/API_TOKEN/$API_TOKEN/" \
  -e "s#BASE_PATH#$BASE_PATH#" \
  -e "s#SENTRY_DSN#$SENTRY_DSN#" \
  /usr/share/nginx/html/index.html

COPY nginx.conf /etc/nginx/nginx.conf
