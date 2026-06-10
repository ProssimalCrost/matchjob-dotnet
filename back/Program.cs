// Program.cs — MatchJob .NET 8 API
using MatchJob.Data;
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
// 2. JWT AUTHENTICATION — Supabase (RS256 via JWKS)
// ═══════════════════════════════════════════════════════════
var supabaseUrl = builder.Configuration["Supabase:Url"]
    ?? throw new InvalidOperationException("Supabase:Url não configurado.");
var supabaseAuthority = $"{supabaseUrl}/auth/v1";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // RS256: busca as chaves públicas automaticamente via OIDC discovery
        options.Authority            = supabaseAuthority;
        options.MetadataAddress      = $"{supabaseAuthority}/.well-known/openid-configuration";
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer   = true,
            ValidIssuer      = supabaseAuthority,
            ValidateAudience = true,
            ValidAudience    = "authenticated",
            ValidateLifetime = true,
            ClockSkew        = TimeSpan.Zero,
        };

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
// 3. CORS — libera o frontend Next.js
// ═══════════════════════════════════════════════════════════
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.WithOrigins(
                      "http://localhost:3000",
                      "http://localhost:8081",
                      "http://127.0.0.1:8081",
                      "http://localhost:19006",
                      "http://127.0.0.1:19006")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

// ═══════════════════════════════════════════════════════════
// 4. INJEÇÃO DE DEPENDÊNCIA — serviços
// ═══════════════════════════════════════════════════════════
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProfessionalProfileService>();
builder.Services.AddScoped<ConversationService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddScoped<ServiceRequestService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<FavoriteService>();

// ═══════════════════════════════════════════════════════════
// 5. CONTROLLERS + JSON (PascalCase para compatibilidade com o frontend)
// ═══════════════════════════════════════════════════════════
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = null;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        opts.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });

// ═══════════════════════════════════════════════════════════
// 6. SWAGGER
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

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Cole o access_token do Supabase aqui."
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
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("✅ MatchJob API rodando!");
Console.WriteLine($"   JWT via: OIDC/JWKS (RS256) — {supabaseAuthority}");
Console.WriteLine("   Swagger: http://localhost:5000/swagger");

app.Run();
