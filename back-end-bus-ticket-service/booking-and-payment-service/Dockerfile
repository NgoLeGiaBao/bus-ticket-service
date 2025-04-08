# Use official .NET runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 9503

# Use official .NET SDK as build image
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["booking-and-payment-service.csproj", "./"]
RUN dotnet restore "booking-and-payment-service.csproj"

# Copy source code and build
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "booking-and-payment-service.dll"]
