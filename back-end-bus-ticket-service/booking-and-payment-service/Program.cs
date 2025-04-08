using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text;
using Microsoft.AspNetCore.Http;


using booking_and_payment_service.data;
using booking_and_payment_service.services;
using booking_and_payment_service.services.payment;

var builder = WebApplication.CreateBuilder(args);

// Configuration kestrel
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(9503);
});

// Configuration Database
builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var secretKey = builder.Configuration["JwtSettings:Secret"] ?? "";
var issuer = builder.Configuration["JwtSettings:Issuer"] ?? "";
var audience = builder.Configuration["JwtSettings:Audience"] ?? "";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });


// Register IHttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Register Redis
var redisConnectionString = builder.Configuration["Redis:Configuration"];
if (string.IsNullOrEmpty(redisConnectionString))
{
    throw new InvalidOperationException("Redis connection string is missing or empty.");
}
// Register Redis as a singleton service
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    return ConnectionMultiplexer.Connect(redisConnectionString);
});

// VNPay config
builder.Services.Configure<VNPaySettings>(
    builder.Configuration.GetSection("VNPay"));

// Register VNPayUtil & VNPayAdapter
builder.Services.AddSingleton<VNPayUtil>();
builder.Services.AddScoped<VNPayAdapter>();

// Inject services
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<RedisService>();



// Add services to the container.
builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();

// Configuration Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Booking And Payment API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer {token}'",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

var app = builder.Build();

// Middleware
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.MapControllers();

app.MapGet("/", () => "Hello, World!, this is booking and payment service");

app.Run();
