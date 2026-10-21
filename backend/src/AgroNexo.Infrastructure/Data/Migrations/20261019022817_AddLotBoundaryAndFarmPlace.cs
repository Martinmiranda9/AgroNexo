using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace AgroNexo.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLotBoundaryAndFarmPlace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Polygon>(
                name: "Boundary",
                table: "lots",
                type: "geometry(Polygon,4326)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "BoundaryEditedAt",
                table: "lots",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BoundaryEditedByProfessionalId",
                table: "lots",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByProfessionalId",
                table: "lots",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "farms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Locality",
                table: "farms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "farms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_lots_Boundary",
                table: "lots",
                column: "Boundary")
                .Annotation("Npgsql:IndexMethod", "gist");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_lots_Boundary",
                table: "lots");

            migrationBuilder.DropColumn(
                name: "Boundary",
                table: "lots");

            migrationBuilder.DropColumn(
                name: "BoundaryEditedAt",
                table: "lots");

            migrationBuilder.DropColumn(
                name: "BoundaryEditedByProfessionalId",
                table: "lots");

            migrationBuilder.DropColumn(
                name: "CreatedByProfessionalId",
                table: "lots");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "farms");

            migrationBuilder.DropColumn(
                name: "Locality",
                table: "farms");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "farms");
        }
    }
}
