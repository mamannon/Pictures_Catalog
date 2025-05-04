using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Picture_Catalog.Controllers
{

    /// <summary>
    /// Tämä luokka huolehtii yhdeydenpidosta Cloudinaryn kanssa.
    /// </summary>
    public static class CloudinaryController
    {

        /// <summary>
        /// Tämä sisältää Cloudinary-tilin tiedot.
        /// </summary>
        private static Account account = null;

        /// <summary>
        /// Cloudinary rajapinta. Tämän ilmentymä luodaan Picture Catalog serverin käynnistyessä.
        /// </summary>
        private static Cloudinary cloudinary = null;

        /// <summary>
        /// Cloudinaryyn tallennettavan kuvatiedoston kuvaformaatti (jpg, jpeg, png, gif). List 
        /// tarvitaan, koska tallennettavia kuvia voi olla jonossa, koska käytössä on vain yksi
        /// Cloudinary-tili joka ehtii tehdä vain yhden käyttäjän kuvan talletuksen kerrallaan.
        /// </summary>
        private static List<string> format = new List<string>();

        public static string Format
        {
            get
            {
                if (format.Count > 0)
                {
                    string temp = format[0];
                    format.RemoveAt(0);
                    return temp;
                }
                else
                {
                    return null;
                }
            }
            set
            {
                format.Add(value);
            }
        }

        /// <summary>
        /// Picture Catalog serverin käynnistyessä sen pitää ottaa yhteys Cloudinaryyn.
        /// </summary>
        public static void Initialize()
        {

            // Cloudinary-tilin tiedot haetaan UserSecretsistä. Sinun täytyy lisätä oman Cloudinary-tilisi
            // tiedot UserSecrets-tiedostoon. Tai sitten voit vain lisätä ne suoraan alla kommentoituun koodiin
            // korvaamalla "my_cloud_name", "my_api_key" ja "my_api_secret" omilla tiedoillasi.
            //account = new Account(
            //    "my_cloud_name",
            //    "my_api_key",
            //    "my_api_secret");
            var config = new ConfigurationBuilder().AddUserSecrets<Program>().Build();
            account = new Account(
                config["my_cloud_name"],
                config["my_api_key"],
                config["my_api_secret"]);

            cloudinary = new Cloudinary(account);
        }

        /// <summary>
        /// Tällä metodilla tallennetaan kuva Cloudinaryyn ja returnina saadaan tallennetun 
        /// kuvan PublicId.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public static string UploadToCloudinary(byte[] data, string user)
        {
            using (MemoryStream memoryStream = new MemoryStream(data))
            {
                ImageUploadParams uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription("streamed", memoryStream),
                    Folder = "PC/" + user,
                    Format = CloudinaryController.Format
                };

                ImageUploadResult uploadResult = cloudinary.Upload(uploadParams);

                //Jos tallennus onnistui... 
                if (uploadResult.StatusCode == HttpStatusCode.OK)
                {

                    //Palautetaan kuvan PublicId.
                    return uploadResult.PublicId;
                }         
            }

            //Tallennus epäonnistui ja palautetaan null.
            return null;
        }

        /// <summary>
        /// Tällä metodilla etsitään kuvaa PublicId:n avulla cloudinarysta. Jos kuva löytyy,
        /// palauttaa metodi viittausparametreissa kuvan url-osoitteen.
        /// </summary>
        /// <param name="url"></param>
        /// <param name="publicId"></param>
        public static GetResourceResult FindFromCloudinary(string publicId)
        {
            return cloudinary.GetResource(publicId);
        }

        /// <summary>
        /// Tällä metodilla poistetaan kuva Cloudinarysta perustuen PublicId:een.
        /// </summary>
        /// <param name="url"></param>
        public static void RemoveFromCloudinary(string publicId)
        {
            DeletionParams temp = new DeletionParams(publicId)
            {
                Invalidate = true,
                PublicId = publicId
            };
            cloudinary.Destroy(temp);
        }
    }
}
