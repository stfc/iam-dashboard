FROM nginx
COPY dist/iam-dashboard/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/sites-enabled/default
