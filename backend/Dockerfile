# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restaurar primero (capa cacheable)
COPY AgroNexo.sln ./
COPY src/AgroNexo.Domain/*.csproj src/AgroNexo.Domain/
COPY src/AgroNexo.Application/*.csproj src/AgroNexo.Application/
COPY src/AgroNexo.Infrastructure/*.csproj src/AgroNexo.Infrastructure/
COPY src/AgroNexo.API/*.csproj src/AgroNexo.API/
RUN dotnet restore src/AgroNexo.API/AgroNexo.API.csproj

COPY src/AgroNexo.Domain src/AgroNexo.Domain
COPY src/AgroNexo.Application src/AgroNexo.Application
COPY src/AgroNexo.Infrastructure src/AgroNexo.Infrastructure
COPY src/AgroNexo.API src/AgroNexo.API
RUN dotnet publish src/AgroNexo.API/AgroNexo.API.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# Usuario sin privilegios (la imagen de .NET 8 trae "app")
USER app
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD curl -fs http://localhost:8080/health || exit 1
ENTRYPOINT ["dotnet", "AgroNexo.API.dll"]
