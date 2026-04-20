// Program.cs — MatchJob .NET 8 API
using System.Text;
using MatchJob.Data;
using MatchJob.Security;
using MatchJob.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ═══════════════════════════════════════════════════════════
// 1. BANCO DE DADOS — PostgreSQL via EF Core
// ═══════════════════════════════════════════════════════════
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
);

// ═══════════════════════════════════════════════════════════
// 2. JWT AUTHENTICATION
// ═══════════════════════════════════════════════════════════
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
var jwtKey    = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = jwtKey,
            ClockSkew                = TimeSpan.Zero // Sem tolerância de tempo
        };

        // Retorna JSON no 401 em vez de redirecionar
        options.Events = new JwtBearerEvents
        {
            OnChallenge = ctx =>
            {
                ctx.HandleResponse();
                ctx.Response.StatusCode  = 401;
                ctx.Response.ContentType = "application/json";
                return ctx.Response.WriteAsync("{\"message\":\"Token inválido ou ausente\"}");
            }
        };
    });

builder.Services.AddAuthorization();

// ═══════════════════════════════════════════════════════════
// 3. CORS — libera o app mobile (qualquer origem)
// ═══════════════════════════════════════════════════════════
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ═══════════════════════════════════════════════════════════
// 4. INJEÇÃO DE DEPENDÊNCIA — serviços e utilitários
// ═══════════════════════════════════════════════════════════
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProfessionalProfileService>();
builder.Services.AddScoped<ConversationService>();
builder.Services.AddScoped<MessageService>();

// ═══════════════════════════════════════════════════════════
// 5. CONTROLLERS + JSON
// ═══════════════════════════════════════════════════════════
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Mantém PascalCase na serialização (padrão .NET)
        opts.JsonSerializerOptions.PropertyNamingPolicy = null;
        // Converte enums para string (ex: "CLIENT" em vez de 0)
        opts.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });

// ═══════════════════════════════════════════════════════════
// 6. SWAGGER — documentação automática da API
// ═══════════════════════════════════════════════════════════
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "MatchJob API",
        Version     = "v1",
        Description = "MVP — Conectando clientes a profissionais autônomos"
    });

    // Adiciona suporte a JWT no Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Cole o token JWT aqui. Ex: eyJhbGci..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ═══════════════════════════════════════════════════════════
// BUILD
// ═══════════════════════════════════════════════════════════
var app = builder.Build();

// ═══════════════════════════════════════════════════════════
// 7. SEED — popula banco na primeira execução
// ═══════════════════════════════════════════════════════════
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DataSeeder.SeedAsync(db);
}

// ═══════════════════════════════════════════════════════════
// 8. MIDDLEWARE PIPELINE
// ═══════════════════════════════════════════════════════════
if (app.Environment.IsDevelopment())
{
    // Swagger disponível em http://localhost:5000/swagger
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();               // CORS antes de auth
app.UseAuthentication();     // Valida o JWT
app.UseAuthorization();      // Verifica permissões
app.MapControllers();        // Mapeia os controllers

Console.WriteLine("✅ MatchJob API rodando!");
Console.WriteLine("   Swagger: http://localhost:5000/swagger");

app.Run();
