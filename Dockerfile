FROM dunglas/frankenphp:php8.3-alpine

# Instalar extensiones necesarias
RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    pcntl \
    redis \
    bcmath \
    intl \
    zip \
    gd

# Copiar código
COPY . /app
WORKDIR /app

# Instalar Composer
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Instalar dependencias
RUN composer install --optimize-autoloader --no-dev

# Permisos de storage
RUN chmod -R 775 /app/storage /app/bootstrap/cache
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Comandos de arranque
ENTRYPOINT ["frankenphp", "php-server", "--root", "/app/public", "--listen", ":8000"]
