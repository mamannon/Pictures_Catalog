using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Picture_Catalog
{

    public class PictureSet
    {
        public int Id { get; set; }
        public User cUser { get; set; }
        public string mPictureSet { get; set; }
        public ICollection<Picture> cPictures { get; set; }
    }

    public class User
    {
        public int Id { get; set; }
        public string mName { get; set; }
        public ICollection<PictureSet> cPictureSets { get; set; }
    }

    public class Picture
    {
        public int Id { get; set; }

        public PictureSet cPictureSet { get; set; }

        public string mPictureSet { get; set; }

        public string mURL { get; set; }

        public string mLegend { get; set; }
    }

    public class Button
    {

        public string mName { get; set; }

        public string mPictureSet { get; set; }

        public int mPSID { get; set; }
    }

    public class PictureDatabase : DbContext
    {
        public DbSet<Picture> dbPictures { get; set; }
        public DbSet<PictureSet> dbPictureSets { get; set; }
        public DbSet<User> dbUsers { get; set; }

        
        public PictureDatabase(DbContextOptions<PictureDatabase> options) : base(options) { }

    }
}

