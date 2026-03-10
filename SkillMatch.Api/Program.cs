using Microsoft.EntityFrameworkCore;
using SkillMatch.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// منع مشكلة EventLog
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Services
builder.Services.AddControllers();

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger / OpenAPI
builder.Services.AddOpenApi();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger in development
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection();

// مهم: فعل CORS قبل الـ endpoints
app.UseCors("AllowFrontend");

// إذا عندك Auth/JWT لاحقًا خلي UseAuthentication قبل UseAuthorization
// app.UseAuthentication();
// app.UseAuthorization();

// Test endpoint
app.MapGet("/", () => "SkillMatch API is running");

// مهم: ربط الكنترولرز
app.MapControllers();

app.Run();