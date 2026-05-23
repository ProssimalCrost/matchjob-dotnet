# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia apenas o .csproj primeiro (cache de dependências)
COPY ["MatchJob.Api/MatchJob.Api.csproj",  "MatchJob.Api/"]
COPY ["MatchJob.Core/MatchJob.Core.csproj", "MatchJob.Core/"]
COPY ["MatchJob.Infra/MatchJob.Infra.csproj", "MatchJob.Infra/"]

RUN dotnet restore "MatchJob.Api/MatchJob.Api.csproj"

# Copia o restante do código
COPY . .

WORKDIR "/src/MatchJob.Api"
RUN dotnet build "MatchJob.Api.csproj" -c Release -o /app/build

# ─── Stage 2: Publish ─────────────────────────────────────────────────────────
FROM build AS publish
RUN dotnet publish "MatchJob.Api.csproj" -c Release -o /app/publish \
    /p:UseAppHost=false

# ─── Stage 3: Runtime (produção) ─────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Usuário não-root
RUN adduser --disabled-password --gecos "" appuser \
 && chown -R appuser /app
USER appuser

COPY --from=publish /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "MatchJob.Api.dll"]
