using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Picture_Catalog
{

    public class PictureSet
    {
        public int Id { get; set; }
        public int mUserId { get; set; }
        public string mPictureSet { get; set; }
        public List<PictureItem> cPictures { get; set; }
    }

    public class PictureItem
    {
        public int Id { get; set; }
        public int mPictureId { get; set; }

    }

    public class User
    {
        public int Id { get; set; }
        public string mPassword { get; set; }
        public string mUser { get; set; }
        public string mName { get; set; }
        public List<PictureSetItem> cPictureSets { get; set; }
    }

    public class PictureSetItem
    {
        public int Id { get; set; }
        public int mPictureSetId { get; set; }
    }

    public class Picture
    {
        public int Id { get; set; }

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
        public DbSet<PictureItem> dbPictureItems { get; set; }
        public DbSet<PictureSetItem> dbPictureSetItems { get; set; }

        
        public PictureDatabase(DbContextOptions<PictureDatabase> options) : base(options) { }

    }
}

