
/*
 * USESWAGGER makro pit‰‰ m‰‰ritell‰ seuraavissa tiedostoissa:
 * Startup.cs, PictureServerController.cs.
 */

//K‰yt‰ swaggeria
//#define USESWAGGER

//K‰yt‰ itse koodaamaasi frontendi‰
#undef USESWAGGER

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Microsoft.AspNetCore.Diagnostics;
using Picture_Catalog;
using Microsoft.OpenApi.Models;
using System.Linq;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http;
using System;
using System.Text;
using static Picture_Catalog.Controllers.PictureServerController;
using System.Text.Json;

namespace Picture_Catalog
{

    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

#if USESWAGGER
            services.AddMvc();
#endif

#if !USESWAGGER
            services.AddControllersWithViews();
#endif

#if USESWAGGER
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Version = "v1",
                    Title = "PictureCatalog API",
                    Description = "Example of ASP.NET Core Web API"
                });
 //               c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
            });
#endif
            //T‰m‰ lis‰‰ MySQL tietokantakontekstin.
            services.AddDbContextPool<PictureDatabase>(options =>
                options.UseMySql(Configuration.GetConnectionString("DefaultConnection")));

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
            /*
                        //T‰m‰ lis‰‰ MySQL tietokantakontekstin 
                        services.AddDbContextPool<PictureDatabase>(options => options.UseMySql(
                            Configuration.GetConnectionString("DefaultConnection")
                        ));
            */
            

            
            //Raakadatan kuljettamiseen POST-komennon bodyssa tarvitaan oma inputformatteri.
            services.AddMvc(
                
                o =>
                {
                    o.InputFormatters.Add(new RawRequestBodyFormatter());
                }
                
            );
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

#if USESWAGGER
            app.UseSwagger();
            app.UseSwaggerUI(c => {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "PictureCatalog Test API v1");
//                c.SwaggerEndpoint("./v1/swagger.json", "PictureCatalog Test API v1");
                c.RoutePrefix = string.Empty;
            });
#endif

            if (env.IsDevelopment())
            {
                //app.UseDeveloperExceptionPage();  //Default exception handler.
                Exceptions(app, env);
            }
            else
            {
                //app.UseExceptionHandler("/Error");   //Default exception handler.
                Exceptions(app, env);

                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }

        /// <summary>
        /// T‰m‰ funktio k‰sittelee serverin virhetilanteet ja l‰hett‰‰ niist‰ informaation
        /// frontendiin. Jos serveri‰ ajetaan development-tilassa, frontendiin l‰hetet‰‰n 
        /// yksityiskohtaisempaa tietoa virheest‰.
        /// </summary>
        /// <param name="app"></param>
        /// <param name="env"></param>
        private void Exceptions(IApplicationBuilder app, IWebHostEnvironment env)
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
                        Error error = new Error()
                        {
                            mCode = code,
                            mMessage = text[1],
                            mDetails = null
                        };

                        // Jos kyseess‰ on development-tila, viestiin lis‰t‰‰n lis‰tietoa,
                        // mik‰li InnerException ei ole null.
                        if (env.IsDevelopment() && except.Error.InnerException != null)
                        {
                            error.mDetails = except.Error.InnerException.Message;
                        }

                        // Serialisoidaan responseen body.
                        var stream = context.Response.Body;
                        await JsonSerializer.SerializeAsync(stream, error);
                    }
                });
            });
        }
    }
}
