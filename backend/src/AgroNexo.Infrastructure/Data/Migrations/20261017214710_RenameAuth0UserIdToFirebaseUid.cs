using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroNexo.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameAuth0UserIdToFirebaseUid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Auth0UserId",
                table: "professionals",
                newName: "FirebaseUid");

            migrationBuilder.RenameIndex(
                name: "IX_professionals_Auth0UserId",
                table: "professionals",
                newName: "IX_professionals_FirebaseUid");

            migrationBuilder.RenameColumn(
                name: "Auth0UserId",
                table: "producers",
                newName: "FirebaseUid");

            migrationBuilder.RenameIndex(
                name: "IX_producers_Auth0UserId",
                table: "producers",
                newName: "IX_producers_FirebaseUid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FirebaseUid",
                table: "professionals",
                newName: "Auth0UserId");

            migrationBuilder.RenameIndex(
                name: "IX_professionals_FirebaseUid",
                table: "professionals",
                newName: "IX_professionals_Auth0UserId");

            migrationBuilder.RenameColumn(
                name: "FirebaseUid",
                table: "producers",
                newName: "Auth0UserId");

            migrationBuilder.RenameIndex(
                name: "IX_producers_FirebaseUid",
                table: "producers",
                newName: "IX_producers_Auth0UserId");
        }
    }
}
