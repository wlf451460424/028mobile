FROM hub.mc.corp/library/nginx-alpine
LABEL MAINTAINER Sean
COPY dist/Mobile/ /usr/share/nginx/html
COPY conf/mobileweb.conf /etc/nginx/conf.d/default.conf

EXPOSE 80