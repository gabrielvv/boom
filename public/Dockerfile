FROM nginx

ARG API_BASE_URL

COPY index.html /usr/share/nginx/html/
RUN sed -i "s/API_BASE_URL/$API_BASE_URL/" /usr/share/nginx/html/index.html

COPY nginx.conf /etc/nginx/nginx.conf
