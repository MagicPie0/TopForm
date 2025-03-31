using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Swashbuckle.AspNetCore.SwaggerGen;
using back_end.Data;
using Microsoft.EntityFrameworkCore;
using asp.Server.Services;
using Microsoft.OpenApi.Models;
using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;

var builder = WebApplication.CreateBuilder(args);

// Adatbázis kapcsolat beállítása (példa: MySQL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 31)))); // Az aktuális MySQL verziódat add meg itt

// Alkalmazás szolgáltatásainak hozzáadása
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();
builder.Services.AddEndpointsApiExplorer();

// Swagger konfiguráció hozzáadása
builder.Services.AddSwaggerGen(c =>
{
    // Security definíció hozzáadása
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Kérjük, adja meg a 'Bearer' előtagot a token előtt"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
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

// Token validation szolgáltatás
builder.Services.AddScoped<TokenValidationService>();

// JWT Auth middleware beállítása
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // Fejlesztéshez engedélyezheted HTTP-t
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, // Nem szükséges validálni az issuer-t, ha nem állítottad be
            ValidateAudience = false, // Nem szükséges validálni az audience-t
            ValidateLifetime = true, // Token élettartam ellenőrzése
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-longer-secret-key-here-256-bitss")), // Titkos kulcs
        };
    });

// CORS beállítások, ha frontend külön domainen fut
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://localhost:52515") // Frontend domain
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHttpClient();


var app = builder.Build();

// Fejlesztési környezetben engedélyezzük a Swagger-t
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTP kérés kezelése
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    Console.WriteLine("Swagger UI is enabled.");
}
else
{
    Console.WriteLine("Not in Development Mode. Swagger UI is not enabled.");
}


app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// CORS használata
app.UseCors("AllowFrontend");

// Autentikáció és autorizáció engedélyezése
app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

StartPythonFlaskApp();


app.Run();
void StartPythonFlaskApp()
{
    try
    {
        // Az aktuális munkakönyvtár és a relatív Python alkalmazás elérési útja
        string currentDirectory = Directory.GetCurrentDirectory();
        string pythonAppPath = Path.Combine(currentDirectory, "AI", "ai.py"); // Módosítsd a relatív elérési útvonalat

        ProcessStartInfo startInfo = new ProcessStartInfo
        {
            FileName = "python", // A Python futtató parancs
            Arguments = pythonAppPath, // A Python alkalmazás fájlja (Flask alkalmazás)
            UseShellExecute = false, // Ne használja a shell-t
            CreateNoWindow = true // Ne nyisson új ablakot
        };

        Process.Start(startInfo);
        Console.WriteLine("Python Flask alkalmazás elindítva.");
    }
    catch (System.Exception ex)
    {
        // Ha a Python Flask alkalmazás elindítása nem sikerül
        Console.WriteLine("Hiba történt a Python Flask alkalmazás indításakor: " + ex.Message);
    }
}