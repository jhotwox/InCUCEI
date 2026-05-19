FROM python:3.11-slim

USER root
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt rasa-sdk

# Copiar archivos del proyecto
COPY . .

# Asegurar que el directorio de modelos existe
RUN mkdir -p models

# Permisos para el script de inicio
RUN chmod +x start.sh

# Exponer puertos
EXPOSE 5005
EXPOSE 5055

CMD ["./start.sh"]
