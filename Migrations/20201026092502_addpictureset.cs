using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Picture_Catalog.Migrations
{
    public partial class addpictureset : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "dbUsers",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    mName = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dbUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "dbPictureSets",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    cUserId = table.Column<int>(nullable: true),
                    mPictureSet = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dbPictureSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_dbPictureSets_dbUsers_cUserId",
                        column: x => x.cUserId,
                        principalTable: "dbUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "dbPictures",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    cPictureSetId = table.Column<int>(nullable: true),
                    mPictureSet = table.Column<int>(nullable: false),
                    mURL = table.Column<string>(nullable: true),
                    mLegend = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dbPictures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_dbPictures_dbPictureSets_cPictureSetId",
                        column: x => x.cPictureSetId,
                        principalTable: "dbPictureSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_dbPictures_cPictureSetId",
                table: "dbPictures",
                column: "cPictureSetId");

            migrationBuilder.CreateIndex(
                name: "IX_dbPictureSets_cUserId",
                table: "dbPictureSets",
                column: "cUserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dbPictures");

            migrationBuilder.DropTable(
                name: "dbPictureSets");

            migrationBuilder.DropTable(
                name: "dbUsers");
        }
    }
}
