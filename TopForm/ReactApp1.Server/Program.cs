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

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 31)))); 

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
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

builder.Services.AddScoped<TokenValidationService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; 
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, 
            ValidateAudience = false, 
            ValidateLifetime = true, 
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-longer-secret-key-here-256-bitss")),
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://localhost:52515")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHttpClient();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

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

app.UseCors("AllowFrontend");

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
        string currentDirectory = Directory.GetCurrentDirectory();
        string pythonAppPath = Path.Combine(currentDirectory, "AI", "ai.py");

        ProcessStartInfo startInfo = new ProcessStartInfo
        {
            FileName = "python", 
            Arguments = pythonAppPath, 
            UseShellExecute = false, 
            CreateNoWindow = true 
        };

        Process.Start(startInfo);
        Console.WriteLine("Python Flask alkalmazás elindítva.");
    }
    catch (System.Exception ex)
    {
        Console.WriteLine("Hiba történt a Python Flask alkalmazás indításakor: " + ex.Message);
    }
}