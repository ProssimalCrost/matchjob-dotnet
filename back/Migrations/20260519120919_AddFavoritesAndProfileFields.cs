using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MatchJob.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoritesAndProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReviewCount",
                table: "professional_profiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "favorites",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_favorites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_favorites_professional_profiles_ProfessionalProfileId",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "professional_profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_favorites_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_favorites_ProfessionalProfileId",
                table: "favorites",
                column: "ProfessionalProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_favorites_UserId_ProfessionalProfileId",
                table: "favorites",
                columns: new[] { "UserId", "ProfessionalProfileId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "favorites");

            migrationBuilder.DropColumn(
                name: "ReviewCount",
                table: "professional_profiles");
        }
    }
}
