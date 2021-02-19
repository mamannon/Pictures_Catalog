using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Picture_Catalog
{
    /// <summary>
    /// Tässä luokassa määritetään tarvittavat custominpuformatterit kuvadatan käsittelyyn.
    /// </summary>
    public class RawRequestBodyFormatter : InputFormatter
    {

        public RawRequestBodyFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/plain"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/octet-stream"));
        }

        /// <summary>
        /// Tällä funktiolla ASP.NET tarkistaa, voidaanko annettua dataa lukea.
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        public override bool CanRead(InputFormatterContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            var contentType = context.HttpContext.Request.ContentType;
            if (string.IsNullOrEmpty(contentType) || contentType == "image/jpeg" ||
                contentType == "image/png" || contentType == "image/gif" ||
                contentType == "image/jpg")
                return true;

            return false;
        }

        /// <summary>
        /// Tällä funktiolla ASP.NET lukee sellaisen datan, jota se ei itse osaa lukea.
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        public override async Task<InputFormatterResult> ReadRequestBodyAsync(InputFormatterContext context)
        {
            var request = context.HttpContext.Request;
            var contentType = context.HttpContext.Request.ContentType;

            //Tänne ei periaatteessa pitäisi joutua tässä sovelluksessa.
            if (string.IsNullOrEmpty(contentType))
            {
                using (var reader = new StreamReader(request.Body))
                {

                    //Ilmoitetaan sisältö tyypittömäksi.
                    Controllers.CloudinaryController.Format = "";

                    //Kopioidaan data stringiin.
                    string content = await reader.ReadToEndAsync();
                    return await InputFormatterResult.SuccessAsync(content);
                }
            }

            //Tätä on tarkoitus käyttää.
            if (contentType == "image/jpeg" ||
                contentType == "image/png" || contentType == "image/gif" ||
                contentType == "image/jpg")
            {
                using (var ms = new MemoryStream(2048))
                {

                    //Otetaan talteen tieto sisällön tyypistä.
                    string temp = contentType;
                    int i = temp.LastIndexOf('/');
                    if (i >= 0) temp = temp.Substring(i+1);
                    Controllers.CloudinaryController.Format = temp;

                    //Kopioidaan data byte[] taulukkoon.
                    await request.Body.CopyToAsync(ms);
                    byte[] content = ms.ToArray();
                    return await InputFormatterResult.SuccessAsync(content);
                }
            }

            return await InputFormatterResult.FailureAsync();
        }
    }
}
