using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroNexo.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddContactAndCredentialFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LicenseNumber",
                table: "professionals",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "professionals",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "HectaresRange",
                table: "producers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int[]>(
                name: "LookingFor",
                table: "producers",
                type: "integer[]",
                nullable: false,
                defaultValue: new int[0]);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "producers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LicenseNumber",
                table: "professionals");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "professionals");

            migrationBuilder.DropColumn(
                name: "HectaresRange",
                table: "producers");

            migrationBuilder.DropColumn(
                name: "LookingFor",
                table: "producers");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "producers");
        }
    }
}
