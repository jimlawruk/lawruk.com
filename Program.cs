using Lawruk.Services;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.AddControllers(
    options => options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true);
services.AddScoped<RaceResultService>();
services.AddScoped<RecipeService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

// Serve the standalone Rome site (outside Angular) at /rome.
app.MapGet("/rome", () => Results.Redirect("/rome/"));

// Specific SPA fallback for race result URLs that include .html.
// MapFallbackToFile("index.html") won't match paths with a file extension.
app.MapFallbackToFile("/race-results/{*path}", "index.html");

// SPA fallback: any unmatched request serves index.html so Angular routing works on refresh
app.MapFallbackToFile("index.html");

app.Run();

