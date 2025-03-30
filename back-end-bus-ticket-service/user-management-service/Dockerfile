# Sử dụng SDK .NET 9
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Chỉ copy file dự án trước để cache restore
COPY user-management-service.csproj ./
RUN dotnet restore 

# Copy toàn bộ source code sau khi restore thành công
COPY . .

# Build ứng dụng
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "user-management-service.dll"]
