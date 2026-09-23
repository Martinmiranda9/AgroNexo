using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace AgroConnect.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.CreateTable(
                name: "tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "producers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Auth0UserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DocumentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_producers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_producers_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "professionals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Auth0UserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DocumentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    Specialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CoverageArea = table.Column<Geometry>(type: "geometry", nullable: true),
                    YearsExperience = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    MaxCapacity = table.Column<int>(type: "integer", nullable: false, defaultValue: 20),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_professionals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_professionals_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "farms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProducerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Location = table.Column<Geometry>(type: "geometry", nullable: true),
                    TotalHectares = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_farms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_farms_producers_ProducerId",
                        column: x => x.ProducerId,
                        principalTable: "producers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_farms_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "match_discovery_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProducerId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationPoint = table.Column<Point>(type: "geometry", nullable: false),
                    RequestedSpecialty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RequiresFieldPresence = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_match_discovery_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_match_discovery_requests_producers_ProducerId",
                        column: x => x.ProducerId,
                        principalTable: "producers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "matches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProducerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_matches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_matches_producers_ProducerId",
                        column: x => x.ProducerId,
                        principalTable: "producers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_matches_professionals_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "professionals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "match_recommendations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MatchDiscoveryRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uuid", nullable: false),
                    Score = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: false),
                    RankPosition = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_match_recommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_match_recommendations_match_discovery_requests_MatchDiscove~",
                        column: x => x.MatchDiscoveryRequestId,
                        principalTable: "match_discovery_requests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_match_recommendations_professionals_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "professionals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_farms_ProducerId",
                table: "farms",
                column: "ProducerId");

            migrationBuilder.CreateIndex(
                name: "IX_farms_TenantId",
                table: "farms",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_match_discovery_requests_ProducerId",
                table: "match_discovery_requests",
                column: "ProducerId");

            migrationBuilder.CreateIndex(
                name: "IX_match_recommendations_MatchDiscoveryRequestId",
                table: "match_recommendations",
                column: "MatchDiscoveryRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_match_recommendations_ProfessionalId",
                table: "match_recommendations",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_ProducerId",
                table: "matches",
                column: "ProducerId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_ProducerId_ProfessionalId",
                table: "matches",
                columns: new[] { "ProducerId", "ProfessionalId" },
                unique: true,
                filter: "\"Status\" IN (1, 2)");

            migrationBuilder.CreateIndex(
                name: "IX_matches_ProfessionalId",
                table: "matches",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_Status",
                table: "matches",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_producers_Auth0UserId",
                table: "producers",
                column: "Auth0UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_producers_TenantId",
                table: "producers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_professionals_Auth0UserId",
                table: "professionals",
                column: "Auth0UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_professionals_CoverageArea",
                table: "professionals",
                column: "CoverageArea")
                .Annotation("Npgsql:IndexMethod", "GIST");

            migrationBuilder.CreateIndex(
                name: "IX_professionals_TenantId",
                table: "professionals",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "farms");

            migrationBuilder.DropTable(
                name: "match_recommendations");

            migrationBuilder.DropTable(
                name: "matches");

            migrationBuilder.DropTable(
                name: "match_discovery_requests");

            migrationBuilder.DropTable(
                name: "professionals");

            migrationBuilder.DropTable(
                name: "producers");

            migrationBuilder.DropTable(
                name: "tenants");
        }
    }
}
