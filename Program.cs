using Lawruk.Services;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.AddControllers(
    options => options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true);
services.AddSingleton<RaceResultService>();

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

// SPA fallback: any unmatched request serves index.html so Angular routing works on refresh
app.MapFallbackToFile("index.html");

app.Run();

