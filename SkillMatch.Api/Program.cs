using Microsoft.EntityFrameworkCore;
using SkillMatch.Api.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Register encoding provider for Latin-1 support in CsvHelper
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

// منع مشكلة EventLog
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Services
builder.Services.AddControllers();

// Database Context
var mongoConnectionString = Environment.GetEnvironmentVariable("MONGODB_URI") 
    ?? builder.Configuration.GetConnectionString("MongoDbConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMongoDB(mongoConnectionString ?? "", "ProjectApp"));

// Swagger / OpenAPI
builder.Services.AddSwaggerGen();

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
    app.UseSwagger();
    app.UseSwaggerUI();
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