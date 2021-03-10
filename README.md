# Picture Catalog

Internet is nothing without pictures and movies. We have many excellent medias like YouTybe, Instagram, Picasa and so on, but I haven't found a portal, where you can upload pictures and select individually who can see them.

That was a good theme for a full stack course work! 

## Preface

Chosen technologies for this project are React and Javascript for front-end, ASP.NET and C# for back-end, SQL database written with Entity Framework Core and Cloudinary cloud service. The project is written by Microsoft Visual Studio 2019. Please notice I really mean JavaScript, not TypeScript, although there are TypeScript files in a project. For some reason Visual Studio prefers TypeScript over JavaScript, and that's the reason you will see red error underlines in a Visual Studio IDE: there really are JavaScript code in TypeScript files, and that mixture does compile and run.

A user needs to subscribe to the portal, and then he / she can upload pictures other subscribers to see, perhaps for all to see or only for those, who are allowed to see. Subscribers can apply a permit for each other to see a set of pictures they like to.

## Requirements

To run this program, you need MySQL database engine installed on your computer. Entity framework will create a database called 'PictureDatabase' by itself, provided that username 'test' and password 'test' are valid. If not, you can change correct username and password in 'appsettings.json' file.

Furthermore, to get Cloudinary working, which is needed to store picture data, you need to create a Cloudinary account and replace "my_cloud_name", "my_api_key" and "my_api_secret" with appropriate values in the 'CloudinaryController.cs' file.

## License

This project is licensed under the MIT License.
