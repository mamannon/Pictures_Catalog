using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Picture_Catalog
{

    public class User
    {
        [JsonPropertyName("UserId")]
        public int UserId { get; set; }
        public string mPassword { get; set; }
        public string mUser { get; set; }
        public string mName { get; set; }
        public ICollection<PictureSet> cPictureSets { get; set; }
    }

    public class PictureSet
    {
        [JsonPropertyName("PictureSetId")]
        public int PictureSetId { get; set; }
        public string mPictureSet { get; set; }
        public ICollection<PictureSetPicture> cPictures { get; set; }
        public int mUserId { get; set; }
        public ICollection<AllowedUser> cAllowedUsers { get; set; }

        [JsonPropertyName("User")]
        public User User { get; set; }
    }

    public class AllowedUser
    {
        [JsonPropertyName("AllowedUserId")]
        public int AllowedUserId { get; set; }
        public int mOwnerUserId { get; set; }
        public string mAllowedUser { get; set; }
        public string mPictureSet { get; set; }

        [JsonPropertyName("PictureSet")]
        public PictureSet PictureSet { get; set; }
    }

    public class Picture
    {
        public string mPublicId { get; set; }
        public int mUserId { get; set; }

        [JsonPropertyName("PictureId")]
        public int PictureId { get; set; }
        public string mPictureSet { get; set; }
        public string mURL { get; set; }
        public string mLegend { get; set; }
        public ICollection<PictureSetPicture> cPictureSets { get; set; }
    }

    public class PictureSetPicture
    {
        [JsonPropertyName("PictureSet")]
        public PictureSet PictureSet { get; set; }

        [JsonPropertyName("Picture")]
        public Picture Picture { get; set; }
        public int mPictureSetId { get; set; }
        public int mPictureId { get; set; }
    }

    public class AppliedRight
    {
        [JsonPropertyName("AppliedRightId")]
        public int AppliedRightId { get; set; }
        public int mApplicantUserId { get; set; }
        public int mOwnerUserId { get; set; }
        public int mPictureSetId { get; set; }
    }
    
    public class PictureDatabase : DbContext
    {
        public DbSet<Picture> dbPictures { get; set; }
        public DbSet<PictureSet> dbPictureSets { get; set; }
        public DbSet<User> dbUsers { get; set; }
        public DbSet<AllowedUser> dbAllowedUsers { get; set; }
        public DbSet<PictureSetPicture> dbPictureSetPictures { get; set; }
        public DbSet<AppliedRight> dbAppliedRights { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.mName).IsRequired();
                entity.Property(e => e.mUser).IsRequired();
                entity.Property(e => e.mPassword).IsRequired();
                entity.HasMany(e => e.cPictureSets).WithOne(e => e.User);
            });

            modelBuilder.Entity<PictureSet>(entity =>
            {
                entity.HasKey(e => e.PictureSetId);
                entity.Property(e => e.mPictureSet).IsRequired();
                entity.Property(e => e.mUserId).IsRequired();
                entity.HasMany(e => e.cAllowedUsers).WithOne(e => e.PictureSet);
            });

            modelBuilder.Entity<Picture>(entity =>
            {
                entity.HasKey(e => e.PictureId);
                entity.Property(e => e.mURL).IsRequired();
                entity.Property(e => e.mUserId).IsRequired();
            });

            modelBuilder.Entity<AllowedUser>(entity =>
            {
                entity.HasKey(e => e.AllowedUserId);
                entity.Property(e => e.mAllowedUser).IsRequired();
                entity.Property(e => e.mOwnerUserId).IsRequired();
                entity.Property(e => e.mPictureSet).IsRequired();
            });

            modelBuilder.Entity<PictureSetPicture>(entity =>
            {
                entity.Property(e => e.mPictureId).IsRequired();
                entity.Property(e => e.mPictureSetId).IsRequired();
                entity.HasKey(e => new { e.mPictureId, e.mPictureSetId });
                entity.HasOne(e => e.Picture).WithMany(e => e.cPictureSets).HasForeignKey(e => e.mPictureId);
                entity.HasOne(e => e.PictureSet).WithMany(e => e.cPictures).HasForeignKey(e => e.mPictureSetId);
            });

            modelBuilder.Entity<AppliedRight>(entity =>
            {
                entity.HasKey(c => c.AppliedRightId);
                entity.Property(e => e.mApplicantUserId).IsRequired();
                entity.Property(e => e.mPictureSetId).IsRequired();
                entity.Property(e => e.mOwnerUserId).IsRequired();
            });

        }

        public PictureDatabase(DbContextOptions<PictureDatabase> options) : base(options) { }

    }
}

