
/*
 * USESWAGGER makro pit�� m��ritell� seuraavissa tiedostoissa:
 * Startup.cs, PictureServerController.cs.
 */

//K�yt� swaggeria
#define USESWAGGER

//K�yt� itse koodaamaasi frontendi�
//#undef USESWAGGER

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

using Picture_Catalog;
using Microsoft.OpenApi.Models;
using System.Linq;

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

            services.AddDbContextPool<PictureDatabase>(options =>
            options.UseMySql(Configuration.GetConnectionString("DefaultConnection")));

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
            /*
                        //T�m� lis�� MySQL tietokantakontekstin 
                        services.AddDbContextPool<PictureDatabase>(options => options.UseMySql(
                            Configuration.GetConnectionString("DefaultConnection")
                        ));
            */
            services.AddMvc();
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
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
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
    }
}
