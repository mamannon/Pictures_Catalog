using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Picture_Catalog
{

    public class User
    {

        public User()
        {
            this.cPictureSets = new HashSet<PictureSet>();
        }

        public int UserId { get; set; }
        public string mPassword { get; set; }
        public string mUser { get; set; }
        public string mName { get; set; }
        public ICollection<PictureSet> cPictureSets { get; set; }
    }

    public class PictureSet
    {

        public PictureSet()
        {
            this.cPictures = new HashSet<PictureSetPicture>();
            this.cAllowedUsers = new HashSet<AllowedUser>();
        }

        public int PictureSetId { get; set; }
        public string mPictureSet { get; set; }
        public ICollection<PictureSetPicture> cPictures { get; set; }
        public int mUserId { get; set; }
        public ICollection<AllowedUser> cAllowedUsers { get; set; }
        public User User { get; set; }
    }

    public class AllowedUser
    {
        public int AllowedUserId { get; set; }
        public string mAllowedUser { get; set; }
        public int mPictureSetId { get; set; }
    }

    public class Picture
    {

        public Picture()
        {
            this.cPictureSets = new HashSet<PictureSetPicture>();
        }

        public int PictureId { get; set; }
        public string mPictureSet { get; set; }
        public string mURL { get; set; }
        public string mLegend { get; set; }
        public ICollection<PictureSetPicture> cPictureSets { get; set; }
    }

    public class PictureSetPicture
    {
        public PictureSet PictureSet { get; set; }
        public Picture Picture { get; set; }
        public int mPictureSetId { get; set; }
        public int mPictureId { get; set; }
    }
    
    public class PictureDatabase : DbContext
    {
        public DbSet<Picture> dbPictures { get; set; }
        public DbSet<PictureSet> dbPictureSets { get; set; }
        public DbSet<User> dbUsers { get; set; }
        public DbSet<AllowedUser> dbAllowedUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.mName).IsRequired();
                entity.Property(e => e.mUser).IsRequired();
                entity.Property(e => e.mPassword).IsRequired();
                entity.HasMany(e => e.cPictureSets).WithOne();
            });

            modelBuilder.Entity<PictureSet>(entity =>
            {
                entity.HasKey(e => e.PictureSetId);
                entity.Property(e => e.mPictureSet).IsRequired();
                entity.Property(e => e.mUserId).IsRequired();
                entity.HasMany(e => e.cPictures).WithOne();
                entity.HasMany(e => e.cAllowedUsers).WithOne();
//                entity.HasOne(e => e.User).WithMany(e => e.cPictureSets).HasForeignKey(e => e.mUserId);  //TODO: tämä tarvitaan!!!
            });

            modelBuilder.Entity<Picture>(entity =>
            {
                entity.HasKey(e => e.PictureId);
                entity.Property(e => e.mURL).IsRequired();
                
            });

            modelBuilder.Entity<AllowedUser>(entity =>
            {
                entity.HasKey(e => e.AllowedUserId);
                entity.Property(e => e.mAllowedUser).IsRequired();
                entity.Property(e => e.mPictureSetId).IsRequired();
            });

            modelBuilder.Entity<PictureSetPicture>(entity =>
            {
                entity.HasKey(e => new { e.mPictureId, e.mPictureSetId });
                entity.HasOne(e => e.Picture).WithMany(e => e.cPictureSets).HasForeignKey(e => e.mPictureId);
                entity.HasOne(e => e.PictureSet).WithMany(e => e.cPictures).HasForeignKey(e => e.mPictureSetId);
            });
        }

        public PictureDatabase(DbContextOptions<PictureDatabase> options) : base(options) { }

    }
}

