using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroNexo.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProducerProvince : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "producers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Province",
                table: "producers");
        }
    }
}
