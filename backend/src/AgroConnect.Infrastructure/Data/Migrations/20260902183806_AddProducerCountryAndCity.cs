using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroConnect.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProducerCountryAndCity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "producers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "producers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "producers");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "producers");
        }
    }
}
