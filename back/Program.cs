// Program.cs — MatchJob .NET 8 API
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
// 2. JWT AUTHENTICATION — Supabase JWKS
// ═══════════════════════════════════════════════════════════
var supabaseUrl = builder.Configuration["Supabase:Url"]
    ?? throw new InvalidOperationException("Supabase:Url não configurado.");
var supabaseAuthority = $"{supabaseUrl}/auth/v1";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Fetches signing keys from /.well-known/openid-configuration automatically
        options.Authority            = supabaseAuthority;
        options.RequireHttpsMetadata = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidIssuer              = supabaseAuthority,
            ValidateAudience         = true,
            ValidAudience            = "authenticated",
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ClockSkew                = TimeSpan.Zero,
        };

        // Return JSON on 401 instead of redirecting
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
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
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
builder.Services.AddScoped<ServiceRequestService>();

// ═══════════════════════════════════════════════════════════
// 5. CONTROLLERS + JSON
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

builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<FavoriteService>();
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

app.UseCors("AllowFrontend");
app.UseCors();               // CORS antes de auth
app.UseAuthentication();     // Valida o JWT
app.UseAuthorization();      // Verifica permissões
app.MapControllers();        // Mapeia os controllers

Console.WriteLine("✅ MatchJob API rodando!");
Console.WriteLine("   Swagger: http://localhost:5000/swagger");

app.Run();
