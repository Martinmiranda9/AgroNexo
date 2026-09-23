using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroConnect.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProducerType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "PublicId",
                table: "professionals",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "ProducerType",
                table: "producers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "PublicId",
                table: "producers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "PublicId",
                table: "farms",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_professionals_PublicId",
                table: "professionals",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_producers_PublicId",
                table: "producers",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_farms_PublicId",
                table: "farms",
                column: "PublicId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_professionals_PublicId",
                table: "professionals");

            migrationBuilder.DropIndex(
                name: "IX_producers_PublicId",
                table: "producers");

            migrationBuilder.DropIndex(
                name: "IX_farms_PublicId",
                table: "farms");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "professionals");

            migrationBuilder.DropColumn(
                name: "ProducerType",
                table: "producers");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "producers");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "farms");
        }
    }
}
