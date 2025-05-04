
using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Picture_Catalog;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Picture_Catalog.Controllers;
using System.Net;
using CloudinaryDotNet;

var options = new WebApplicationOptions
{
    WebRootPath = "ClientApp/build"
};
var builder = WebApplication.CreateBuilder(options);

// T‰m‰ lis‰‰ tiedostossa C:\Users\<user>\AppData\Roaming\Microsoft\UserSecrets\Picture_Catalog\secrets.json
// olevat salasanat ja k‰ytt‰j‰tunnukset konfiguraatioon kehitysymp‰ristˆss‰.
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

//builder.WebHost.ConfigureKestrel(options =>
//{
//    options.ListenLocalhost(5001, listenOptions =>
//    {
//        listenOptions.UseHttps();
//    });
//});

//Visual Studio tarjoaa kaksi erilaista palvelinta, IIS Express ja Kestrel. Kestrel asetukset tehd‰‰n alla.
builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    var host = Dns.GetHostEntry("picture_catalog.my");

    if (context.HostingEnvironment.IsDevelopment())
    {

        //T‰m‰ on kehitysymp‰ristˆ‰ varten.
        serverOptions.ListenLocalhost(5000);
    }

    //T‰m‰ on julkista IP:t‰ varten.
    serverOptions.Listen(host.AddressList[0], 5001, listenOptions =>
    {

        //"CertPath" ja "CertPassword" tiedot haetaan UserSecretsist‰.
        listenOptions.UseHttps(builder.Configuration["CertPath"], builder.Configuration["CertPassword"]);
    });
});

// Lis‰‰ endpointit.
builder.Services.AddControllers();

// Lis‰t‰‰n mySQL tietokanta konteksti.
builder.Services.AddDbContext<PictureDatabase>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), 
    ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Lis‰t‰‰n Swagger API dokumentaatio.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Picture Catalog API", Version = "v1" });
});

// Release versiossa React sovelluksen tiedostot haetaan t‰‰lt‰.
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "ClientApp/build";
});

//Raakadatan kuljettamiseen POST-komennon bodyssa tarvitaan oma inputformatteri.
builder.Services.AddMvc(
    o =>
    {
        o.InputFormatters.Add(new RawRequestBodyFormatter());
    }
);

//Luodaan tietokantakonteksti. T‰m‰ on pakollinen, jotta tietokannan taulut luodaan
//ja alustetaan, jos niit‰ ei ole viel‰ olemassa.
using (var serviceProvider = builder.Services.BuildServiceProvider())
{
    var context = serviceProvider.GetRequiredService<PictureDatabase>();
    PictureServerController.Initialize(context);
}

var app = builder.Build();

// K‰ynnistet‰‰n swagger, joka luo automaattisesti dokumentaation API:sta.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Virheet ohjataan omaan Exceptions k‰sittelyyn.
if (app.Environment.IsDevelopment())
{

    app.UseDeveloperExceptionPage();


    Exceptions(app, app.Environment);
}
else
{
    Exceptions(app, app.Environment);

    // T‰m‰ pakottaa k‰ytt‰m‰‰n HTTPS yhteytt‰.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseSpaStaticFiles();
app.UseRouting();


// Otetaan k‰yttˆˆn REST API endpointit.
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller}/{action=Index}/{id?}");
});

// Otetaan k‰yttˆˆn React Frontend.
app.UseSpa(spa =>
{
    spa.Options.SourcePath = "ClientApp";
    
    if (app.Environment.IsDevelopment())
    {
        spa.UseReactDevelopmentServer(npmScript: "start");
    }
    
});

// K‰ynnistet‰‰n Cloudinary.
CloudinaryController.Initialize();

// K‰ynnistet‰‰n ohjelma.
app.Run();



/// <summary>
/// T‰m‰ funktio k‰sittelee serverin virhetilanteet ja l‰hett‰‰ niist‰ informaation
/// frontendiin. Jos serveri‰ ajetaan development-tilassa, frontendiin l‰hetet‰‰n 
/// yksityiskohtaisempaa tietoa virheest‰.
/// </summary>
/// <param name="app"></param>
/// <param name="env"></param>
void Exceptions(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            IExceptionHandlerFeature except = context.Features.Get<IExceptionHandlerFeature>();
            if (except != null)
            {

                // Viestiteksti sis‰lt‰‰ sek‰ virhekoodin ett‰ virhekuvauksen.
                string[] text = except.Error.Message.Split("@", 2, StringSplitOptions.None);
                int code = 500;
                if (!int.TryParse(text[0], out code)) code = 500;
                context.Response.ContentType = "application/problem+json";
                context.Response.StatusCode = code;

                // T‰m‰ viesti l‰hetet‰‰n sek‰ deployment ett‰ development tilassa.
                string message = text[1];

                // Jos kyseess‰ on development-tila, viestiin lis‰t‰‰n lis‰tietoa,
                // mik‰li InnerException ei ole null.
                if (env.IsDevelopment() && except.Error.InnerException != null)
                {
                    message = message + Environment.NewLine + "Details: " + except.Error.InnerException.Message;
                }

                // Serialisoidaan responseen body.
                var stream = context.Response.Body;
                await JsonSerializer.SerializeAsync(stream, message);
            }
        });
    });
}