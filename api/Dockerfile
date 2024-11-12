FROM ghcr.io/roadrunner-server/roadrunner:2024.2.1 AS roadrunner

FROM composer:2 as builder

RUN mkdir -p /app


COPY . /app
WORKDIR /app

RUN composer install --optimize-autoloader --ignore-platform-reqs --no-scripts --no-dev &&  \
    composer dump-autoload


FROM php:8.3-cli-bookworm
ENV XDEBUG="false"
ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libz-dev \
        libpq-dev \
        libjpeg-dev \
        libpng-dev \
        libfreetype6-dev \
        libssl-dev \
        libmcrypt-dev \
        libmagickwand-dev \
        nano \
        htop \
        libxml2-dev \
        libzip-dev \
        unzip \
        && rm -r /var/lib/apt/lists/*

# Install soap extention
RUN docker-php-ext-install soap exif pcntl zip pdo_pgsql bcmath sockets

#--------------------------------------------------------------------------
# Final Touch
#--------------------------------------------------------------------------

ADD ./.deploy/php/local.ini /usr/local/etc/php/conf.d

RUN usermod -u 1000 www-data && groupmod -g 1000 www-data

COPY . /var/www/
WORKDIR /var/www

COPY --from=roadrunner /usr/bin/rr /var/www/rr
COPY --from=builder /app/vendor/ /var/www/vendor/

RUN php artisan route:cache && php artisan config:cache

EXPOSE 8000

VOLUME ["/var/www"]

CMD /bin/bash -c 'php artisan octane:start --server=roadrunner --host=0.0.0.0 --port=8000 --rpc-port=6001 --rr-config=.rr.yaml --workers=4'
