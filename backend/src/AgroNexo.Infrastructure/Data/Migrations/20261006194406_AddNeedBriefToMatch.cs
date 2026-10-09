using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroNexo.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNeedBriefToMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "NeedCrops",
                table: "matches",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NeedHectares",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NeedPlace",
                table: "matches",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NeedSummary",
                table: "matches",
                type: "character varying(600)",
                maxLength: 600,
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "NeedTopics",
                table: "matches",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NeedUrgency",
                table: "matches",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NeedCrops",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "NeedHectares",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "NeedPlace",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "NeedSummary",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "NeedTopics",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "NeedUrgency",
                table: "matches");
        }
    }
}
