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
        public List<int> cPictures { get; set; }
    }

    public class User
    {
        public int Id { get; set; }
        public string mPassword { get; set; }
        public string mUser { get; set; }
        public List<PictureSet> cPictureSets { get; set; }
    }

    public class Picture
    {
        public int Id { get; set; }

        public int mUserId { get; set; }

        public string mURL { get; set; }

        public string mLegend { get; set; }
    }

    public class Button
    {

        public string mUser { get; set; }

        public string mPictureSet { get; set; }

        public int mPSID { get; set; }
    }

    public class Log
    {
        public string mUser;
        public string mPassword;
    }

    public class TempLog
    {
        public string mUser;
        public int mTemporaryID;
    }
    
    public class PictureDatabase : DbContext
    {
        public DbSet<Picture> dbPictures { get; set; }
        public DbSet<PictureSet> dbPictureSets { get; set; }
        public DbSet<User> dbUsers { get; set; }

        
        public PictureDatabase(DbContextOptions<PictureDatabase> options) : base(options) { }

    }
}

