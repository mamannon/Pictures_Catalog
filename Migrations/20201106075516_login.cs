using Microsoft.EntityFrameworkCore.Migrations;

namespace Picture_Catalog.Migrations
{
    public partial class login : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "mPassword",
                table: "dbUsers",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "mUsername",
                table: "dbUsers",
                nullable: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "mPassword",
                table: "dbUsers");

            migrationBuilder.DropColumn(
                name: "mUsername",
                table: "dbUsers");
        }
    }
}
