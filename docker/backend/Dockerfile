FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["back/MatchJob.csproj", "./"]
RUN dotnet restore "MatchJob.csproj"

COPY back/ .
RUN dotnet build "MatchJob.csproj" -c Release -o /app/build --no-restore

FROM build AS publish
RUN dotnet publish "MatchJob.csproj" -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN adduser --disabled-password --gecos "" appuser \
 && chown -R appuser /app
USER appuser

COPY --from=publish /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "MatchJob.dll"]
